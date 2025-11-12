import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUserStore } from '../../stores/userStore';
import { businessAppointmentType, appointmentTypeLabels } from '../../config/businessTypeContent';

interface ConfigField {
  label: string;
  value: string;
  locked: boolean;
  multiline?: boolean;
  rows?: number;
}

interface Situacion {
  id: number;
  numero: number;
  titulo: string;
  descripcion: string;
}

export function ConfiguracionAsistenteTab() {
  const { activeBusiness } = useUserStore();
  
  // Determine appointment type and labels
  const appointmentType = useMemo(() => {
    const industry = activeBusiness?.industry;
    if (!industry) return 'appointment' as const;
    return businessAppointmentType[industry as keyof typeof businessAppointmentType] || ('appointment' as const);
  }, [activeBusiness]);

  const labels = useMemo(() => {
    return appointmentTypeLabels[appointmentType as keyof typeof appointmentTypeLabels];
  }, [appointmentType]);

  // Dynamic label for business info
  const businessInfoLabel = useMemo(() => {
    if (!activeBusiness) return 'Información del negocio';
    switch (activeBusiness.industry) {
      case 'hotel':
        return 'Información del hotel';
      case 'restaurant':
        return 'Información del restaurante';
      case 'hair_salon':
        return 'Información de la peluquería';
      case 'dental_clinic':
      case 'medical_clinic':
        return 'Información de la clínica';
      case 'beauty_salon':
        return 'Información del salón';
      default:
        return 'Información del negocio';
    }
  }, [activeBusiness]);

  const [fields, setFields] = useState<Record<string, ConfigField>>({
    nombre: {
      label: 'Nombre del asistente',
      value: 'Camila',
      locked: true
    },
    tono: {
      label: 'Tono',
      value: 'Formal',
      locked: true
    },
    establecimiento: {
      label: 'Nombre del establecimiento',
      value: 'Edelweiss',
      locked: true
    },
    ubicacion: {
      label: 'Ubicación',
      value: 'Punta del Este',
      locked: true
    },
    tipoEstablecimiento: {
      label: 'Tipo de establecimiento',
      value: 'Hotel 5 estrellas',
      locked: true
    },
    infoHotel: {
      label: 'Información del hotel',
      value: 'Un hotel boutique 5 estrellas en Punta del Este, Uruguay; Ambiente exclusivo y acogedor inspirado en los Alpes suizos; Diseño arquitectónico que fusiona elegancia europea con calidez uruguaya; Servicios premium personalizados.',
      locked: true,
      multiline: true,
      rows: 4
    },
    propuesta: {
      label: 'Propuesta de valor',
      value: 'Experimentar la sofisticación alpina con servicios excepcionales en un entorno costero privilegiado. Ideal para viajeros que buscan exclusividad y atención al detalle en uno de los destinos más codiciados de Sudamérica.',
      locked: true,
      multiline: true,
      rows: 4
    },
    web: {
      label: 'Página web',
      value: 'https://edelweiss.uy',
      locked: true
    }
  });

  const [directrices, setDirectrices] = useState({
    value: `• Da análisis curiosos y entretenidos.
• Da una respuesta corta y dinámica de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" en tono de ventas.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• No recomiendes servicios, actividades, atracciones turísticas, gastronomía o restaurantes que no hayas consultado en el "conocimiento/context".
• Responde SOLO preguntas y consultas relacionadas al establecimiento, operaciones de check-in/out, amenities, servicios, ubicación, restaurantes del hotel y actividades en Punta del Este.
• La información del establecimiento es PRIORIDAD ABSOLUTA. Responde sobre el hotel en cada consulta.
• Camila no puede brindar info/recomendaciones que no estén en el "conocimiento/context".
• Conocimiento/context: El servicio tiene fecha y horario de registro de entrada y registro de salida, incluir dichos datos en la conversación.`,
    locked: true
  });

  const [situacionesExpanded, setSituacionesExpanded] = useState(false);
  const [situaciones, setSituaciones] = useState<Situacion[]>([
    {
      id: 1,
      numero: 1,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'No conocemos la reserva que cliente booking confirmó/ons'
    },
    {
      id: 2,
      numero: 2,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'El cliente menciona que le envió un mail o mensaje a IFFY Letters, Booking/Airb, ETC pero no sabe'
    },
    {
      id: 3,
      numero: 3,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'Ticket no emitido o cancelado / Confirmó y Donde lo hicieron de cheque'
    },
    {
      id: 4,
      numero: 4,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'Hay problemas o Inconvenientes / Cualquier Deseos (Pillow, Amenities de Cheque'
    },
    {
      id: 5,
      numero: 5,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'Quieren contactarnos a la recepción o frontdesk/recibe mientras lo atenderán que'
    },
    {
      id: 6,
      numero: 6,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'Cualquier RECLAMO'
    },
    {
      id: 7,
      numero: 7,
      titulo: 'SETTER CITA / LEAD',
      descripcion: 'Consulta pregunta por un familiar'
    },
    {
      id: 8,
      numero: 8,
      titulo: 'Agregar nueva situación',
      descripcion: ''
    }
  ]);

  const toggleLock = (fieldName: string) => {
    setFields({
      ...fields,
      [fieldName]: {
        ...fields[fieldName],
        locked: !fields[fieldName].locked
      }
    });
  };

  const updateField = (fieldName: string, value: string) => {
    setFields({
      ...fields,
      [fieldName]: {
        ...fields[fieldName],
        value
      }
    });
  };

  const generatePrompt = () => {
    return `<rules>
<role>Eres "${fields.nombre.value}", asistente de reservas de "${fields.establecimiento.value}". Tus acciones consultan servicios diseñados específicamente para "${fields.establecimiento.value}", un establecimiento en ${fields.ubicacion.value}. Ayuda a los visitantes a reservar sus vacaciones. Debes confirmar con quién estás hablando (nombre completo), la fecha de ingreso y la fecha de egreso, además del tipo de habitación y método de pago.</role>

Tu acción es calendario las preguntas del cliente. Deberás primero consultar los horarios de forma automática en base a lo Libre de ellos es (calendario.com/edelweiss), si verificas que hay disponibilidad, solicitarás fecha y calendario.

Hablas en ${fields.tono.value.toLowerCase()}.

Debes verificar al cliente las preguntas requeridas para generar una reserva.

De preguntas de clientes y consultas generales que no estás capacitado para ayudar DEBES decir que escriba sobre eso y enviará la pregunta a un representante, aunque seas capaz de responder. Aquí indicarás que pueden responderle dentro de 24 horas (usando la función [contact]). Dado esto ocurra, el colaborador recibirá una notificación.

SOLO realizarás la función () si lo consideras estrictamente NECESARIO. Caso así lo habilitó la persona para que lo agendes. El cliente debe decir "sí" en estado de manera para que lo agendes "Por favor"; cuando uses calendar(), "antes" es mejor si "Cuando"; no usar calendar(). El calendario te proporcionará los horarios de disponibilidad.

${directrices.value}

# Conversación de ejemplo:
Cliente (Conversacional):
Necesito reservar el mejor hotel
Asistente (conversacional):
¡Hola! soy Camila, y vivo aceptar tu consulta para que puedas tener la mejor experiencia. Ya verificaré disponibilidad según calendario (calendar.com/Edelweiss/calendar) en vacaciones. Por ejemplo: en las fechas del especial de enero de tu vuelo (to load "Edelweiss/calendar)].

[IMPORTANTE]:
</rules>

Nombre: ${fields.nombre.value}
Establecimiento: ${fields.establecimiento.value}
Ubicación: ${fields.ubicacion.value}
Tipo: ${fields.tipoEstablecimiento.value}

Información del hotel:
${fields.infoHotel.value}

Propuesta de valor:
${fields.propuesta.value}

Página web: ${fields.web.value}`;
  };

  const renderPromptWithHighlights = () => {
    return (
      <>
        <span>&lt;rules&gt;</span>
        {'\n'}
        <span>&lt;role&gt;Eres "</span>
        <span className="underline decoration-2 decoration-purple-400">{fields.nombre.value}</span>
        <span>", asistente de reservas de "</span>
        <span className="underline decoration-2 decoration-purple-400">{fields.establecimiento.value}</span>
        <span>". Tus acciones consultan servicios diseñados específicamente para "</span>
        <span className="underline decoration-2 decoration-purple-400">{fields.establecimiento.value}</span>
        <span>", un establecimiento en </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.ubicacion.value}</span>
        <span>. Ayuda a los visitantes a reservar sus vacaciones. Debes confirmar con quién estás hablando (nombre completo), la fecha de ingreso y la fecha de egreso, además del tipo de habitación y método de pago.&lt;/role&gt;</span>
        {'\n\n'}
        <span>Tu acción es calendario las preguntas del cliente. Deberás primero consultar los horarios de forma automática en base a lo Libre de ellos es (calendario.com/edelweiss), si verificas que hay disponibilidad, solicitarás fecha y calendario.</span>
        {'\n\n'}
        <span>Hablas en </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.tono.value.toLowerCase()}</span>
        <span>.</span>
        {'\n\n'}
        <span>Debes verificar al cliente las preguntas requeridas para generar una reserva.</span>
        {'\n\n'}
        <span>De preguntas de clientes y consultas generales que no estás capacitado para ayudar DEBES decir que escriba sobre eso y enviará la pregunta a un representante, aunque seas capaz de responder. Aquí indicarás que pueden responderle dentro de 24 horas (usando la función [contact]). Dado esto ocurra, el colaborador recibirá una notificación.</span>
        {'\n\n'}
        <span>SOLO realizarás la función () si lo consideras estrictamente NECESARIO. Caso así lo habilitó la persona para que lo agendes. El cliente debe decir "sí" en estado de manera para que lo agendes "Por favor"; cuando uses calendar(), "antes" es mejor si "Cuando"; no usar calendar(). El calendario te proporcionará los horarios de disponibilidad.</span>
        {'\n\n'}
        <span className="underline decoration-2 decoration-purple-400">{directrices.value}</span>
        {'\n\n'}
        <span># Conversación de ejemplo:</span>
        {'\n'}
        <span>Cliente (Conversacional):</span>
        {'\n'}
        <span>Necesito reservar el mejor hotel</span>
        {'\n'}
        <span>Asistente (conversacional):</span>
        {'\n'}
        <span>¡Hola! soy Camila, y vivo aceptar tu consulta para que puedas tener la mejor experiencia. Ya verificaré disponibilidad según calendario (calendar.com/Edelweiss/calendar) en vacaciones. Por ejemplo: en las fechas del especial de enero de tu vuelo (to load "Edelweiss/calendar)].</span>
        {'\n\n'}
        <span>[IMPORTANTE]:</span>
        {'\n'}
        <span>&lt;/rules&gt;</span>
        {'\n\n'}
        <span>Nombre: </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.nombre.value}</span>
        {'\n'}
        <span>Establecimiento: </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.establecimiento.value}</span>
        {'\n'}
        <span>Ubicación: </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.ubicacion.value}</span>
        {'\n'}
        <span>Tipo: </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.tipoEstablecimiento.value}</span>
        {'\n\n'}
        <span>Información del hotel:</span>
        {'\n'}
        <span className="underline decoration-2 decoration-purple-400">{fields.infoHotel.value}</span>
        {'\n\n'}
        <span>Propuesta de valor:</span>
        {'\n'}
        <span className="underline decoration-2 decoration-purple-400">{fields.propuesta.value}</span>
        {'\n\n'}
        <span>Página web: </span>
        <span className="underline decoration-2 decoration-purple-400">{fields.web.value}</span>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 p-4 md:p-6 lg:p-8">
      {/* Left Column - Prompt Preview */}
      <div className="space-y-3 md:space-y-4 order-2 lg:order-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg">Vista previa del prompt</h2>
          <span className="text-xs md:text-sm text-gray-500">{generatePrompt().length}/1500 caracteres</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 font-mono text-[10px] md:text-xs leading-relaxed overflow-x-auto">
          <div className="whitespace-pre-wrap">
            {renderPromptWithHighlights()}
          </div>
        </div>
      </div>

      {/* Right Column - Configuration Fields */}
      <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
        <div>
          <h2 className="text-lg mb-1">Información principal</h2>
          <Badge variant="outline" className="text-xs">Revisado</Badge>
        </div>

        {/* Nombre del asistente */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.nombre.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.nombre.locked}
                onCheckedChange={() => toggleLock('nombre')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Input 
            value={fields.nombre.value}
            onChange={(e) => updateField('nombre', e.target.value)}
            disabled={fields.nombre.locked}
            className={fields.nombre.locked ? 'bg-gray-50' : 'bg-white'}
          />
        </div>

        {/* Tono */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.tono.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.tono.locked}
                onCheckedChange={() => toggleLock('tono')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={fields.tono.value === 'Formal' ? 'default' : 'outline'}
              onClick={() => updateField('tono', 'Formal')}
              disabled={fields.tono.locked}
              className={fields.tono.value === 'Formal' ? 'bg-purple-600' : ''}
            >
              Formal
            </Button>
            <Button 
              variant={fields.tono.value === 'Informal' ? 'default' : 'outline'}
              onClick={() => updateField('tono', 'Informal')}
              disabled={fields.tono.locked}
              className={fields.tono.value === 'Informal' ? 'bg-purple-600' : ''}
            >
              Informal
            </Button>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-lg mb-1">Información del hotel</h2>
          <Badge variant="outline" className="text-xs">Revisado</Badge>
        </div>

        {/* Nombre del establecimiento */}
        <div className="pt-4">
          <h2 className="text-lg mb-1">{businessInfoLabel}</h2>
          <Badge variant="outline" className="text-xs">Revisado</Badge>
        </div>

        {/* Nombre del establecimiento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.establecimiento.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.establecimiento.locked}
                onCheckedChange={() => toggleLock('establecimiento')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Input 
            value={fields.establecimiento.value}
            onChange={(e) => updateField('establecimiento', e.target.value)}
            disabled={fields.establecimiento.locked}
            className={fields.establecimiento.locked ? 'bg-gray-50' : 'bg-white'}
          />
        </div>

        {/* Ubicación */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.ubicacion.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.ubicacion.locked}
                onCheckedChange={() => toggleLock('ubicacion')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Input 
            value={fields.ubicacion.value}
            onChange={(e) => updateField('ubicacion', e.target.value)}
            disabled={fields.ubicacion.locked}
            className={fields.ubicacion.locked ? 'bg-gray-50' : 'bg-white'}
          />
        </div>

        {/* Tipo de establecimiento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.tipoEstablecimiento.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.tipoEstablecimiento.locked}
                onCheckedChange={() => toggleLock('tipoEstablecimiento')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Input 
            value={fields.tipoEstablecimiento.value}
            onChange={(e) => updateField('tipoEstablecimiento', e.target.value)}
            disabled={fields.tipoEstablecimiento.locked}
            className={fields.tipoEstablecimiento.locked ? 'bg-gray-50' : 'bg-white'}
          />
        </div>

        {/* Información del hotel (textarea) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.infoHotel.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.infoHotel.locked}
                onCheckedChange={() => toggleLock('infoHotel')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Textarea 
            value={fields.infoHotel.value}
            onChange={(e) => updateField('infoHotel', e.target.value)}
            disabled={fields.infoHotel.locked}
            className={fields.infoHotel.locked ? 'bg-gray-50' : 'bg-white'}
            rows={fields.infoHotel.rows}
          />
        </div>

        <div className="pt-4">
          <h2 className="text-lg mb-1">Propuesta de valor</h2>
          <Badge variant="outline" className="text-xs">Revisado</Badge>
        </div>

        {/* Propuesta de valor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Propuesta de valor del establecimiento</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.propuesta.locked}
                onCheckedChange={() => toggleLock('propuesta')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Textarea 
            value={fields.propuesta.value}
            onChange={(e) => updateField('propuesta', e.target.value)}
            disabled={fields.propuesta.locked}
            className={fields.propuesta.locked ? 'bg-gray-50' : 'bg-white'}
            rows={fields.propuesta.rows}
          />
        </div>

        <div className="pt-4">
          <h2 className="text-lg mb-1">Página web</h2>
          <Badge variant="outline" className="text-xs">Revisado</Badge>
        </div>

        {/* Página web */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{fields.web.label}</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={fields.web.locked}
                onCheckedChange={() => toggleLock('web')}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Input 
            value={fields.web.value}
            onChange={(e) => updateField('web', e.target.value)}
            disabled={fields.web.locked}
            className={fields.web.locked ? 'bg-gray-50' : 'bg-white'}
          />
        </div>

        <div className="pt-4">
          <h2 className="text-lg mb-1">Directrices de comunicación</h2>
          <Badge variant="outline" className="text-xs">Revisado</Badge>
        </div>

        {/* Directrices */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Directrices específicas de comunicación</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={directrices.locked}
                onCheckedChange={() => setDirectrices({ ...directrices, locked: !directrices.locked })}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Textarea 
            value={directrices.value}
            onChange={(e) => setDirectrices({ ...directrices, value: e.target.value })}
            disabled={directrices.locked}
            className={directrices.locked ? 'bg-gray-50' : 'bg-white'}
            rows={10}
          />
          <p className="text-xs text-gray-500">{directrices.value.length}/1500 caracteres</p>
        </div>

        {/* Situaciones */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setSituacionesExpanded(!situacionesExpanded)}
            className="flex items-center justify-between w-full py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2"
          >
            <div className="flex items-center gap-2">
              {situacionesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h2 className="text-lg">Situaciones en las que el Asistente debe detenerse</h2>
            </div>
            <span className="text-sm text-purple-600">{situaciones.length - 1} situaciones configuradas</span>
          </button>

          {situacionesExpanded && (
            <div className="mt-4 space-y-3">
              {situaciones.map((situacion) => (
                <div 
                  key={situacion.id}
                  className={`border rounded-lg p-4 ${situacion.numero === 8 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={situacion.numero === 8 ? 'default' : 'outline'} className={situacion.numero === 8 ? 'bg-purple-600' : ''}>
                        Situación {situacion.numero}
                      </Badge>
                      <span className={situacion.numero === 8 ? 'text-purple-700' : 'text-gray-700'}>{situacion.titulo}</span>
                    </div>
                    {situacion.numero !== 8 && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {situacion.descripcion && (
                    <p className="text-sm text-gray-600 ml-2">{situacion.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}