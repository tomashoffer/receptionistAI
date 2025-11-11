import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Phone, Calendar, Clock, User, Wrench, CheckCircle } from 'lucide-react';

interface ConversationDetailProps {
  callId: string;
}

interface TranscriptMessage {
  timestamp: string;
  speaker: 'ai' | 'user';
  message: string;
  toolCall?: {
    name: string;
    params?: Record<string, any>;
    response?: Record<string, any>;
  };
}

const mockTranscript: TranscriptMessage[] = [
  {
    timestamp: '14:30:05',
    speaker: 'ai',
    message: '¡Hola! Gracias por llamar. ¿En qué puedo ayudarte hoy?',
  },
  {
    timestamp: '14:30:12',
    speaker: 'user',
    message: 'Hola, me gustaría agendar una cita para un corte de cabello.',
  },
  {
    timestamp: '14:30:15',
    speaker: 'ai',
    message: 'Perfecto, estaré encantado de ayudarte a agendar tu cita. ¿Podrías decirme tu nombre completo, por favor? Y si es un apellido compuesto, lo deletreas para asegurarme de registrarlo correctamente.',
  },
  {
    timestamp: '14:30:25',
    speaker: 'user',
    message: 'Claro, mi nombre es María García. García es G-A-R-C-Í-A.',
  },
  {
    timestamp: '14:30:28',
    speaker: 'ai',
    message: 'Gracias, María García. Ahora, ¿me das tu número de teléfono? Por favor, dímelo dígito por dígito para evitar errores.',
  },
  {
    timestamp: '14:30:38',
    speaker: 'user',
    message: 'Sí, es 5-5-1-2-3-4-5-6-7-8.',
  },
  {
    timestamp: '14:30:42',
    speaker: 'ai',
    message: 'Perfecto, +52 55 1234 5678. ¿Qué día te gustaría venir?',
    toolCall: {
      name: 'get_current_datetime',
      params: {},
      response: { datetime: '2025-11-10T14:30:42Z', date: '10 de Noviembre, 2025' },
    },
  },
  {
    timestamp: '14:30:50',
    speaker: 'user',
    message: 'Me gustaría para el próximo viernes.',
  },
  {
    timestamp: '14:30:53',
    speaker: 'ai',
    message: 'Déjame revisar la disponibilidad para el viernes 15 de noviembre...',
    toolCall: {
      name: 'resolve_date',
      params: { user_input: 'próximo viernes', current_date: '2025-11-10' },
      response: { resolved_date: '2025-11-15', day_name: 'viernes' },
    },
  },
  {
    timestamp: '14:30:55',
    speaker: 'ai',
    message: 'Un momento mientras verifico los horarios disponibles...',
    toolCall: {
      name: 'check_availability',
      params: {
        date: '2025-11-15',
        service: 'Corte de Cabello',
        duration: 60,
      },
      response: {
        available: true,
        slots: ['09:00', '10:00', '14:30', '16:00', '17:30'],
      },
    },
  },
  {
    timestamp: '14:31:02',
    speaker: 'ai',
    message: 'Tengo disponibilidad para el viernes 15 de noviembre. ¿Qué hora te viene mejor? Tengo: 9:00 AM, 10:00 AM, 2:30 PM, 4:00 PM o 5:30 PM.',
  },
  {
    timestamp: '14:31:12',
    speaker: 'user',
    message: 'Me viene bien a las 2:30 PM.',
  },
  {
    timestamp: '14:31:15',
    speaker: 'ai',
    message: 'Excelente, déjame confirmar tu cita...',
    toolCall: {
      name: 'create_appointment',
      params: {
        customer_name: 'María García',
        phone: '+525512345678',
        date: '2025-11-15',
        time: '14:30',
        service: 'Corte de Cabello',
      },
      response: {
        success: true,
        appointment_id: 'APT-2025-001234',
        calendar_event_id: 'cal_xyz789',
      },
    },
  },
  {
    timestamp: '14:31:20',
    speaker: 'ai',
    message: '¡Listo, María! Tu cita ha sido confirmada para el viernes 15 de noviembre a las 2:30 PM para un Corte de Cabello. Tu número de confirmación es APT-2025-001234. Te enviaré un recordatorio un día antes. ¿Hay algo más en lo que pueda ayudarte?',
  },
  {
    timestamp: '14:31:30',
    speaker: 'user',
    message: 'No, eso es todo. Muchas gracias.',
  },
  {
    timestamp: '14:31:33',
    speaker: 'ai',
    message: 'Ha sido un placer ayudarte, María. ¡Nos vemos el viernes! Que tengas un excelente día.',
  },
];

export function ConversationDetail({ callId }: ConversationDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Auditoría Conversacional</h1>
        <p className="text-slate-600 mt-1">
          Transcripción completa con trazabilidad de tool calls
        </p>
      </div>

      {/* Call Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-600">Contacto</p>
                <p className="text-sm">María García</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-600">Teléfono</p>
                <p className="text-sm">+52 55 1234 5678</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-600">Fecha</p>
                <p className="text-sm">10 Nov, 2025 14:30</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-600">Duración</p>
                <p className="text-sm">4:12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripción Completa</CardTitle>
          <CardDescription>
            Conversación con etiquetas de tool calls para auditoría de comportamiento del LLM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {mockTranscript.map((item, index) => (
                <div key={index}>
                  <div
                    className={`flex ${
                      item.speaker === 'ai' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        item.speaker === 'ai'
                          ? 'bg-indigo-50 border border-indigo-100'
                          : 'bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={
                            item.speaker === 'ai'
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }
                        >
                          {item.speaker === 'ai' ? '🤖 AI' : '👤 Usuario'}
                        </Badge>
                        <span className="text-xs text-slate-500">{item.timestamp}</span>
                      </div>
                      <p className="text-sm">{item.message}</p>
                    </div>
                  </div>

                  {/* Tool Call Display */}
                  {item.toolCall && (
                    <div className="ml-8 mt-2">
                      <div className="border-l-4 border-orange-400 pl-4 py-3 bg-orange-50 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="h-4 w-4 text-orange-600" />
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                            🛠️ Tool Call: {item.toolCall.name}
                          </Badge>
                        </div>
                        {item.toolCall.params && Object.keys(item.toolCall.params).length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-600 mb-1">Parámetros:</p>
                            <div className="bg-white rounded p-2 text-xs font-mono border">
                              {JSON.stringify(item.toolCall.params, null, 2)}
                            </div>
                          </div>
                        )}
                        {item.toolCall.response && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <p className="text-xs text-slate-600">Respuesta:</p>
                            </div>
                            <div className="bg-white rounded p-2 text-xs font-mono border border-green-200">
                              {JSON.stringify(item.toolCall.response, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Análisis de la Conversación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm text-green-900">
              <strong>Flujo Completado:</strong> El asistente siguió correctamente el flujo de agendamiento híbrido.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm text-green-900">
              <strong>Tools Ejecutadas:</strong> 4 llamadas a tools (get_current_datetime, resolve_date, check_availability, create_appointment).
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm text-green-900">
              <strong>Inicio Silencioso:</strong> El asistente no mencionó la fecha actual, siguiendo la instrucción del prompt.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm text-green-900">
              <strong>Validaciones:</strong> Se deletreó el apellido y se confirmó el teléfono dígito por dígito correctamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
