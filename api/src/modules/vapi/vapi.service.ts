import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { ALL_VOICES, SPANISH_VOICES, ENGLISH_VOICES, DEFAULT_SPANISH_VOICE_ID, DEFAULT_ENGLISH_VOICE_ID, Voice, getVoicesByLanguage, AVAILABLE_LANGUAGES, AVAILABLE_PROVIDERS } from './constants/vapi-voices';
import { AssistantService } from '../assistant/assistant.service';
import { VoiceProvider, ModelProvider, AssistantStatus } from '../assistant/entities/assistant.entity';

@Injectable()
export class VapiService {
  private readonly logger = new Logger(VapiService.name);
  private readonly vapiApiKey: string;
  private readonly vapiBaseUrl = 'https://api.vapi.ai';

  constructor(
    private configService: ConfigService,
    private assistantService: AssistantService
  ) {
    this.vapiApiKey = this.configService.get<string>('VAPI_API_KEY');
    if (!this.vapiApiKey) {
      throw new Error('VAPI_API_KEY is not configured');
    }
  }

  private getValidVoice(voiceId?: string, provider?: string): Voice | null {
    if (!voiceId) {
      return null;
    }

    // Buscar la voz en todas las voces disponibles
    const voice = ALL_VOICES.find(v => v.id === voiceId);
    
    if (voice) {
      // Si se especifica un proveedor, verificar que coincida
      if (provider && voice.provider !== provider) {
        this.logger.warn(`Voice ${voiceId} provider (${voice.provider}) doesn't match requested provider (${provider})`);
        return null;
      }
      return voice;
    }
    
    return null;
  }

  private getDefaultSpanishVoice(): Voice {
    return SPANISH_VOICES.find(v => v.id === DEFAULT_SPANISH_VOICE_ID) || SPANISH_VOICES[0];
  }

  private normalizeCreateAssistantDto(dto: CreateAssistantDto): any {
    return {
      business_id: dto.business_id || dto.businessId,
      name: dto.name,
      prompt: dto.prompt,
      first_message: dto.first_message || dto.firstMessage,
      voice_id: dto.voice_id || dto.voiceId || dto.voice,
      voice_provider: dto.voice_provider || dto.voiceProvider,
      language: dto.language,
      model_provider: dto.model_provider,
      model_name: dto.model_name,
      tools: dto.tools,
      required_fields: dto.required_fields,
      server_url: dto.server_url || dto.serverUrl,
      server_url_secret: dto.server_url_secret || dto.serverUrlSecret,
      status: dto.status
    };
  }

