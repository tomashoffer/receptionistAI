import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { ALL_VOICES, SPANISH_VOICES, ENGLISH_VOICES, DEFAULT_SPANISH_VOICE_ID, DEFAULT_ENGLISH_VOICE_ID, Voice, getVoicesByLanguage, AVAILABLE_LANGUAGES, AVAILABLE_PROVIDERS } from './constants/elevenlabs-voices';
import { AssistantService } from '../assistant/assistant.service';
import { VoiceProvider, ModelProvider, AssistantStatus } from '../assistant/entities/assistant.entity';

@Injectable()
export class ElevenlabsService {
  private readonly logger = new Logger(ElevenlabsService.name);
  private readonly elevenlabsApiKey: string;
  private readonly elevenlabsBaseUrl = 'https://api.elevenlabs.io';

  constructor(
    private configService: ConfigService,
    private assistantService: AssistantService
  ) {
    this.elevenlabsApiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    if (!this.elevenlabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }
  }

  private getValidVoice(voiceId?: string, provider?: string): Voice | null {
    if (!voiceId) {
      return null;
    }

    const voice = ALL_VOICES.find(v => v.id === voiceId);
    if (!voice) {
      return null;
    }

    if (provider && voice.provider !== provider) {
      return null;
    }

    return voice;
  }

