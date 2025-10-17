import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoiceInteractionEntity } from './voice-interaction.entity';
import { ProcessVoiceDto, VoiceResponseDto } from './dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { CreateAppointmentDto } from '../appointments/dto';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { VoiceIntentType } from '../../constants/voice-types';
import axios from 'axios';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private openai: OpenAI;

  constructor(
    @InjectRepository(VoiceInteractionEntity)
    private voiceInteractionRepository: Repository<VoiceInteractionEntity>,
    private appointmentsService: AppointmentsService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processVoiceCommand(audioBuffer: Buffer, filename: string, sessionId?: string): Promise<VoiceResponseDto> {
    const startTime = Date.now();
    
    try {
      console.log('🎤 Processing voice command:', { filename, sessionId, bufferSize: audioBuffer?.length });
      
      // Transcribir audio
      console.log('📝 Starting transcription...');
      const transcription = await this.transcribeAudio(audioBuffer, filename);
      console.log('✅ Transcription completed:', transcription);
      
      // Extraer intención con GPT
      console.log('🧠 Extracting intent with GPT...');
      const intent = await this.extractIntentWithGPT(transcription);
      console.log('✅ Intent extracted:', intent);
      
      // Generar respuesta
      console.log('💬 Generating response...');
      const response = await this.generateResponse(intent);
      console.log('✅ Response generated:', response);
      
      // Crear registro de interacción
      const voiceInteraction = this.voiceInteractionRepository.create({
        sessionId: sessionId || `session_${Date.now()}`,
        transcription,
        intent: JSON.stringify(intent),
        response,
        confidence: intent.confidence || 0.8,
        intentType: intent.type || VoiceIntentType.GREETING,
        status: 'success',
        audioFilePath: filename,
        processingTimeMs: Date.now() - startTime,
      });

      const savedInteraction = await this.voiceInteractionRepository.save(voiceInteraction);

      // Si es una intención de agendar, crear la cita automáticamente
      if (intent.type === VoiceIntentType.SCHEDULE && intent.entities) {
        try {
          const appointmentDto = this.extractAppointmentEntities(intent.entities);
          const appointment = await this.appointmentsService.create(appointmentDto);
          savedInteraction.appointmentId = appointment.id;
          await this.voiceInteractionRepository.save(savedInteraction);
        } catch (error) {
          this.logger.error('Error creando cita automáticamente:', error);
        }
      }

      return {
        id: savedInteraction.id,
        sessionId: savedInteraction.sessionId,
        transcription: savedInteraction.transcription,
        intent: JSON.parse(savedInteraction.intent),
        response: savedInteraction.response,
        confidence: savedInteraction.confidence,
        intentType: savedInteraction.intentType,
        status: savedInteraction.status,
        appointmentId: savedInteraction.appointmentId,
        createdAt: savedInteraction.createdAt,
        updatedAt: savedInteraction.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error procesando comando de voz:', error);
      throw error;
    }
  }

  async processTextCommand(processVoiceDto: ProcessVoiceDto): Promise<VoiceResponseDto> {
    const startTime = Date.now();
    
    try {
      const { text, sessionId } = processVoiceDto;
      
      // Extraer intención con GPT
      const intent = await this.extractIntentWithGPT(text);
      
      // Generar respuesta
      const response = await this.generateResponse(intent);
      
      // Crear registro de interacción
      const voiceInteraction = this.voiceInteractionRepository.create({
        sessionId: sessionId || `session_${Date.now()}`,
        transcription: text,
        intent: JSON.stringify(intent),
        response,
        confidence: intent.confidence || 0.8,
        intentType: intent.type || VoiceIntentType.GREETING,
        status: 'success',
        processingTimeMs: Date.now() - startTime,
      });

      const savedInteraction = await this.voiceInteractionRepository.save(voiceInteraction);

      // Si es una intención de agendar, crear la cita automáticamente
      if (intent.type === VoiceIntentType.SCHEDULE && intent.entities) {
        try {
          const appointmentDto = this.extractAppointmentEntities(intent.entities);
          const appointment = await this.appointmentsService.create(appointmentDto);
          savedInteraction.appointmentId = appointment.id;
          await this.voiceInteractionRepository.save(savedInteraction);
        } catch (error) {
          this.logger.error('Error creando cita automáticamente:', error);
        }
      }

      return {
        id: savedInteraction.id,
        sessionId: savedInteraction.sessionId,
        transcription: savedInteraction.transcription,
        intent: JSON.parse(savedInteraction.intent),
        response: savedInteraction.response,
        confidence: savedInteraction.confidence,
        intentType: savedInteraction.intentType,
        status: savedInteraction.status,
        appointmentId: savedInteraction.appointmentId,
        createdAt: savedInteraction.createdAt,
        updatedAt: savedInteraction.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error procesando comando de texto:', error);
      throw error;
    }
  }

  private async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
    try {
      // Crear archivo temporal
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, filename);
      fs.writeFileSync(tempFilePath, audioBuffer);

      // Transcribir con OpenAI Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'es', // Español
      });

      // Limpiar archivo temporal
      fs.unlinkSync(tempFilePath);

      return transcription.text;
    } catch (error) {
      this.logger.error('Error transcribiendo audio:', error);
      throw error;
    }
  }

  private async extractIntentWithGPT(transcription: string): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente de recepcionista AI especializado en agendar citas médicas. Analiza el siguiente texto y extrae la intención del usuario con la máxima precisión posible.

