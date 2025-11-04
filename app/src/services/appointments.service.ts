const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status: string;
  googleCalendarEventId?: string;
  googleSheetsRowId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  email: string | null;
  connected_at: string | null;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
}

export const appointmentsService = {
  async getStatus(businessId: string): Promise<GoogleCalendarStatus> {
    const response = await fetch(`${API_BASE_URL}/google-calendar/status/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo estado de Google Calendar');
    }
    
    return response.json();
  },

  async connectGoogleCalendar(businessId: string): Promise<void> {
    window.location.href = `${API_BASE_URL}/google-calendar/auth/start/${businessId}`;
  },

  async disconnectGoogleCalendar(businessId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/google-calendar/disconnect/${businessId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error desconectando Google Calendar');
    }
  },

  async getAll(businessId: string): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/api/appointments?businessId=${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo appointments');
    }
    
    return response.json();
  },

  async create(appointment: Partial<Appointment>): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(appointment),
    });
    
    if (!response.ok) {
      throw new Error('Error creando appointment');
    }
    
    return response.json();
  },

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(appointment),
    });
    
    if (!response.ok) {
      throw new Error('Error actualizando appointment');
    }
    
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error eliminando appointment');
    }
  },

  async getGoogleCalendarEvents(businessId: string, timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    const params = new URLSearchParams();
    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);
    
    const url = `${API_BASE_URL}/google-calendar/events/${businessId}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo eventos de Google Calendar');
    }
    
    return response.json();
  },
};

