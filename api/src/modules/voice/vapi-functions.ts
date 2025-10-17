// Funciones que VAPI puede llamar para crear citas
export const VAPI_FUNCTIONS = [
  {
    name: 'create_appointment',
    description: 'Crear una nueva cita médica o de servicio',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Nombre completo del cliente'
        },
        clientPhone: {
          type: 'string',
          description: 'Número de teléfono del cliente'
        },
        clientEmail: {
          type: 'string',
          description: 'Email del cliente'
        },
        serviceType: {
          type: 'string',
          description: 'Tipo de servicio solicitado'
        },
        appointmentDate: {
          type: 'string',
          description: 'Fecha de la cita en formato YYYY-MM-DD'
        },
        appointmentTime: {
          type: 'string',
          description: 'Hora de la cita en formato HH:MM'
        },
        notes: {
          type: 'string',
          description: 'Notas adicionales sobre la cita'
        }
      },
      required: ['clientName', 'clientPhone', 'appointmentDate', 'appointmentTime']
    }
  },
  {
    name: 'check_availability',
    description: 'Verificar disponibilidad de horarios',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Fecha a verificar en formato YYYY-MM-DD'
        },
        serviceType: {
          type: 'string',
          description: 'Tipo de servicio'
        }
      },
      required: ['date']
    }
  },
  {
    name: 'cancel_appointment',
    description: 'Cancelar una cita existente',
    parameters: {
      type: 'object',
      properties: {
        clientPhone: {
          type: 'string',
          description: 'Número de teléfono del cliente'
        },
        appointmentDate: {
          type: 'string',
          description: 'Fecha de la cita a cancelar'
        }
      },
      required: ['clientPhone', 'appointmentDate']
    }
  }
];

// Configuración del Assistant de VAPI
export const VAPI_ASSISTANT_CONFIG = {
  name: 'Recepcionista AI',
  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 150
  },
  voice: {
    provider: 'elevenlabs',
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'vqoh9orw2tmOS3mY7D2p'
  },
  functions: VAPI_FUNCTIONS,
  systemPrompt: `Eres una recepcionista AI profesional y amigable. Tu trabajo es agendar citas de manera eficiente y natural.

INSTRUCCIONES:
- Saluda al cliente de manera cálida y profesional
- Recopila la información necesaria para agendar la cita
- Si falta información, pregunta de manera natural
- Confirma todos los detalles antes de crear la cita
- Usa un tono conversacional y amigable
- Habla en español de manera natural

INFORMACIÓN A RECOPILAR:
- Nombre completo del cliente
- Número de teléfono
- Email (opcional)
- Tipo de servicio
- Fecha y hora preferida
- Notas adicionales (opcional)

Cuando tengas toda la información necesaria, usa la función create_appointment para agendar la cita.`,
  
  webhookUrl: `${process.env.NEXT_PUBLIC_API_URL}/voice/webhooks/vapi`,
  
  // Configuración de la llamada
  callConfig: {
    maxDurationSeconds: 300, // 5 minutos máximo
    silenceTimeoutSeconds: 2, // 2 segundos de silencio para detectar fin de frase
    noiseThreshold: 0.1, // Umbral de ruido
  }
};


