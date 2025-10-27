import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/entities/business.entity';
import { Assistant } from '../assistant/entities/assistant.entity';
import { CallLog, CallDirection, CallStatus } from '../business/entities/call-log.entity';

@Injectable()
export class TestAssistantService {
  private readonly logger = new Logger(TestAssistantService.name);

  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Assistant)
    private assistantRepository: Repository<Assistant>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
  ) {}

  async getBusinessConfig(businessId: string): Promise<{
    vapi_assistant_id: string;
    vapi_public_key: string;
    ai_prompt: string;
    ai_voice_id: string;
    ai_language: string;
    business_hours: any;
    services: any[];
  }> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['assistant']
    });

    if (!business) {
      throw new Error('Negocio no encontrado');
    }

    // Si no hay asistente configurado, retornar configuración por defecto
    if (!business.assistant) {
      return {
        vapi_assistant_id: null,
        vapi_public_key: null,
        ai_prompt: 'Eres un asistente de voz amigable y profesional.',
        ai_voice_id: 'es-ES-ElviraNeural',
        ai_language: 'es-ES',
        business_hours: business.business_hours,
        services: business.services || [],
      };
    }

    return {
      vapi_assistant_id: business.assistant.vapi_assistant_id,
      vapi_public_key: business.assistant.vapi_public_key,
      ai_prompt: business.assistant.prompt,
      ai_voice_id: business.assistant.voice_id,
      ai_language: business.assistant.language,
      business_hours: business.business_hours,
      services: business.services || [],
    };
  }

  async updateBusinessConfig(businessId: string, config: {
    ai_prompt?: string;
    ai_voice_id?: string;
    ai_language?: string;
    business_hours?: any;
    services?: any[];
  }): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new Error('Negocio no encontrado');
    }

    // Actualizar configuración
    Object.assign(business, config);
    
    const updatedBusiness = await this.businessRepository.save(business);
    
    this.logger.log(`Configuración actualizada para negocio ${businessId}`);
    
    return updatedBusiness;
  }

  async createTestCallLog(businessId: string, testData: {
    caller_number: string;
    duration_seconds: number;
    transcription: string;
    ai_responses: any[];
    outcome: string;
    extracted_data: any;
  }): Promise<CallLog> {
    const callLog = this.callLogRepository.create({
      business_id: businessId,
      call_sid: `test_${Date.now()}`,
      caller_number: testData.caller_number,
      called_number: 'test_number',
      direction: CallDirection.INBOUND,
      status: CallStatus.COMPLETED,
      duration_seconds: testData.duration_seconds,
      started_at: new Date(),
      ended_at: new Date(),
      transcription: testData.transcription,
      ai_responses: testData.ai_responses,
      outcome: testData.outcome,
      extracted_data: testData.extracted_data,
      cost_usd: 0,
      ai_tokens_used: 0,
    });

    const savedCallLog = await this.callLogRepository.save(callLog);
    
    this.logger.log(`Test call log creado: ${savedCallLog.id}`);
    
    return savedCallLog;
  }

  async getTestCallLogs(businessId: string, limit: number = 10): Promise<CallLog[]> {
    return this.callLogRepository.find({
      where: { 
        business_id: businessId,
        call_sid: 'test_%' // Solo logs de test
      },
      order: { started_at: 'DESC' },
      take: limit,
    });
  }
}
