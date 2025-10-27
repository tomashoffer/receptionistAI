const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private token: string | null = null;

  async initializeToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
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
    // Asegurar que tenemos el token antes de hacer la request
    if (!this.token) {
      await this.initializeToken();
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    const authHeaders = this.getAuthHeaders();
    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, config);
    
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
        errorMessage = errorData.message || errorMessage;
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
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
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
      const tokenResponse = await fetch(`${API_BASE_URL}/auth/token`, {
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
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      // 1. Llamar al backend para hacer logout
      await this.request('/auth/logout', { method: 'POST' });
      
      // 2. Limpiar token interno
      this.token = null;
      
      // 3. Eliminar cookies manualmente del navegador
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      
      // 4. Limpiar cualquier token en localStorage/sessionStorage si existe
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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
}

export const apiService = new ApiService();
