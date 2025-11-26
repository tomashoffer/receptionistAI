import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { AssistantConfiguration } from './entities/assistant-configuration.entity';
import { CreateAssistantConfigDto, UpdateAssistantConfigDto } from './dto/assistant-config.dto';
import { ConfigValidatorFactory } from './validators/validator-factory';
import { Industry } from '../business/entities/business.entity';
import { VoicePromptGeneratorService } from './services/voice-prompt-generator.service';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class AssistantConfigService {
  private readonly logger = new Logger(AssistantConfigService.name);

  constructor(
    @InjectRepository(AssistantConfiguration)
    private readonly configRepository: Repository<AssistantConfiguration>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectQueue('knowledge-base-sync') private syncQueue: Queue,
    private readonly voicePromptGenerator: VoicePromptGeneratorService,
  ) {}

  async create(
    createDto: CreateAssistantConfigDto,
    userId: string,
  ): Promise<AssistantConfiguration> {
    // Validar que el business existe y pertenece al usuario
    // (esto se puede hacer con un guard o en el controller)

    // Validar la estructura según el industry
    const validator = ConfigValidatorFactory.getValidator(createDto.industry);
    const validationResult = validator.validate(createDto.config_data);

    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Invalid configuration data',
        errors: validationResult.errors,
      });
    }

    // Obtener datos del negocio para generar prompts
    const business = await this.businessRepository.findOne({
      where: { id: createDto.business_id },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${createDto.business_id} not found`);
    }

    // Crear la configuración
    const config = this.configRepository.create({
      business_id: createDto.business_id,
      industry: createDto.industry,
      prompt: createDto.prompt,
      config_data: createDto.config_data,
      behaviorConfig: createDto.behavior_config || {},
      created_by: userId,
      version: 1,
    });

    const savedConfig = await this.configRepository.save(config);

    // Generar prompt_voice automáticamente si no es custom
    if (!createDto.prompt_voice || !createDto.is_custom_prompt_voice) {
      try {
        const businessData = this.mapBusinessToBusinessData(business);
        const promptVoice = this.voicePromptGenerator.generateVoicePrompt(businessData, savedConfig);
        
        savedConfig.prompt_voice = promptVoice;
        savedConfig.prompt_voice_source = 'auto';
        savedConfig.is_custom_prompt_voice = false;
        
        await this.configRepository.save(savedConfig);
        this.logger.log(`✅ Generated prompt_voice automatically for config ${savedConfig.id}`);
      } catch (error) {
        this.logger.error(`Error generating prompt_voice: ${error.message}`, error.stack);
        // No fallar la creación si falla la generación del prompt
      }
    } else {
      // Si viene prompt_voice custom, guardarlo
      savedConfig.prompt_voice = createDto.prompt_voice;
      savedConfig.prompt_voice_source = 'manual';
      savedConfig.is_custom_prompt_voice = true;
      await this.configRepository.save(savedConfig);
    }

    // Encolar job de sync de knowledge base si hay config_data
    // Esto asegura que los archivos se generen y sincronicen con Vapi cuando se crea la configuración
    if (createDto.config_data) {
      await this.syncQueue.add(
        'sync',
        { assistantConfigId: savedConfig.id },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
      this.logger.log(`📋 Job de sync de knowledge base encolado para nueva configuración ${savedConfig.id}`);
    }

    return savedConfig;
  }

  async findOne(id: string): Promise<AssistantConfiguration> {
    const config = await this.configRepository.findOne({
      where: { id },
      relations: ['business', 'creator'],
    });

    if (!config) {
      throw new NotFoundException(`Assistant configuration with ID ${id} not found`);
    }

    return config;
  }

  async findByBusinessId(businessId: string): Promise<AssistantConfiguration | null> {
    return await this.configRepository.findOne({
      where: { business_id: businessId },
      relations: ['business', 'creator'],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateAssistantConfigDto,
    userId: string,
  ): Promise<AssistantConfiguration> {
    const config = await this.findOne(id);

    // Si se actualiza config_data, validar según el industry
    if (updateDto.config_data) {
      const validator = ConfigValidatorFactory.getValidator(config.industry);
      
      // Mergear profundamente con la data existente para validar la estructura completa
      const mergedData = this.deepMerge(config.config_data, updateDto.config_data);

      const validationResult = validator.validate(mergedData);

      if (!validationResult.isValid) {
        throw new BadRequestException({
          message: 'Invalid configuration data',
          errors: validationResult.errors,
        });
      }

      config.config_data = mergedData as typeof config.config_data;
    }

    if (updateDto.prompt) {
      config.prompt = updateDto.prompt;
    }

    // Si se actualiza behavior_config, hacer merge profundo
    if (updateDto.behavior_config) {
      config.behaviorConfig = this.deepMerge(
        config.behaviorConfig || {},
        updateDto.behavior_config
      );
    }

    // Generar prompt_voice automáticamente si cambió config_data o prompt y no es custom
    const shouldRegenerateVoicePrompt = 
      (updateDto.config_data || updateDto.prompt) && 
      !config.is_custom_prompt_voice &&
      !updateDto.is_custom_prompt_voice;

    if (shouldRegenerateVoicePrompt) {
      try {
        const business = await this.businessRepository.findOne({
          where: { id: config.business_id },
        });

        if (business) {
          const businessData = this.mapBusinessToBusinessData(business);
          const promptVoice = this.voicePromptGenerator.generateVoicePrompt(businessData, config);
          
          config.prompt_voice = promptVoice;
          config.prompt_voice_source = 'auto';
          this.logger.log(`✅ Regenerated prompt_voice automatically for config ${config.id}`);
        }
      } catch (error) {
        this.logger.error(`Error regenerating prompt_voice: ${error.message}`, error.stack);
        // No fallar la actualización si falla la generación del prompt
      }
    }

    // Si viene prompt_voice explícito, actualizarlo
    if (updateDto.prompt_voice !== undefined) {
      config.prompt_voice = updateDto.prompt_voice;
      config.prompt_voice_source = updateDto.is_custom_prompt_voice ? 'manual' : 'auto';
      config.is_custom_prompt_voice = updateDto.is_custom_prompt_voice || false;
    }

    config.updated_at = new Date();

    const updated = await this.configRepository.save(config);

    // Encolar job de sync de knowledge base (asíncrono)
    // ⚠️ IMPORTANTE: Solo sincronizar KB si cambió config_data (conocimiento)
    // NO sincronizar si solo cambió behavior_config (comportamiento)
    // behavior_config se integra en el prompt dinámicamente, no genera archivos KB
    if (updateDto.config_data) {
      await this.syncQueue.add(
        'sync',
        { assistantConfigId: id },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
      this.logger.log(`📋 Job de sync de knowledge base encolado por cambio en config_data (config: ${id})`);
    } else if (updateDto.behavior_config) {
      this.logger.log(`ℹ️ behavior_config actualizado (config: ${id}). No se sincroniza KB (solo se actualiza en el prompt dinámicamente).`);
    }

    return updated;
  }

  /**
   * Mapea Business entity a BusinessData para el generador de prompts
   */
  private mapBusinessToBusinessData(business: Business): any {
    return {
      name: business.name,
      industry: business.industry,
      phone_number: business.phone_number,
      address: business.address,
      email: business.email,
      website: business.website,
      business_hours: business.business_hours,
      services: business.services || [],
      required_fields: ['name', 'email', 'phone', 'service', 'date', 'time'],
    };
  }

  /**
   * Realiza un merge profundo de objetos
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else if (Array.isArray(source[key])) {
          // Para arrays, reemplazamos completamente si viene en el update
          output[key] = source[key];
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  async delete(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.configRepository.remove(config);
  }

  async findAllByBusiness(businessId: string): Promise<AssistantConfiguration[]> {
    return await this.configRepository.find({
      where: { business_id: businessId },
      relations: ['business', 'creator'],
      order: { created_at: 'DESC' },
    });
  }
}