Tipos de intención posibles (usa EXACTAMENTE estos valores):
- greeting: Saludo inicial
- schedule: Quiere agendar una cita
- cancel: Quiere cancelar una cita
- query: Consulta sobre citas existentes
- goodbye: Despedida

Para extraer datos del cliente, analiza cuidadosamente:
- NOMBRE: Busca nombres propios, "me llamo", "soy", "mi nombre es"
- TELÉFONO: Busca números de teléfono, "mi teléfono es", "llámame al"
- EMAIL: Busca direcciones de email, "mi email es", "envíame a"
- SERVICIO: Busca tipo de consulta, "consulta médica", "revisión", "emergencia", "especialista"
- FECHA: Busca fechas específicas, "mañana", "el lunes", "el 15 de enero", "próxima semana"
- HORA: Busca horarios específicos, "a las 3", "por la mañana", "a las 2 de la tarde"

Responde SOLO con un JSON válido en este formato:
{
  "type": "schedule",
  "confidence": 0.9,
  "entities": {
    "clientName": "Juan Pérez",
    "clientPhone": "1234567890",
    "clientEmail": "juan@email.com",
    "serviceType": "Consulta médica",
    "appointmentDate": "2024-01-15",
    "appointmentTime": "10:00",
    "notes": "Primera consulta"
  }
}

