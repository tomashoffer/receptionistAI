import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { ALL_VOICES, SPANISH_VOICES, ENGLISH_VOICES, DEFAULT_SPANISH_VOICE_ID, DEFAULT_ENGLISH_VOICE_ID, Voice, getVoicesByLanguage, AVAILABLE_LANGUAGES, AVAILABLE_PROVIDERS } from './constants/vapi-voices';
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

      // Obtener la voz por defecto según el idioma y normalizar
      const rawLanguage = createAssistantDto.language || 'es';
      const language = rawLanguage.startsWith('es') ? 'es' : 'en'; // Normalizar "es-ES" a "es"
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
      
      // Generar nombre único para la tool basado en el business
      const cleanBusinessName = (createAssistantDto.name || 'business')
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
        .toLowerCase();
      const toolName = `create_appointment_${cleanBusinessName}`;
      
      // 1️⃣ PRIMERO crear las Tools (create_appointment y check_availability)
      this.logger.log('🚀 Creando tools en ElevenLabs...');
      let createToolId: string | undefined;
      let availabilityToolId: string | undefined;
      
      const toolResponse = await axios.post(
        `${this.elevenlabsBaseUrl}/v1/convai/tools`,
        {
          tool_config: {
            type: 'webhook',
            name: toolName,
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
                required: ['name', 'email', 'phone', 'service', 'date', 'time'],
                description: 'Datos del cliente y la cita',
                properties: {
                  name: { type: 'string', description: 'Nombre completo del cliente' },
                  email: { type: 'string', description: 'Email del cliente' },
                  phone: { type: 'string', description: 'Teléfono del cliente' },
                  service: { type: 'string', description: 'Tipo de servicio' },
                  date: { type: 'string', description: 'Fecha en formato DD-MM-YYYY (ej: "03-11-2025" para 3 de noviembre de 2025). REQUERIDO.' },
                  time: { type: 'string', description: 'Hora en formato HH:MM de 24 horas (ej: "09:30" o "14:00"). REQUERIDO.' },
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
      createToolId = toolResponse.data.id;
      this.logger.log(`✅ Tool create_appointment creada: ${createToolId}`);
      
      if (!createToolId) {
        throw new Error('No se pudo crear la tool en ElevenLabs');
      }

      // Crear tool de disponibilidad (GET)
      const toolBusinessId = createAssistantDto.business_id || createAssistantDto.businessId;
      const availabilityBaseUrl = (() => {
        // Usar WEBHOOK_URL_BACKEND para el backend
        const raw = this.configService.get<string>('WEBHOOK_URL_BACKEND');
        if (raw) {
          return raw.replace(/\/$/, '');
        }
        const base = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
        return base;
      })();

      const availabilityResponse = await axios.post(
        `${this.elevenlabsBaseUrl}/v1/convai/tools`,
        {
          tool_config: {
            type: 'webhook',
            name: `check_availability_${cleanBusinessName}`,
            description: 'CRÍTICO: Verifica si un horario específico está disponible en el Google Calendar. REQUISITOS OBLIGATORIOS: 1) Debes tener la fecha en formato YYYY-MM-DD (ej: "2025-11-03") 2) Debes tener la hora en formato HH:MM (ej: "09:30"). NO llames esta tool si no tienes AMBOS valores. NO pases undefined o valores vacíos. Esta tool requiere EXACTAMENTE dos parámetros: "date" (string YYYY-MM-DD) y "time" (string HH:MM). SIEMPRE verifica disponibilidad ANTES de crear una cita.',
            response_timeout_secs: 30,
            disable_interruptions: false,
            force_pre_tool_speech: false,
            tool_call_sound: 'typing',
            tool_call_sound_behavior: 'auto',
            api_schema: {
              url: `${availabilityBaseUrl}/google-calendar/availability/${toolBusinessId}`,
              method: 'GET',
              query_params_schema: {
                properties: {
                  date: {
                    type: 'string',
                    description: 'Fecha en formato YYYY-MM-DD (obtenida de resolve_date). Ejemplo: "2025-11-03". REQUERIDO.'
                  },
                  time: {
                    type: 'string',
                    description: 'Hora en formato HH:MM de 24 horas. Ejemplo: "09:30" o "14:00". REQUERIDO.'
                  }
                },
                required: ['date', 'time']
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
      availabilityToolId = availabilityResponse.data.id;
      this.logger.log(`✅ Tool check_availability creada: ${availabilityToolId}`);

      // Crear tool de fecha/hora actual (GET)
      const nowUrl = (() => {
        const raw = this.configService.get<string>('WEBHOOK_URL_BACKEND');
        if (raw) {
          return raw.replace(/\/$/, '') + `/utils/now`;
        }
        const base = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
        return `${base}/utils/now`;
      })();

      let nowToolId: string | undefined;
      try {
        const nowToolResponse = await axios.post(
          `${this.elevenlabsBaseUrl}/v1/convai/tools`,
          {
            tool_config: {
              type: 'webhook',
              name: `get_current_datetime_${cleanBusinessName}`,
              description: 'Obtiene la fecha y hora actuales y la zona horaria para interpretar fechas del usuario',
              response_timeout_secs: 15,
              disable_interruptions: false,
              force_pre_tool_speech: false,
              tool_call_sound: 'typing',
              tool_call_sound_behavior: 'auto',
              api_schema: {
                url: nowUrl,
                method: 'GET'
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
        nowToolId = nowToolResponse.data.id;
        this.logger.log(`✅ Tool get_current_datetime creada: ${nowToolId}`);
      } catch (e) {
        this.logger.warn('No se pudo crear la tool get_current_datetime (continuando de todos modos):', e?.response?.data || e.message);
      }

      // Crear tool resolve_date (GET)
      const resolveBaseUrl = (() => {
        const raw = this.configService.get<string>('WEBHOOK_URL_BACKEND');
        const base = raw ? raw.replace(/\/$/, '') : (this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001');
        return base;
      })();

      let resolveToolId: string | undefined;
      try {
        const resolveResp = await axios.post(
          `${this.elevenlabsBaseUrl}/v1/convai/tools`,
          {
            tool_config: {
              type: 'webhook',
              name: `resolve_date_${cleanBusinessName}`,
              description: 'Convierte una fecha en texto a formato YYYY-MM-DD y devuelve el día de la semana',
              response_timeout_secs: 15,
              disable_interruptions: false,
              force_pre_tool_speech: false,
              tool_call_sound: 'typing',
              tool_call_sound_behavior: 'auto',
              api_schema: {
                url: `${resolveBaseUrl}/utils/resolve-date`,
                method: 'GET',
                query_params_schema: {
                  properties: {
                    text: {
                      type: 'string',
                      description: 'Fecha como texto del usuario (ej: "mañana", "3 de noviembre", "próximo lunes")'
                    },
                    tz: {
                      type: 'string',
                      description: 'Zona horaria IANA, ej: America/Argentina/Buenos_Aires'
                    },
                    lang: {
                      type: 'string',
                      description: 'Idioma: "es" o "en"'
                    }
                  },
                  required: ['text']
                }
              }
            }
          },
          { headers: { 'xi-api-key': this.elevenlabsApiKey, 'Content-Type': 'application/json' } }
        );
        resolveToolId = resolveResp.data.id;
        this.logger.log(`✅ Tool resolve_date creada: ${resolveToolId}`);
      } catch (e) {
        this.logger.warn('No se pudo crear la tool resolve_date (continuando):', e?.response?.data || e.message);
      }

      // 2️⃣ AHORA crear el Agent con las tools asociadas
      const agentToolIds = [createToolId, availabilityToolId, nowToolId, resolveToolId].filter(Boolean) as string[];
      this.logger.log(`🚀 Creando agent en ElevenLabs con tools: ${agentToolIds.join(', ')}`);
      
      // Seleccionar el modelo LLM (usar el del DTO o un modelo mejor por defecto)
      // Modelos recomendados para agentes: gpt-5-mini, gemini-2.5-flash, claude-sonnet-4.5
      const selectedLLM = createAssistantDto.model_name || 'gpt-5-mini';
      this.logger.log(`🤖 Usando modelo LLM: ${selectedLLM}`);
      
      // Configurar textos del widget según el idioma
      const widgetTexts = this.getWidgetTexts(language);

      const elevenlabsAgentData = {
        name: createAssistantDto.name || 'Recepcionista AI',
        conversation_config: {
          agent: {
            first_message: firstMessage,
            language: language,
            prompt: {
              prompt: this.buildPromptWithTools((createAssistantDto.prompt || '').substring(0, 1000), webhookUrl),
              llm: 'gpt-4o-mini',
              // Asociar la tool directamente en el agent
              ...(agentToolIds.length ? { tool_ids: agentToolIds } : {})
            }
          },
          tts: {
            model_id: 'eleven_turbo_v2_5',
            voice_id: selectedVoice.id
          }
        },
        platform_settings: {
          widget: {
            text_contents: widgetTexts
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
        
        if (agentToolIds.length) {
          this.logger.log(`✅ Tools [${agentToolIds.join(', ')}] asociadas al agent ${elevenlabsResponse.data.agent_id}`);
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

      // Construir el objeto de tool con el ID de ElevenLabs
      const localToolIds = [createToolId, availabilityToolId].filter(Boolean) as string[];
      const toolsWithId = createAssistantDto.tools?.map((tool: any, idx: number) => {
        if (tool && localToolIds[idx]) {
          return { ...tool, id: localToolIds[idx] };
        }
        return tool;
      });

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
        model_name: selectedLLM, // Usar el mismo modelo LLM que se usó para crear el agente
        tools: toolsWithId || null,
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
    // Usar el webhook de ngrok del backend si está configurado (para HTTPS público)
    const webhookUrl = this.configService.get<string>('WEBHOOK_URL_BACKEND');
    if (webhookUrl) {
      // Si WEBHOOK_URL_BACKEND ya incluye el path completo, usarlo tal cual
      // Si solo incluye la base URL de ngrok, construir el path completo
      if (webhookUrl.includes('/webhooks')) {
        // Ya tiene el path, solo agregar el businessId
        return webhookUrl.replace(':businessId', businessId).replace('{businessId}', businessId);
      } else {
        // Solo tiene la base URL, construir el path completo
        return `${webhookUrl}/webhooks/elevenlabs/appointment/${businessId}`;
      }
    }
    
    // Si no hay ngrok, usar localhost directo (solo para desarrollo local)
    const baseUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
    return `${baseUrl}/webhooks/elevenlabs/appointment/${businessId}`;
  }

  async updateAssistant(agentId: string, updateAssistantDto: Partial<CreateAssistantDto>) {
    try {
      this.logger.log('🔄 Actualizando agent en ElevenLabs...');
      this.logger.log('Agent ID:', agentId);
      this.logger.log('Update data:', JSON.stringify(updateAssistantDto, null, 2));

      // Obtener la voz seleccionada y normalizar idioma
      const rawLanguage = updateAssistantDto.language || 'es';
      const language = rawLanguage.startsWith('es') ? 'es' : 'en'; // Normalizar "es-ES" a "es"
      const defaultVoice = language === 'es' ? SPANISH_VOICES[0] : ENGLISH_VOICES[0];
      const voiceId = updateAssistantDto.voice || updateAssistantDto.voice_id;
      const selectedVoice = voiceId 
        ? ALL_VOICES.find(v => v.id === voiceId) || defaultVoice
        : defaultVoice;

      const firstMessage = updateAssistantDto.firstMessage || updateAssistantDto.first_message || '¡Hola! ¿En qué puedo ayudarte?';
      
      // Construir URL del webhook
      const webhookUrl = this.buildWebhookUrl(updateAssistantDto.business_id || updateAssistantDto.businessId);

      // 1️⃣ Obtener el agent actual para ver sus tools existentes
      this.logger.log('📋 Obteniendo agent actual...');
      const currentAgentResponse = await axios.get(
        `${this.elevenlabsBaseUrl}/v1/convai/agents/${agentId}`,
        {
          headers: {
            'xi-api-key': this.elevenlabsApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const currentToolIds = currentAgentResponse.data.conversation_config?.agent?.prompt?.tool_ids || [];
      this.logger.log('Tool IDs actuales:', currentToolIds);

      // 2️⃣ Obtener el ID de la tool desde la BD si no viene en el DTO
      let toolId;
      const businessId = updateAssistantDto.business_id || updateAssistantDto.businessId;
      let toolIdToUse;
      let assistantFromBD = null;
      
      // Primero intentar desde el DTO
      const existingToolIdFromDto = updateAssistantDto.tools?.[0]?.id;
      
      // Si no está en el DTO, obtenerlo de la BD
      if (!existingToolIdFromDto && businessId) {
        try {
          assistantFromBD = await this.assistantService.getAssistantByBusinessId(businessId);
          if (assistantFromBD?.tools && assistantFromBD.tools.length > 0) {
            toolIdToUse = assistantFromBD.tools[0].id;
            this.logger.log('🔍 Tool ID obtenido de BD:', toolIdToUse);
          }
        } catch (error) {
          this.logger.error('Error obteniendo assistant de BD:', error);
        }
      }
      
      // Si aún no hay ID, usar el del agent actual
      if (!toolIdToUse) {
        toolIdToUse = existingToolIdFromDto || currentToolIds[0];
      }
      
      // Si hay required_fields, actualizar la tool
      if (updateAssistantDto.required_fields) {
        this.logger.log('🔧 Actualizando tool con campos requeridos...');
        
        // Construir los parámetros de la tool basándose en required_fields
        const requiredFields = (updateAssistantDto.required_fields as any) || [];
        const properties: any = {
          name: { type: 'string', description: 'Nombre completo del cliente' },
          email: { type: 'string', description: 'Email del cliente' },
          phone: { type: 'string', description: 'Teléfono del cliente' },
          service: { type: 'string', description: 'Tipo de servicio solicitado' },
          date: { type: 'string', description: 'Fecha preferida para la cita' },
          time: { type: 'string', description: 'Hora preferida para la cita' }
        };

        // Agregar campos personalizados
        if (Array.isArray(requiredFields)) {
          requiredFields.forEach((field: any) => {
            if (typeof field === 'object' && field.name) {
              const typeMap: any = {
                'text': 'string',
                'number': 'number',
                'email': 'string',
                'phone': 'string',
                'date': 'string'
              };
              properties[field.name] = {
                type: typeMap[field.type] || 'string',
                description: field.label || field.name
              };
            }
          });
        }

        const businessName = updateAssistantDto.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase() || 'business';
        
        // Construir el schema de la tool
        const toolConfig: any = {
          type: 'webhook',
          name: `create_appointment_${businessName}`,
          description: 'Crea una nueva cita con la información del cliente',
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
              properties,
              required: Object.keys(properties)
            }
          }
        };
        
        if (toolIdToUse) {
          // Actualizar tool existente usando endpoint separado
          this.logger.log('🔄 Actualizando tool con ID:', toolIdToUse);
          await axios.patch(
            `${this.elevenlabsBaseUrl}/v1/convai/tools/${toolIdToUse}`,
            { tool_config: toolConfig },
            {
              headers: {
                'xi-api-key': this.elevenlabsApiKey,
                'Content-Type': 'application/json'
              }
            }
          );
          toolId = toolIdToUse;
          this.logger.log('✅ Tool actualizada exitosamente');
        } else {
          throw new Error('No se encontró el ID de la tool para actualizar');
        }
      }

      // 3️⃣ Actualizar el AGENT (sin tocar tools, solo configuración)
      this.logger.log('🔄 Actualizando agent...');
      
      // Usar el prompt directamente sin manipularlo
      const promptText = updateAssistantDto.prompt || '';
      
      this.logger.log('Prompt que se enviará:', promptText.substring(0, 200) + '...');

      // Seleccionar el modelo LLM para actualización
      const selectedLLM = updateAssistantDto.model_name || 'gpt-5-mini';
      this.logger.log(`🤖 Actualizando con modelo LLM: ${selectedLLM}`);

      // Construir el payload para actualizar el agent
      // Mantener los tool_ids existentes para que las tools sigan asociadas
      // Obtener textos del widget según el idioma
      const widgetTexts = this.getWidgetTexts(language);

      const updatePayload: any = {
        conversation_config: {
          agent: {
            first_message: firstMessage,
            language: language,
            prompt: {
              prompt: promptText, // Prompt completo sin limitación
              llm: selectedLLM,
              temperature: 0.0, // Configuración de temperatura para mayor precisión
              reasoning_effort: 'medium', // Esfuerzo de razonamiento medio para mejor comprensión de lógica temporal
              tool_ids: currentToolIds // Mantener las tools existentes asociadas
            }
          },
          tts: {
            model_id: 'eleven_turbo_v2_5',
            voice_id: selectedVoice.id
          }
        },
        platform_settings: {
          widget: {
            text_contents: widgetTexts
          }
        }
      };

      this.logger.log('Update payload:', JSON.stringify(updatePayload, null, 2));

      // Actualizar el agente en ElevenLabs
      const response = await axios.patch(
        `${this.elevenlabsBaseUrl}/v1/convai/agents/${agentId}`,
        updatePayload,
        {
          headers: {
            'xi-api-key': this.elevenlabsApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.log('✅ Agent actualizado exitosamente en ElevenLabs');

      // 4️⃣ Actualizar en la base de datos local
      if (businessId) {
        try {
          this.logger.log('🔄 Actualizando assistant en base de datos local...');
          const assistant = assistantFromBD || await this.assistantService.getAssistantByBusinessId(businessId);
          if (assistant) {
            const updateData: any = {};
            
            // SIEMPRE actualizar el prompt si se envió
            if (updateAssistantDto.prompt) {
              updateData.prompt = updateAssistantDto.prompt;
              this.logger.log('📝 Actualizando prompt en BD local');
            }
            
            // Actualizar voice_id si se envió
            if (selectedVoice) {
              updateData.voice_id = selectedVoice.id;
              updateData.language = language;
            }
            
            // Actualizar first_message si se envió
            if (firstMessage) {
              updateData.first_message = firstMessage;
            }
            
            // SIEMPRE actualizar required_fields si se enviaron
            if (updateAssistantDto.required_fields) {
              updateData.required_fields = updateAssistantDto.required_fields as any;
              this.logger.log('📋 Actualizando required_fields en BD local');
            }
            
            // Reconstruir tools con los campos actualizados SIEMPRE que haya required_fields
            if (updateAssistantDto.required_fields && toolId) {
              this.logger.log('🔧 Reconstruyendo tools para BD local...');
              const requiredFields = (updateAssistantDto.required_fields as any) || [];
              const properties: any = {
                name: { type: 'string', description: 'Nombre completo del cliente' },
                email: { type: 'string', description: 'Email del cliente' },
                phone: { type: 'string', description: 'Teléfono del cliente' },
                service: { type: 'string', description: 'Tipo de servicio solicitado' },
                date: { type: 'string', description: 'Fecha preferida para la cita' },
                time: { type: 'string', description: 'Hora preferida para la cita' }
              };

              // Agregar campos personalizados
              if (Array.isArray(requiredFields)) {
                requiredFields.forEach((field: any) => {
                  if (typeof field === 'object' && field.name) {
                    const typeMap: any = {
                      'text': 'string',
                      'number': 'number',
                      'email': 'string',
                      'phone': 'string',
                      'date': 'string'
                    };
                    properties[field.name] = {
                      type: typeMap[field.type] || 'string',
                      description: field.label || field.name
                    };
                  }
                });
              }

              const businessName = updateAssistantDto.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase() || 'business';
              
              // Reconstruir el objeto tool completo
              const updatedTool = {
                id: toolId,
                name: `create_appointment_${businessName}`,
                description: 'Crea una nueva cita con la información del cliente',
                parameters: {
                  type: 'object',
                  properties,
                  required: Object.keys(properties)
                },
                webhook_url: webhookUrl,
                enabled: true
              };
              
              updateData.tools = [updatedTool];
              this.logger.log('📋 Tool reconstruida para BD:', JSON.stringify(updatedTool, null, 2));
            } else if (toolId && assistant.tools && assistant.tools.length > 0) {
              // Si hay toolId pero no required_fields, solo actualizar el ID
              const updatedTools = assistant.tools.map((tool: any) => ({
                ...tool,
                id: toolId
              }));
              updateData.tools = updatedTools;
              this.logger.log('🆔 Actualizando solo tool_id en BD');
            }
            
            // Llamar con businessId, no assistant.id
            await this.assistantService.updateAssistant(businessId, updateData);
            this.logger.log('✅ Assistant actualizado en base de datos local');
          }
        } catch (dbError) {
          this.logger.error('Error actualizando assistant en BD:', dbError);
          // No fallar la operación si falla la actualización de BD
        }
      }

      return {
        agent_id: response.data.agent_id,
        name: response.data.name,
        conversation_config: response.data.conversation_config
      };

    } catch (error) {
      this.logger.error('Error actualizando agent en ElevenLabs:', error.response?.data || error.message);
      throw new Error(`Failed to update ElevenLabs agent: ${error.response?.data?.message || error.message}`);
    }
  }

  private buildPromptWithTools(basePrompt: string, webhookUrl: string): string {
    return `${basePrompt}

## SISTEMA DE AGENDAMIENTO AUTOMÁTICO

### RECOPILAR INFORMACIÓN:

1. **Nombre** - Si hablas español: Matías, José, Juan (no Matthias, Joseph, John)
2. **Email** - Repite usando "arroba" (ej: "matias arroba gmail punto com"). Si dudas, pide que lo deletreen.
3. **Teléfono**
4. **Servicio**
5. **Fecha** - Si dice "mañana" o fechas relativas, usa la tool "resolve_date". Guarda en formato YYYY-MM-DD (ej: 2025-11-03)
6. **Hora** - Formato 24h (ej: 09:30, 14:00)

### VERIFICAR DISPONIBILIDAD:

Cuando tengas fecha y hora, llama "check_availability" con:
- date: YYYY-MM-DD (ej: "2025-11-03")
- time: HH:MM (ej: "09:30")

### CREAR CITA:

Si hay disponibilidad, llama "create_appointment" con:
- name, email, phone, service
- date: DD-MM-YYYY (ej: "03-11-2025") ← Convierte de YYYY-MM-DD a DD-MM-YYYY
- time: HH:MM (ej: "09:30")

### IMPORTANTE:
- Usa "arroba" al repetir emails en español
- Nombres en español (Matías, no Matthias)
- NO menciones sistemas técnicos
- Sé natural y conversacional
`;
  }

  /**
   * Obtiene los textos del widget según el idioma
   * Según la documentación de ElevenLabs, los campos son:
   * - main_label: Texto principal del widget
   * - start_call: Texto para iniciar llamada
   * - start_chat: Texto para iniciar chat
   * - new_call: Texto para nueva llamada
   * - end_call: Texto para finalizar llamada
   * - mute_microphone: Texto para silenciar micrófono
   * - change_language: Texto para cambiar idioma
   * - collapse: Texto para colapsar
   * - expand: Texto para expandir
   */
  private getWidgetTexts(language?: string): {
    main_label?: string;
    start_call?: string;
    start_chat?: string;
    new_call?: string;
    end_call?: string;
    mute_microphone?: string;
    change_language?: string;
    collapse?: string;
    expand?: string;
  } {
    const isSpanish = (language || '').toLowerCase().startsWith('es');
    
    if (isSpanish) {
      return {
        main_label: '¿Necesitas ayuda?',
        start_call: 'Iniciar llamada',
        start_chat: 'Iniciar chat',
        new_call: 'Nueva llamada',
        end_call: 'Finalizar llamada',
        mute_microphone: 'Silenciar micrófono',
        change_language: 'Cambiar idioma',
        collapse: 'Colapsar',
        expand: 'Expandir'
      };
    } else {
      return {
        main_label: 'Need help?',
        start_call: 'Start a call',
        start_chat: 'Start a chat',
        new_call: 'New call',
        end_call: 'End',
        mute_microphone: 'Mute microphone',
        change_language: 'Change language',
        collapse: 'Collapse',
        expand: 'Expand'
      };
    }
  }
}

