import { apiService } from './api.service';

export interface VapiAssistant {
  id: string;
  name: string;
  prompt: string;
  voice: string;
  language: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  local_assistant?: {
    id: string;
    business_id: string;
    name: string;
    prompt: string;
    vapi_assistant_id: string;
    voice_id: string;
    language: string;
    required_fields: any[];
    tools: any[];
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateAssistantRequest {
  name: string;
  prompt: string;
  voice: string;
  language: string;
  firstMessage?: string;
  businessId: string;
  tools?: Array<{
    name: string;
    description: string;
    parameters: any;
    webhook_url?: string;
    webhook_secret?: string;
    enabled?: boolean;
  }>;
  required_fields?: (string | { name: string; type: string; label: string })[];
}

export interface VapiVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  provider: string;
}

/**
 * Servicio para interactuar con Vapi
 * Gestiona la creación y configuración de asistentes AI mediante Vapi
 */
class VapiService {
  private baseUrl = '/elevenlabs'; // Endpoint para voces de ElevenLabs (usadas en Vapi)
  private vapiBaseUrl = '/vapi';

  /**
   * Crear un nuevo assistant en Vapi para un business
   */
  async createAssistant(data: CreateAssistantRequest): Promise<VapiAssistant> {
    try {
      // Determinar el idioma para elegir el endpoint correcto
      const language = data.language?.toLowerCase();
      const isSpanish = language?.startsWith('es') || language === 'spanish';
      const endpoint = isSpanish ? 'spanish' : 'english';

      // Llamar al nuevo endpoint de Vapi
      const response = await apiService.request(
        `${this.vapiBaseUrl}/business/${data.businessId}/assistant/${endpoint}`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: data.name,
            firstMessage: data.firstMessage,
            voice: {
              provider: '11labs',
              voiceId: data.voice,
              model: 'eleven_multilingual_v2', // Modelo requerido para ElevenLabs
            },
            model: {
              provider: 'openai',
              model: 'gpt-4o-mini',
              temperature: 0.7,
              messages: [
                {
                  role: 'system',
                  content: data.prompt,
                },
              ],
            },
          }),
        }
      );

      // Adaptar la respuesta de Vapi al formato esperado
      return {
        id: response.vapiAssistant?.id || '',
        name: response.vapiAssistant?.name || data.name,
        prompt: data.prompt,
        voice_id: data.voice,
        language: data.language,
        first_message: data.firstMessage || '',
        local_assistant: response.dbAssistant,
      } as VapiAssistant;
    } catch (error) {
      console.error('Error en createAssistant:', error);
      throw error;
    }
  }

  /**
   * Obtener la lista de voces disponibles
   */
  async getVoices(): Promise<VapiVoice[]> {
    try {
      const response = await apiService.request(`${this.baseUrl}/voices`);

      return response as VapiVoice[];
    } catch (error) {
      console.error('Error en getVoices:', error);
      throw error;
    }
  }

  /**
   * Obtener las voces válidas disponibles para crear assistants
   */
  async getAvailableVoices(): Promise<VapiVoice[]> {
    try {
      const response = await apiService.request(`${this.baseUrl}/voices/available`);

      return response as VapiVoice[];
    } catch (error) {
      console.error('Error en getAvailableVoices:', error);
      throw error;
    }
  }

  /**
   * Obtener un assistant específico por ID
   */
  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    try {
      const response = await apiService.request(`${this.baseUrl}/assistants/${assistantId}`);

      return response as VapiAssistant;
    } catch (error) {
      console.error('Error en getAssistant:', error);
      throw error;
    }
  }

  /**
   * Actualizar un assistant existente en Vapi
   */
  async updateAssistant(assistantId: string, data: Partial<CreateAssistantRequest>): Promise<VapiAssistant> {
    try {
      if (!data.businessId) {
        throw new Error('businessId es requerido para actualizar el assistant');
      }

      const updatePayload: any = {};

      if (data.firstMessage) {
        updatePayload.firstMessage = data.firstMessage;
      }

      if (data.voice) {
        updatePayload.voice = {
          provider: '11labs',
          voiceId: data.voice,
          model: 'eleven_multilingual_v2', // Modelo requerido para ElevenLabs
        };
      }

      if (data.prompt) {
        updatePayload.model = {
          messages: [
            {
              role: 'system',
              content: data.prompt,
            },
          ],
        };
      }

      // ✅ Enviar campos requeridos para actualizar la tool de create_appointment
      if (data.required_fields) {
        updatePayload.requiredFields = data.required_fields;
      }

      console.log('📤 Frontend - Enviando updatePayload:', updatePayload);

      const response = await apiService.request(
        `${this.vapiBaseUrl}/business/${data.businessId}/assistant`,
        {
          method: 'PUT',
          body: JSON.stringify(updatePayload),
        }
      );

      return {
        id: assistantId,
        name: data.name || '',
        prompt: data.prompt || '',
        voice_id: data.voice || '',
        language: data.language || '',
        first_message: data.firstMessage || '',
        local_assistant: response,
      } as VapiAssistant;
    } catch (error) {
      console.error('Error en updateAssistant:', error);
      throw error;
    }
  }

  /**
   * Eliminar un assistant
   * @deprecated Los assistants se eliminan mediante el módulo de assistants
   */
  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      // Los assistants ahora se gestionan en el módulo de assistants
      console.warn('deleteAssistant está deprecado. Usa el módulo de assistants en su lugar.');
      await apiService.request(`/assistants/${assistantId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error en deleteAssistant:', error);
      throw error;
    }
  }

  /**
   * Probar un assistant (hacer una llamada de prueba)
   * Ahora usa Vapi calls
   */
  async testAssistant(assistantId: string, phoneNumber: string, businessId: string): Promise<void> {
    try {
      await apiService.request(`${this.vapiBaseUrl}/business/${businessId}/calls`, {
        method: 'POST',
        body: JSON.stringify({ 
          customerPhone: phoneNumber,
          additionalConfig: {
            maxDurationSeconds: 300, // 5 minutos para prueba
          }
        }),
      });
    } catch (error) {
      console.error('Error en testAssistant:', error);
      throw error;
    }
  }
}

export const vapiService = new VapiService();


