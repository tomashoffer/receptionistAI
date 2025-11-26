const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private token: string | null = null;

  async initializeToken() {
    try {
      const response = await fetch('/api/auth/token', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          this.token = data.accessToken;
        }
      }
    } catch (error) {
      console.warn('No se pudo obtener el token de autenticación');
    }
  }

  hasValidToken(): boolean {
    return this.token !== null;
  }

  getCurrentToken(): string | null {
    return this.token;
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    // Mapear endpoints del backend a API routes del frontend
    let frontendEndpoint = endpoint;
    
    // Mapear endpoints de businesses
    if (endpoint.startsWith('/businesses')) {
      frontendEndpoint = `/api${endpoint}`;
    }
    // Mapear otros endpoints que necesiten API routes
    else if (endpoint.startsWith('/assistant-configs')) {
      frontendEndpoint = `/api${endpoint}`;
    }
    // Para otros endpoints, usar directamente (ya tienen su API route o no la necesitan)
    else {
      frontendEndpoint = `/api${endpoint}`;
    }
    
    // Asegurar que tenemos el token antes de hacer la request
    // Excepto para login y register que no requieren token
    if (!this.token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      await this.initializeToken();
    }
    
    const url = frontendEndpoint;
    const authHeaders = this.getAuthHeaders();
    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (error) {
      // Error de red (Failed to fetch)
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, intentar refresh
        await this.refreshToken();
        // Reintentar la request original
        return this.request(endpoint, options);
      }
      
      // Intentar obtener el mensaje de error del backend
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        // El backend puede devolver { message: '...' } o directamente el mensaje
        errorMessage = errorData.message || errorData.error?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON, usar mensajes por defecto
        switch (response.status) {
          case 400:
            errorMessage = 'Datos inválidos. Verifica la información ingresada.';
            break;
          case 401:
            errorMessage = 'No autorizado. Verifica tus credenciales.';
            break;
          case 403:
            errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
            break;
          case 404:
            errorMessage = 'Usuario no encontrado. Verifica tu email y contraseña.';
            break;
          case 409:
            errorMessage = 'El usuario ya existe. Intenta con otro email.';
            break;
          case 422:
            errorMessage = 'Datos de entrada inválidos.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          default:
            errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async refreshToken() {
    try {
      // Obtener el token de las cookies primero
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include',
      });
      
      let refreshToken = null;
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        refreshToken = tokenData.accessToken;
      }
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar el token interno
        if (data.token?.accessToken) {
          this.token = data.token.accessToken;
        }
        return data;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Auth endpoints - Usar API routes de Next.js para evitar problemas de CORS
  async login(email: string, password: string) {
    // Usar la API route de Next.js en lugar de llamar directamente al backend
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.json();
  }

  async register(userData: any) {
    // Usar la API route de Next.js en lugar de llamar directamente al backend
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.json();
  }

  async logout() {
    try {
      // 1. Llamar al backend para hacer logout (si existe la API route)
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.warn('No se pudo llamar al endpoint de logout:', error);
      }
      
      // 2. Limpiar token interno
      this.token = null;
      
      // 3. Eliminar cookies manualmente del navegador
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      
      // 4. Limpiar localStorage completamente (incluyendo stores de Zustand)
      localStorage.removeItem('assistant-storage');
      localStorage.removeItem('user-store-storage');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // 5. Limpiar sessionStorage
      sessionStorage.clear();
      
      console.log('✅ Logout completo: backend, cookies y storage limpiados');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    }
  }

  // Business endpoints
  async getBusiness() {
    return this.request('/businesses');
  }

  async getBusinesses() {
    return this.request('/businesses');
  }

  async getBusinessById(businessId: string) {
    return this.request(`/businesses/${businessId}`);
  }

  async createBusiness(data: any) {
    return this.request('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(businessId: string, data: any) {
    return this.request(`/businesses/${businessId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBusiness(businessId: string) {
    return this.request(`/businesses/${businessId}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async updateUser(data: any) {
    return this.request('/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }


  // Test Assistant endpoints
  async getTestConfig() {
    return this.request('/test-assistant/config');
  }

  async updateTestConfig(config: any) {
    return this.request('/test-assistant/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async createTestCall(testData: any) {
    return this.request('/test-assistant/test-call', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  async getTestCalls() {
    return this.request('/test-assistant/test-calls');
  }

  // Voice endpoints
  async processVoice(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch(`${API_BASE_URL}/voice/process`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al procesar el audio');
    }
    
    return response.json();
  }

  async generateSpeech(text: string) {
    const response = await fetch(`${API_BASE_URL}/voice/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Error al generar el audio');
    }
    
    return response.blob();
  }

  async processText(text: string) {
    return this.request('/voice/process-text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Call logs endpoints
  async getCallLogs(businessId: string, params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/call-logs?business_id=${businessId}&${queryParams}`);
  }

  async getCallStats(businessId: string, params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/call-logs/stats/${businessId}?${queryParams}`);
  }

  // Assistant Config endpoints
  async getAssistantConfig(businessId: string) {
    return this.request(`/assistant-configs/business/${businessId}`);
  }

  async getAssistantConfigById(configId: string) {
    return this.request(`/assistant-configs/${configId}`);
  }

  async createAssistantConfig(data: {
    business_id: string;
    industry: string;
    prompt: string;
    config_data: any;
  }) {
    return this.request('/assistant-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssistantConfig(configId: string, data: {
    prompt?: string;
    config_data?: any;
    behavior_config?: any;
    prompt_voice?: string;
    is_custom_prompt_voice?: boolean;
  }) {
    return this.request(`/assistant-configs/${configId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Voice/Vapi endpoints
  async createVapiAssistant(businessId: string, config?: any, endpoint: 'spanish' | 'english' = 'spanish') {
    return this.request(`/vapi/business/${businessId}/assistant/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(config || {}),
    });
  }

  async updateVapiAssistant(businessId: string, config: any) {
    return this.request(`/vapi/business/${businessId}/assistant`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
  }
}

export const apiService = new ApiService();