  async createAssistant(createAssistantDto: CreateAssistantDto, userId: string) {
    try {
      this.logger.log('User ID recibido:', userId);
      this.logger.log('DTO recibido:', JSON.stringify(createAssistantDto, null, 2));
      this.logger.log('Creating VAPI assistant with data:', createAssistantDto);

      // Normalizar los datos del DTO (compatibilidad con campos legacy)
      const normalizedDto = this.normalizeCreateAssistantDto(createAssistantDto);

      // Determinar la voz a usar
      const selectedVoice = this.getValidVoice(
        normalizedDto.voice_id,
        normalizedDto.voice_provider
      ) || this.getDefaultSpanishVoice();

      this.logger.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.provider})`);

      // Crear herramientas primero si están definidas
      let toolIds: string[] = [];
      if (normalizedDto.tools && normalizedDto.tools.length > 0) {
        for (const tool of normalizedDto.tools) {
          try {
            const toolData = {
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
              },
              server: {
                url: tool.webhook_url
              }
            };

            this.logger.log('Creating tool:', JSON.stringify(toolData, null, 2));
            
            const toolResponse = await axios.post(
              `${this.vapiBaseUrl}/tool`,
              toolData,
              {
                headers: {
                  'Authorization': `Bearer ${this.vapiApiKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            toolIds.push(toolResponse.data.id);
            this.logger.log(`Tool created with ID: ${toolResponse.data.id}`);
          } catch (toolError) {
            this.logger.error('Error creating tool:', toolError.response?.data || toolError.message);
            throw new Error(`Failed to create tool: ${toolError.response?.data?.message || toolError.message}`);
          }
        }
      }

      // Crear el asistente en Vapi
      const vapiAssistantData = {
        name: normalizedDto.name || 'Recepcionista AI',
        model: {
          provider: normalizedDto.model_provider || 'openai',
          model: normalizedDto.model_name || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: normalizedDto.prompt || 'Eres un asistente de voz amigable y profesional que habla en español.'
            }
          ],
          toolIds: toolIds.length > 0 ? toolIds : undefined
        },
        voice: {
          provider: selectedVoice.provider === 'elevenlabs' ? '11labs' : selectedVoice.provider,
          voiceId: selectedVoice.id
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: normalizedDto.language === 'es' ? 'es' : 'en',
        },
        firstMessage: normalizedDto.first_message || '¡Hola! ¿En qué puedo ayudarte?'
      };

      // Agregar serverUrl si está definido
      if (normalizedDto.server_url) {
        vapiAssistantData['serverUrl'] = normalizedDto.server_url;
      }

      // Agregar serverUrlSecret si está definido
      if (normalizedDto.server_url_secret) {
        vapiAssistantData['serverUrlSecret'] = normalizedDto.server_url_secret;
      }

      // Log del payload que se envía a VAPI
      this.logger.log('VAPI assistant payload:', JSON.stringify(vapiAssistantData, null, 2));

      // Crear asistente en Vapi
      const vapiResponse = await axios.post(
        `${this.vapiBaseUrl}/assistant`,
        vapiAssistantData,
        {
          headers: {
            'Authorization': `Bearer ${this.vapiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.log('VAPI assistant created successfully:', vapiResponse.data);

      // Guardar el asistente en nuestra base de datos local
      const localAssistantData = {
        business_id: normalizedDto.business_id,
        name: normalizedDto.name || 'Recepcionista AI',
        prompt: normalizedDto.prompt,
        first_message: normalizedDto.first_message || '¡Hola! ¿En qué puedo ayudarte?',
        vapi_assistant_id: vapiResponse.data.id,
        vapi_public_key: vapiResponse.data.publicKey || null,
        voice_id: selectedVoice.id,
        voice_provider: selectedVoice.provider as VoiceProvider,
        language: selectedVoice.language,
        model_provider: normalizedDto.model_provider || ModelProvider.OPENAI,
        model_name: normalizedDto.model_name || 'gpt-4o-mini',
        tools: normalizedDto.tools || null,
        required_fields: normalizedDto.required_fields || null,
        server_url: normalizedDto.server_url || null,
        server_url_secret: normalizedDto.server_url_secret || null,
        status: normalizedDto.status || AssistantStatus.DRAFT
      };

      this.logger.log('Creating local assistant with data:', JSON.stringify(localAssistantData, null, 2));
      this.logger.log('VAPI Assistant ID from response:', vapiResponse.data.id);

      const localAssistant = await this.assistantService.createAssistant(localAssistantData, userId);

      this.logger.log('Local assistant created successfully:', localAssistant.id);

      // Retornar información combinada
      return {
        ...vapiResponse.data,
        local_assistant: localAssistant
      };

    } catch (error) {
      this.logger.error('Error creating VAPI assistant:', error.response?.data || error.message);
      throw new Error(`Failed to create VAPI assistant: ${error.response?.data?.message || error.message}`);
    }
  }

  async getVoices() {
    try {
      this.logger.log('Fetching VAPI voices');

      const response = await axios.get(
        `${this.vapiBaseUrl}/voice`,
        {
          headers: {
            'Authorization': `Bearer ${this.vapiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.log('VAPI voices fetched successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching VAPI voices:', error.response?.data || error.message);
      throw new Error(`Failed to fetch VAPI voices: ${error.response?.data?.message || error.message}`);
    }
  }

  async getAvailableVoices() {
    // Retorna todas las voces disponibles organizadas por idioma y proveedor
    return {
      languages: AVAILABLE_LANGUAGES,
      providers: AVAILABLE_PROVIDERS,
      voices: {
        all: ALL_VOICES,
        spanish: SPANISH_VOICES,
        english: ENGLISH_VOICES,
        byLanguage: {
          'es-ES': getVoicesByLanguage('es-ES'),
          'en-US': getVoicesByLanguage('en-US')
        },
        byProvider: {
          vapi: ALL_VOICES.filter(v => v.provider === 'vapi'),
          elevenlabs: ALL_VOICES.filter(v => v.provider === 'elevenlabs'),
          azure: ALL_VOICES.filter(v => v.provider === 'azure')
        }
      },
      defaults: {
        spanish: DEFAULT_SPANISH_VOICE_ID,
        english: DEFAULT_ENGLISH_VOICE_ID
      }
    };
  }

  async getVoicesByLanguage(language: string) {
    return getVoicesByLanguage(language);
  }

  async getVoicesByProvider(provider: string) {
    return ALL_VOICES.filter(v => v.provider === provider);
  }

  async updateAssistant(vapiAssistantId: string, updateData: any) {
    try {
      this.logger.log('Updating VAPI assistant:', vapiAssistantId);
      this.logger.log('Update data:', JSON.stringify(updateData, null, 2));

      // Actualizar el assistant en Vapi
      const vapiResponse = await axios.patch(
        `${this.vapiBaseUrl}/assistant/${vapiAssistantId}`,
        {
          name: updateData.name,
          model: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: updateData.prompt
              }
            ]
          },
          voice: {
            provider: updateData.voice_provider === 'elevenlabs' ? '11labs' : (updateData.voice_provider || 'azure'),
            voiceId: updateData.voice
          },
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: updateData.language === 'es' ? 'es' : 'en',
          },
          firstMessage: updateData.first_message || '¡Hola! ¿En qué puedo ayudarte?'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.vapiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.log('VAPI assistant updated successfully:', vapiResponse.data);

      // Actualizar el assistant en nuestra base de datos local
      const localAssistantData = {
        prompt: updateData.prompt,
        voice_id: updateData.voice,
        language: updateData.language,
        required_fields: updateData.required_fields,
        tools: updateData.tools
      };

      // Buscar el assistant local por vapi_assistant_id
      const localAssistant = await this.assistantService.findByVapiAssistantId(vapiAssistantId);
      if (localAssistant) {
        await this.assistantService.updateAssistant(localAssistant.id, localAssistantData);
      }

      return vapiResponse.data;
    } catch (error: any) {
      this.logger.error('Error updating VAPI assistant:', error.response?.data || error.message);
      throw new Error(`Failed to update VAPI assistant: ${error.response?.data?.message || error.message}`);
    }
  }
}
