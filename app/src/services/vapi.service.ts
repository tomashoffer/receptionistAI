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

class VapiService {
  private baseUrl = '/vapi';

  /**
   * Crear un nuevo assistant en VAPI para un business
   */
  async createAssistant(data: CreateAssistantRequest): Promise<VapiAssistant> {
    try {
      const response = await apiService.request(`${this.baseUrl}/assistants`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response as VapiAssistant;
    } catch (error) {
      console.error('Error en createAssistant:', error);
      throw error;
    }
  }

  /**
   * Obtener la lista de voces disponibles en VAPI
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
   * Actualizar un assistant existente
   */
  async updateAssistant(assistantId: string, data: Partial<CreateAssistantRequest>): Promise<VapiAssistant> {
    try {
      const response = await apiService.request(`${this.baseUrl}/assistants/${assistantId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return response as VapiAssistant;
    } catch (error) {
      console.error('Error en updateAssistant:', error);
      throw error;
    }
  }

  /**
   * Eliminar un assistant
   */
  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      await apiService.request(`${this.baseUrl}/assistants/${assistantId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error en deleteAssistant:', error);
      throw error;
    }
  }

  /**
   * Probar un assistant (hacer una llamada de prueba)
   */
  async testAssistant(assistantId: string, phoneNumber: string): Promise<void> {
    try {
      await apiService.request(`${this.baseUrl}/assistants/${assistantId}/test`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
    } catch (error) {
      console.error('Error en testAssistant:', error);
      throw error;
    }
  }
}

export const vapiService = new VapiService();
