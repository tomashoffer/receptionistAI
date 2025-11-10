/**
 * Herramientas (Tools) para VAPI
 * Estas son las funciones que el asistente puede llamar durante una conversación
 */

// ========================================
// TOOLS DE FECHA Y HORA (CRÍTICAS)
// ========================================

// Tool para obtener fecha/hora actual
export const GET_CURRENT_DATETIME_TOOL = {
  type: 'function',
  async: false,
  messages: [],
  function: {
    name: 'get_current_datetime',
    description: 'CRÍTICO: Debes llamar a esta función INMEDIATAMENTE al inicio de CADA conversación para obtener la fecha y hora actuales. Si el usuario pregunta la fecha (ej: "¿qué día es hoy?"), DEBES usar esta función.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

// Tool para normalizar fechas textuales
export const RESOLVE_DATE_TOOL = {
  type: 'function',
  async: false,
  messages: [],
  function: {
    name: 'resolve_date',
    description: 'Convierte fecha textual ("mañana", "lunes") a YYYY-MM-DD.',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Texto de la fecha'
        },
        tz: {
          type: 'string',
          description: 'Zona horaria'
        },
        lang: {
          type: 'string',
          description: 'Idioma (es/en)'
        }
      },
      required: ['text']
    }
  }
};

// ========================================
// TOOLS DE AGENDAMIENTO
// ========================================

// Herramienta para crear citas
export const CREATE_APPOINTMENT_TOOL = {
  type: 'function',
  async: false,
  messages: [],
  function: {
    name: 'create_appointment',
    description: 'Crea una cita con toda la información del cliente.',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Nombre completo del cliente'
        },
        clientPhone: {
          type: 'string',
          description: 'Número de teléfono del cliente (sin espacios ni guiones)'
        },
        clientEmail: {
          type: 'string',
          description: 'Email del cliente (opcional)'
        },
        serviceType: {
          type: 'string',
          description: 'Tipo de servicio solicitado (ej: consulta médica, revisión, emergencia)'
        },
        appointmentDate: {
          type: 'string',
          description: 'Fecha de la cita en formato YYYY-MM-DD'
        },
        appointmentTime: {
          type: 'string',
          description: 'Hora de la cita en formato HH:MM (24 horas)'
        },
        notes: {
          type: 'string',
          description: 'Notas adicionales sobre la cita'
        }
      },
      required: ['clientName', 'clientPhone', 'appointmentDate', 'appointmentTime']
    }
  }
};

// Herramienta para verificar disponibilidad
export const CHECK_AVAILABILITY_TOOL = {
  type: 'function',
  async: false,
  messages: [],
  function: {
    name: 'check_availability',
    description: 'Verifica disponibilidad para fecha y hora específica.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'YYYY-MM-DD'
        },
        time: {
          type: 'string',
          description: 'HH:MM (24h)'
        },
        serviceType: {
          type: 'string',
          description: 'Tipo de servicio'
        }
      },
      required: ['date', 'time']
    }
  }
};

// Herramienta para cancelar citas
export const CANCEL_APPOINTMENT_TOOL = {
  type: 'function',
  async: false,
  messages: [],
  function: {
    name: 'cancel_appointment',
    description: 'Cancela una cita existente del cliente.',
    parameters: {
      type: 'object',
      properties: {
        clientPhone: {
          type: 'string',
          description: 'Número de teléfono del cliente'
        },
        appointmentDate: {
          type: 'string',
          description: 'Fecha de la cita a cancelar en formato YYYY-MM-DD'
        }
      },
      required: ['clientPhone', 'appointmentDate']
    }
  }
};

// Array con todas las herramientas (ORDEN IMPORTANTE)
export const VAPI_TOOLS = [
  GET_CURRENT_DATETIME_TOOL,      // 1. PRIMERO: Obtener fecha actual
  RESOLVE_DATE_TOOL,               // 2. SEGUNDO: Interpretar fecha del usuario
  CHECK_AVAILABILITY_TOOL,         // 3. TERCERO: Verificar disponibilidad
  CREATE_APPOINTMENT_TOOL,         // 4. CUARTO: Crear la cita
  CANCEL_APPOINTMENT_TOOL,         // 5. QUINTO: Cancelar cita
];

/**
 * Voces disponibles de ElevenLabs en Vapi
 */

// Voces en español
export const VAPI_VOICES_ES = {
  MALENA_TANGO: {
    id: '1WXz8v08ntDcSTeVXMN2',
    name: 'Malena Tango',
    gender: 'female',
    language: 'es',
    description: 'Mujer, español argentino'
  },
  FRANCO: {
    id: 'PBi4M0xL4G7oVYxKgqww',
    name: 'Franco',
    gender: 'male',
    language: 'es',
    description: 'Hombre, español'
  },
  MELANIE: {
    id: 'bN1bDXgDIGX5lw0rtY2B',
    name: 'Melanie',
    gender: 'female',
    language: 'es',
    description: 'Mujer, español'
  },
};