IMPORTANTE:
- Si no encuentras datos específicos, usa valores por defecto razonables
- Para fechas relativas, calcula la fecha real basándote en la fecha actual
- "mañana" = fecha actual + 1 día
- "viernes" = próximo viernes desde hoy
- "el lunes" = próximo lunes desde hoy
- "próxima semana" = lunes de la próxima semana
- Para horarios como "por la tarde", usa horarios específicos (14:00, 15:00, etc.)
- "10 de la mañana" = 10:00
- "2 de la tarde" = 14:00
- "3 de la tarde" = 15:00
- Siempre incluye todos los campos requeridos
- FECHA ACTUAL: ${new Date().toISOString().split('T')[0]} (usa esta como referencia)`,
          },
          {
            role: 'user',
            content: transcription,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      this.logger.log(`GPT Response: ${content}`);
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Error extrayendo intención con GPT:', error);
      this.logger.error('Error details:', error.message);
      // Fallback a análisis básico
      return this.extractIntent(transcription);
    }
  }

  private extractIntent(transcription: string): any {
    const text = transcription.toLowerCase();
    
    if (text.includes('agendar') || text.includes('cita') || text.includes('turno')) {
      return {
        type: VoiceIntentType.SCHEDULE,
        confidence: 0.7,
        entities: this.extractAppointmentEntities({}),
      };
    }
    
    if (text.includes('cancelar') || text.includes('anular')) {
      return {
        type: VoiceIntentType.CANCEL,
        confidence: 0.7,
        entities: {},
      };
    }
    
    if (text.includes('consulta') || text.includes('ver') || text.includes('buscar')) {
      return {
        type: VoiceIntentType.QUERY,
        confidence: 0.7,
        entities: {},
      };
    }
    
    if (text.includes('adiós') || text.includes('chau') || text.includes('hasta luego')) {
      return {
        type: VoiceIntentType.GOODBYE,
        confidence: 0.8,
        entities: {},
      };
    }
    
    return {
      type: VoiceIntentType.GREETING,
      confidence: 0.6,
      entities: {},
    };
  }

  private extractAppointmentEntities(entities: any): CreateAppointmentDto {
    return {
      clientName: entities.clientName || 'Cliente',
      clientPhone: entities.clientPhone || '0000000000',
      clientEmail: entities.clientEmail || 'cliente@email.com',
      serviceType: entities.serviceType || 'Consulta general',
      appointmentDate: entities.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: entities.appointmentTime || '09:00',
      notes: entities.notes || 'Cita creada por voz AI',
    };
  }

  private async generateResponse(intent: any): Promise<string> {
    switch (intent.type) {
      case VoiceIntentType.GREETING:
        return '¡Hola! Soy tu recepcionista AI. ¿En qué puedo ayudarte hoy? Puedo agendar citas, consultar horarios disponibles o ayudarte con cualquier consulta.';
      
      case VoiceIntentType.SCHEDULE:
        return 'Perfecto, he procesado tu solicitud de cita. Te confirmo que la cita ha sido agendada exitosamente. Te enviaremos un recordatorio por email. ¿Hay algo más en lo que pueda ayudarte?';
      
      case VoiceIntentType.CANCEL:
        return 'Entiendo que quieres cancelar una cita. Para procesar la cancelación, necesito más información. ¿Podrías proporcionarme tu nombre o número de teléfono?';
      
      case VoiceIntentType.QUERY:
        return 'Te ayudo a consultar tus citas. ¿Podrías proporcionarme tu nombre o número de teléfono para buscar tu información?';
      
      case VoiceIntentType.GOODBYE:
        return '¡Hasta luego! Que tengas un excelente día. Si necesitas algo más, no dudes en contactarnos.';
      
      default:
        return 'No estoy seguro de cómo ayudarte con esa solicitud. ¿Podrías ser más específico? Puedo ayudarte a agendar citas, consultar horarios o cancelar citas existentes.';
    }
  }

  async generateSpeech(text: string): Promise<Buffer> {
    try {
      console.log('🎵 Generating speech for text:', text.substring(0, 50) + '...');
      
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Voz femenina natural
        input: text,
        response_format: 'mp3',
        speed: 1.0, // Velocidad normal
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      console.log('✅ Speech generated successfully, size:', buffer.length);
      
      return buffer;
    } catch (error) {
      console.error('❌ Error generating speech:', error);
      throw error;
    }
  }

  async getStatus(): Promise<any> {
    return {
      status: 'active',
      message: 'Servicio de voz AI funcionando correctamente',
      availableServices: ['Agendar citas', 'Consultar horarios', 'Cancelar citas', 'Información general'],
    };
  }

  async getInteractionHistory(sessionId?: string): Promise<VoiceInteractionEntity[]> {
    const query: any = {};
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    return this.voiceInteractionRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * Generar audio usando ElevenLabs TTS
   */
  async generateSpeechWithElevenLabs(text: string): Promise<Buffer> {
    try {
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      const voiceId = process.env.ELEVENLABS_VOICE_ID || 'vqoh9orw2tmOS3mY7D2p'; // Voz por defecto
      
      if (!elevenLabsApiKey) {
        this.logger.warn('ELEVENLABS_API_KEY no está configurada, usando OpenAI TTS como fallback');
        return this.generateSpeech(text);
      }

      console.log('🎵 Generando audio con ElevenLabs para:', text.substring(0, 50) + '...');

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      const audioBuffer = Buffer.from(response.data);
      console.log('✅ Audio generado con ElevenLabs, tamaño:', audioBuffer.length);
      
      return audioBuffer;
    } catch (error) {
      console.error('❌ Error generando audio con ElevenLabs:', error);
      throw error;
    }
  }
}