  async createAssistant(createAssistantDto: CreateAssistantDto, userId: string) {
    try {
      this.logger.log('User ID recibido:', userId);
      this.logger.log('DTO recibido:', JSON.stringify(createAssistantDto, null, 2));

      // Obtener la voz por defecto según el idioma
      const language = createAssistantDto.language || 'es';
      const defaultVoice = language === 'es' ? SPANISH_VOICES[0] : ENGLISH_VOICES[0];
      
      // El frontend puede enviar 'voice' o 'voice_id'
      const voiceId = createAssistantDto.voice || createAssistantDto.voice_id;
      const selectedVoice = voiceId 
        ? ALL_VOICES.find(v => v.id === voiceId) || defaultVoice
        : defaultVoice;

      this.logger.log('Voice ID from DTO:', voiceId);
      this.logger.log('Selected voice:', selectedVoice.name);

      // Crear assistant en ElevenLabs Conversational AI
      // Según la documentación: POST /v1/convai/agents/create
      const firstMessage = createAssistantDto.firstMessage || createAssistantDto.first_message || '¡Hola! ¿En qué puedo ayudarte?';
      
      // Construir la URL del webhook
      const webhookUrl = this.buildWebhookUrl(createAssistantDto.business_id || createAssistantDto.businessId);
      
      // 1️⃣ PRIMERO crear la Tool
      this.logger.log('🚀 Creando tool en ElevenLabs...');
      let toolId;
      
      const toolResponse = await axios.post(
        `${this.elevenlabsBaseUrl}/v1/convai/tools`,
        {
          tool_config: {
            type: 'webhook',
            name: 'schedule_appointment',
            description: 'Crea una cita en el sistema cuando el cliente proporciona todos los datos necesarios',
            response_timeout_secs: 30,
            disable_interruptions: false,
            force_pre_tool_speech: false,
            tool_call_sound: 'typing',
            tool_call_sound_behavior: 'auto',
            api_schema: {
              url: webhookUrl,
              method: 'POST',
              request_body_schema: {
                type: 'object',
                required: ['client_name', 'client_email', 'client_phone', 'service_type', 'appointment_date', 'appointment_time'],
                description: 'Datos del cliente y la cita',
                properties: {
                  client_name: { type: 'string', description: 'Nombre completo del cliente' },
                  client_email: { type: 'string', description: 'Email del cliente' },
                  client_phone: { type: 'string', description: 'Teléfono del cliente' },
                  service_type: { type: 'string', description: 'Tipo de servicio' },
                  appointment_date: { type: 'string', description: 'Fecha YYYY-MM-DD' },
                  appointment_time: { type: 'string', description: 'Hora HH:MM 24h' },
                  notes: { type: 'string', description: 'Notas opcionales' }
                }
              }
            }
          }
        },
        {
          headers: {
            'xi-api-key': this.elevenlabsApiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toolId = toolResponse.data.id;
      this.logger.log(`✅ Tool creada exitosamente: ${toolId}`);
      
      if (!toolId) {
        throw new Error('No se pudo crear la tool en ElevenLabs');
      }

      // 2️⃣ AHORA crear el Agent con la tool asociada
      this.logger.log(`🚀 Creando agent en ElevenLabs con tool_id: ${toolId}`);
      const elevenlabsAgentData = {
        name: createAssistantDto.name || 'Recepcionista AI',
        conversation_config: {
          agent: {
            first_message: firstMessage,
            language: language === 'es' ? 'es' : 'en',
            prompt: {
              prompt: this.buildPromptWithTools((createAssistantDto.prompt || '').substring(0, 1000), webhookUrl),
              llm: 'gpt-4o-mini',
              // Asociar la tool directamente en el agent
              ...(toolId ? { tool_ids: [toolId] } : {})
            }
          },
          tts: {
            model_id: 'eleven_turbo_v2_5',
            voice_id: selectedVoice.id
          }
        }
      };

      this.logger.log('ElevenLabs agent payload:', JSON.stringify(elevenlabsAgentData, null, 2));

      // Llamada a la API de ElevenLabs
      let elevenlabsResponse;
      try {
        elevenlabsResponse = await axios.post(
          `${this.elevenlabsBaseUrl}/v1/convai/agents/create`,
          elevenlabsAgentData,
          {
            headers: {
              'xi-api-key': this.elevenlabsApiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        this.logger.log('ElevenLabs agent created successfully:', elevenlabsResponse.data);
        
        if (toolId) {
          this.logger.log(`✅ Tool ${toolId} asociada al agent ${elevenlabsResponse.data.agent_id} en el payload`);
        }
        
      } catch (apiError: any) {
        // Si falla por permisos, crear solo localmente por ahora
        if (apiError?.response?.status === 401 || apiError?.response?.status === 403) {
          this.logger.warn('API key sin permisos de Conversational AI. Creando assistant solo localmente.');
          elevenlabsResponse = {
            data: {
              agent_id: `elevenlabs-${Date.now()}`,
              public_key: null
            }
          };
        } else {
          throw apiError;
        }
      }

      // Guardar el assistant en nuestra base de datos local
      // El frontend puede enviar businessId o business_id
      const businessId = createAssistantDto.business_id || createAssistantDto.businessId;
      if (!businessId) {
        throw new Error('business_id es requerido');
      }

      const localAssistantData = {
        business_id: businessId,
        name: createAssistantDto.name || 'Recepcionista AI',
        prompt: createAssistantDto.prompt,
        first_message: firstMessage,
        vapi_assistant_id: elevenlabsResponse.data.agent_id, // ID del agente de ElevenLabs
        vapi_public_key: elevenlabsResponse.data.public_key || null,
        voice_id: selectedVoice.id,
        voice_provider: VoiceProvider.ELEVENLABS,
        language: selectedVoice.language,
        model_provider: ModelProvider.OPENAI,
        model_name: 'gpt-4o-mini',
        tools: createAssistantDto.tools || null,
        required_fields: createAssistantDto.required_fields || null,
        server_url: createAssistantDto.server_url || null,
        server_url_secret: createAssistantDto.server_url_secret || null,
        status: AssistantStatus.DRAFT
      };

      const localAssistant = await this.assistantService.createAssistant(localAssistantData, userId);

      this.logger.log('Local assistant created successfully:', localAssistant.id);

      return {
        id: elevenlabsResponse.data.agent_id,
        agent_id: elevenlabsResponse.data.agent_id,
        public_key: elevenlabsResponse.data.public_key,
        local_assistant: localAssistant
      };

    } catch (error) {
      this.logger.error('Error creating ElevenLabs assistant:', error.response?.data || error.message);
      throw new Error(`Failed to create ElevenLabs assistant: ${error.response?.data?.message || error.message}`);
    }
  }

  async getVoices(): Promise<Voice[]> {
    return ALL_VOICES;
  }

  async getAvailableVoices(): Promise<Voice[]> {
    return ALL_VOICES.filter(v => v.recommended);
  }

  getVoicesByLanguage(language: string): Voice[] {
    return getVoicesByLanguage(language);
  }

  getVoicesByProvider(provider: string): Voice[] {
    return ALL_VOICES.filter(v => v.provider === provider);
  }

  private buildWebhookUrl(businessId: string): string {
    // Usar el webhook de ngrok si está configurado (N8N intermedio)
    const ngrokUrl = this.configService.get<string>('WEBHOOK_URL');
    if (ngrokUrl) {
      // URL completa de N8N que luego reenvía al backend
      return `${ngrokUrl}/webhook-test/vapi-appointment`;
    }
    
    // Si no hay ngrok, usar localhost directo
    const baseUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
    return `${baseUrl}/api/webhooks/elevenlabs/appointment/${businessId}`;
  }

  private buildPromptWithTools(basePrompt: string, webhookUrl: string): string {
    return `${basePrompt}

## SISTEMA DE AGENDAMIENTO AUTOMÁTICO

Tienes acceso a un sistema automático de agendamiento de citas. Cuando el cliente quiera agendar una cita, sigue estos pasos:

### 1. RECOPILAR INFORMACIÓN (EN ESTE ORDEN):

1. **Nombre completo del cliente**
   - Pregunta: "¿Cuál es tu nombre completo?"

2. **Email del cliente**
   - Pregunta: "¿Cuál es tu email?"
   - Valida que tenga formato de email válido (contenga @)

3. **Teléfono del cliente**
   - Pregunta: "¿Cuál es tu número de teléfono?"

4. **Tipo de servicio**
   - Pregunta: "¿Qué tipo de servicio necesitas?"
   - Opciones: consulta, tratamiento, seguimiento, emergencia

5. **Fecha de la cita**
   - Pregunta: "¿Qué fecha prefieres para la cita?"
   - Formato debe ser: YYYY-MM-DD
   - Ejemplo: 2025-11-15 para el 15 de noviembre de 2025

6. **Hora de la cita**
   - Pregunta: "¿A qué hora te gustaría la cita?"
   - Formato: HH:MM en formato 24h
   - Ejemplos: 09:30 (9:30 AM), 14:00 (2:00 PM), 16:30 (4:30 PM)

### 2. CUANDO TENGAS TODOS LOS DATOS:

Confirma con el cliente:
"Perfecto [nombre], voy a agendar tu [tipo_servicio] para el [fecha] a las [hora]. Recibirás un email de confirmación en [email]."

Luego, di:
"Estoy procesando tu solicitud..." (breve pausa)

Y finalmente:
"Tu cita ha sido confirmada. Recibirás un email con todos los detalles en los próximos minutos."

### 3. IMPORTANTE:

- NO menciones URLs, webhooks o sistemas técnicos al cliente
- Sé natural y conversacional
- Si falta algún dato, pregúntalo de forma amigable
- Siempre confirma antes de "agendar"
- Mantén un tono profesional y cálido

### FORMATO DE LOS DATOS:
- Fecha: **SIEMPRE** en formato YYYY-MM-DD
- Hora: **SIEMPRE** en formato 24h (09:00, 14:30, etc.)
- Email: Validar que contenga @ y sea válido
- Teléfono: Aceptar con código de país si lo incluye
`;
  }
}

