import { VoiceProvider, ModelProvider, AssistantStatus } from '../entities/assistant.entity';

export interface ToolConfig {
  name: string;
  description: string;
  parameters: any; // JSON schema
  webhook_url?: string;
  webhook_secret?: string;
  enabled: boolean;
  default_required_fields: string[];
}

// Configuración por defecto de herramientas comunes
export const DEFAULT_TOOLS: ToolConfig[] = [
  {
    name: 'create_appointment',
    description: 'Crear una nueva cita para el cliente',
    parameters: {
      type: 'object',
      properties: {
        date: {
          description: 'Fecha de la cita (YYYY-MM-DD)',
          type: 'string',
          format: 'date'
        },
        time: {
          description: 'Hora de la cita (HH:MM)',
          type: 'string',
          pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
        },
        name: {
          description: 'Nombre completo del cliente',
          type: 'string',
          minLength: 2,
          maxLength: 100
        },
        email: {
          description: 'Email del cliente',
          type: 'string',
          format: 'email'
        },
        phone: {
          description: 'Teléfono del cliente',
          type: 'string',
          pattern: '^[+]?[0-9\\s\\-\\(\\)]{7,20}$'
        },
        service: {
          description: 'Tipo de servicio solicitado',
          type: 'string',
          enum: ['consulta', 'tratamiento', 'seguimiento', 'emergencia']
        },
        notes: {
          description: 'Notas adicionales sobre la cita',
          type: 'string',
          maxLength: 500
        }
      },
      required: ['name', 'email', 'phone', 'service', 'date', 'time']
    },
    webhook_url: 'https://ontogenetic-janene-accommodational.ngrok-free.dev/webhook-test/elevenlabs-appointment',
    enabled: true,
    default_required_fields: ['name', 'email', 'phone', 'service', 'date', 'time']
  },
  {
    name: 'get_business_hours',
    description: 'Obtener los horarios de atención del negocio',
    parameters: {
      type: 'object',
      properties: {
        day: {
          description: 'Día de la semana (opcional)',
          type: 'string',
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
      },
      required: []
    },
    enabled: true,
    default_required_fields: []
  },
  {
    name: 'get_services',
    description: 'Obtener la lista de servicios disponibles',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    enabled: true,
    default_required_fields: []
  },
  {
    name: 'cancel_appointment',
    description: 'Cancelar una cita existente',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          description: 'ID de la cita a cancelar',
          type: 'string'
        },
        reason: {
          description: 'Motivo de la cancelación',
          type: 'string',
          maxLength: 200
        }
      },
      required: ['appointment_id']
    },
    enabled: false, // Deshabilitado por defecto
    default_required_fields: ['appointment_id']
  }
];

// Configuración por defecto para crear un asistente
export const DEFAULT_ASSISTANT_CONFIG = {
  name: 'Recepcionista AI',
  prompt: 'Eres un asistente de voz amigable y profesional que habla en español. Tu trabajo es atender llamadas telefónicas de manera eficiente y ayudar a los clientes con sus consultas y citas.',
  first_message: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  voice_provider: VoiceProvider.AZURE,
  voice_id: 'es-ES-ElviraNeural',
  language: 'es-ES',
  model_provider: ModelProvider.OPENAI,
  model_name: 'gpt-4o-mini',
  status: AssistantStatus.DRAFT,
  tools: DEFAULT_TOOLS.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    webhook_url: tool.webhook_url,
    webhook_secret: tool.webhook_secret,
    enabled: tool.enabled
  })),
  required_fields: DEFAULT_TOOLS.reduce((acc, tool) => {
    acc[tool.name] = tool.default_required_fields;
    return acc;
  }, {} as Record<string, string[]>)
};
