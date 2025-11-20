import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assistant, AssistantStatus, VoiceProvider, ModelProvider } from './entities/assistant.entity';
import { Business } from '../business/entities/business.entity';
import { CreateAssistantDto, UpdateAssistantDto } from './dto/assistant.dto';
import { DEFAULT_ASSISTANT_CONFIG } from './constants/assistant-config';
import { getPromptForIndustry, BusinessData } from './constants/industry-prompts';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    @InjectRepository(Assistant)
    private assistantRepository: Repository<Assistant>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async createAssistant(createAssistantDto: CreateAssistantDto, userId: string): Promise<Assistant> {
    try {
      // Verificar que el business existe
      const business = await this.businessRepository.findOne({
        where: { id: createAssistantDto.business_id }
      });

      if (!business) {
        throw new NotFoundException('Business not found');
      }

      // Verificar que el business no tenga ya un asistente
      const existingAssistant = await this.assistantRepository.findOne({
        where: { business_id: createAssistantDto.business_id }
      });

      if (existingAssistant) {
        throw new ConflictException('Business already has an assistant');
      }

      this.logger.log('Creating assistant with DTO:', JSON.stringify(createAssistantDto, null, 2));
      this.logger.log('VAPI Assistant ID from DTO:', createAssistantDto.vapi_assistant_id);

      // Crear el asistente con configuración por defecto
      const assistant = this.assistantRepository.create({
        business_id: createAssistantDto.business_id,
        name: createAssistantDto.name || DEFAULT_ASSISTANT_CONFIG.name,
        prompt: createAssistantDto.prompt || DEFAULT_ASSISTANT_CONFIG.prompt,
        first_message: createAssistantDto.first_message || DEFAULT_ASSISTANT_CONFIG.first_message,
        vapi_assistant_id: createAssistantDto.vapi_assistant_id || null,
        vapi_public_key: createAssistantDto.vapi_public_key || null,
        voice_id: createAssistantDto.voice_id || DEFAULT_ASSISTANT_CONFIG.voice_id,
        voice_provider: createAssistantDto.voice_provider || DEFAULT_ASSISTANT_CONFIG.voice_provider,
        language: createAssistantDto.language || DEFAULT_ASSISTANT_CONFIG.language,
        model_provider: createAssistantDto.model_provider || DEFAULT_ASSISTANT_CONFIG.model_provider,
        model_name: createAssistantDto.model_name || DEFAULT_ASSISTANT_CONFIG.model_name,
        tools: createAssistantDto.tools || DEFAULT_ASSISTANT_CONFIG.tools,
        required_fields: createAssistantDto.required_fields || DEFAULT_ASSISTANT_CONFIG.required_fields,
        server_url: createAssistantDto.server_url,
        server_url_secret: createAssistantDto.server_url_secret,
        status: createAssistantDto.status || DEFAULT_ASSISTANT_CONFIG.status,
        created_by: userId
      });

      this.logger.log('Assistant entity created with vapi_assistant_id:', assistant.vapi_assistant_id);

      const savedAssistant = await this.assistantRepository.save(assistant);
      
      this.logger.log(`Assistant created successfully: ${savedAssistant.id}`);
      this.logger.log('Saved assistant vapi_assistant_id:', savedAssistant.vapi_assistant_id);
      return savedAssistant;

    } catch (error) {
      this.logger.error('Error creating assistant:', error);
      throw error;
    }
  }

  async getAssistantByBusinessId(businessId: string): Promise<Assistant> {
    const assistant = await this.assistantRepository.findOne({
      where: { business_id: businessId },
      relations: ['business', 'creator']
    });

    if (!assistant) {
      throw new NotFoundException('Assistant not found for this business');
    }

    return assistant;
  }

  async findByVapiAssistantId(vapiAssistantId: string): Promise<Assistant | null> {
    return this.assistantRepository.findOne({
      where: { vapi_assistant_id: vapiAssistantId }
    });
  }

  async updateAssistant(businessId: string, updateAssistantDto: UpdateAssistantDto): Promise<Assistant> {
    const assistant = await this.getAssistantByBusinessId(businessId);
    
    Object.assign(assistant, updateAssistantDto);
    
    const updatedAssistant = await this.assistantRepository.save(assistant);
    
    this.logger.log(`Assistant updated successfully: ${updatedAssistant.id}`);
    return updatedAssistant;
  }

  async deleteAssistant(businessId: string): Promise<void> {
    const assistant = await this.getAssistantByBusinessId(businessId);
    
    await this.assistantRepository.remove(assistant);
    
    this.logger.log(`Assistant deleted successfully for business: ${businessId}`);
  }

  async activateAssistant(businessId: string): Promise<Assistant> {
    return this.updateAssistant(businessId, { status: AssistantStatus.ACTIVE });
  }

  async deactivateAssistant(businessId: string): Promise<Assistant> {
    return this.updateAssistant(businessId, { status: AssistantStatus.INACTIVE });
  }

  async getAssistantTools(businessId: string): Promise<any[]> {
    const assistant = await this.getAssistantByBusinessId(businessId);
    return assistant.tools || [];
  }

  async updateAssistantTools(businessId: string, tools: any[]): Promise<Assistant> {
    return this.updateAssistant(businessId, { tools });
  }

  /**
   * Genera un prompt personalizado basado en la industria y datos del negocio
   */
  async getPersonalizedPromptForBusiness(businessId: string, requiredFields?: (string | { name: string; type: string; label: string })[]): Promise<string> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId }
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const businessData: BusinessData = {
      name: business.name,
      industry: business.industry,
      phone_number: business.phone_number,
      address: business.address,
      email: business.email,
      website: business.website,
      business_hours: business.business_hours,
      services: business.services,
      required_fields: requiredFields, // Usar los campos pasados como parámetro
    };

    // Detectar idioma del assistant si existe (es-AR por defecto)
    let assistantLanguage = 'es-AR';
    try {
      const assistant = await this.getAssistantByBusinessId(businessId);
      if (assistant?.language) assistantLanguage = assistant.language;
    } catch {}

    return getPromptForIndustry(business.industry, businessData, assistantLanguage);
  }
}
