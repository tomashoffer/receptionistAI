import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssistantConfiguration } from './entities/assistant-configuration.entity';
import { CreateAssistantConfigDto, UpdateAssistantConfigDto } from './dto/assistant-config.dto';
import { ConfigValidatorFactory } from './validators/validator-factory';
import { Industry } from '../business/entities/business.entity';

@Injectable()
export class AssistantConfigService {
  constructor(
    @InjectRepository(AssistantConfiguration)
    private readonly configRepository: Repository<AssistantConfiguration>,
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

    // Crear la configuración
    const config = this.configRepository.create({
      business_id: createDto.business_id,
      industry: createDto.industry,
      prompt: createDto.prompt,
      config_data: createDto.config_data,
      created_by: userId,
      version: 1,
    });

    return await this.configRepository.save(config);
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

    config.updated_at = new Date();

    return await this.configRepository.save(config);
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