// Voces en inglés
export const VAPI_VOICES_EN = {
  CHRISTINA: {
    id: '2qfp6zPuviqeCOZIE9RZ',
    name: 'Christina',
    gender: 'female',
    language: 'en',
    description: 'Mujer, inglés'
  },
  CHRISTOPHER: {
    id: 'DHeSUVQvhhYeIxNUbtj3',
    name: 'Christopher',
    gender: 'male',
    language: 'en',
    description: 'Hombre, inglés'
  },
  AARON: {
    id: 'D9Thk1W7FRMgiOhy3zVI',
    name: 'Aaron',
    gender: 'male',
    language: 'en',
    description: 'Hombre, inglés'
  },
};

/**
 * Configuraciones predefinidas de asistentes
 * Stack económico: GPT-4o Mini + OpenAI TTS + Deepgram STT
 */

// Configuración del asistente en español
export const VAPI_ASSISTANT_CONFIG_ES = {
  name: 'Recepcionista AI - Español',
  language: 'es',
  
  // Modelo: GPT-4o Mini (económico)
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 250,
    messages: [
      {
        role: 'system',
        content: `Eres una recepcionista AI profesional y amigable. Tu trabajo es agendar citas de manera eficiente y natural.

INSTRUCCIONES:
- Saluda al cliente de manera cálida y profesional
- Recopila la información necesaria para agendar la cita
- Si falta información, pregunta de manera natural
- Confirma todos los detalles antes de crear la cita
- Usa un tono conversacional y amigable
- Habla en español de manera natural y fluida
- Sé breve y conciso en tus respuestas (máximo 2-3 oraciones)
- No repitas información que el cliente ya te dio

INFORMACIÓN A RECOPILAR:
1. Nombre completo del cliente
2. Número de teléfono
3. Email (opcional, no insistas si no lo tiene)
4. Tipo de servicio que necesita
5. Fecha preferida para la cita
6. Hora preferida
7. Notas adicionales (opcional)

FLUJO DE CONVERSACIÓN:
1. Saluda y pregunta en qué puedes ayudar
2. Si quiere agendar, pregunta su nombre
3. Luego su teléfono
4. Luego el tipo de servicio
5. Luego fecha y hora juntas (ej: "¿Qué fecha y hora te viene mejor?")
6. Si menciona email, tómalo. Si no, no insistas
7. Confirma TODOS los datos antes de llamar a la función
8. Llama a create_appointment solo cuando tengas al menos: nombre, teléfono, fecha y hora

Cuando tengas toda la información necesaria, usa la función create_appointment para agendar la cita.`
      }
    ]
  },
  
  // Voice: OpenAI TTS (económico) - Stack más barato
  voice: {
    provider: 'openai',
    model: 'tts-1',
  },
  
  // Para usar ElevenLabs (mejor calidad pero más caro):
  // voice: {
  //   provider: '11labs',
  //   voiceId: VAPI_VOICES_ES.MALENA_TANGO.id,
  // },
  
  // Transcriber: Deepgram (económico y rápido)
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'es',
  },
  
  // Primer mensaje
  firstMessage: '¡Hola! Bienvenido. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  
  // Herramientas
  tools: VAPI_TOOLS,
  
  // Webhook URL
  serverUrl: `${process.env.NEXT_PUBLIC_API_URL}/voice/webhooks/vapi`,
  
  // Configuración adicional
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 600,
  backgroundSound: 'off',
  endCallPhrases: ['hasta luego entonces', 'me despido', 'chau gracias por llamar', 'que tengas un buen día'],
  
  clientMessages: [
    'conversation-update',
    'function-call',
    'hang',
    'metadata',
    'speech-update',
    'status-update',
    'transcript',
    'tool-calls',
  ],
};

// Configuración del asistente en inglés
export const VAPI_ASSISTANT_CONFIG_EN = {
  name: 'Receptionist AI - English',
  language: 'en',
  
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 250,
    messages: [
      {
        role: 'system',
        content: `You are a professional and friendly AI receptionist. Your job is to schedule appointments efficiently and naturally.

INSTRUCTIONS:
- Greet the customer warmly and professionally
- Collect the necessary information to schedule the appointment
- If information is missing, ask naturally
- Confirm all details before creating the appointment
- Use a conversational and friendly tone
- Be brief and concise in your responses (maximum 2-3 sentences)

INFORMATION TO COLLECT:
1. Customer's full name
2. Phone number
3. Email (optional)
4. Type of service needed
5. Preferred appointment date
6. Preferred time
7. Additional notes (optional)

When you have all the necessary information, use the create_appointment function to schedule the appointment.`
      }
    ]
  },
  
  voice: {
    provider: 'openai',
    model: 'tts-1',
  },
  
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en',
  },
  
  firstMessage: 'Hello! Welcome. I\'m your virtual assistant. How can I help you today?',
  
  tools: VAPI_TOOLS,
  
  serverUrl: `${process.env.NEXT_PUBLIC_API_URL}/voice/webhooks/vapi`,
  
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 600,
  backgroundSound: 'off',
  endCallPhrases: ['goodbye then', 'have a great day', 'thanks for calling'],
  
  clientMessages: [
    'conversation-update',
    'function-call',
    'hang',
    'metadata',
    'speech-update',
    'status-update',
    'transcript',
    'tool-calls',
  ],
};
