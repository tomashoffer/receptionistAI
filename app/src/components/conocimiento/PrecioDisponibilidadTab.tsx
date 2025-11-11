import { useState } from 'react';
import { ChevronDown, ChevronRight, Megaphone, PlayCircle, Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';

interface AccordionSection {
  id: string;
  title: string;
  completed: number;
  total: number;
  borderColor: string;
  disabled?: boolean;
}

interface Situacion {
  id: number;
  titulo: string;
  descripcion: string;
}

export function PrecioDisponibilidadTab() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pagos']));

  // Pagos y Tarifas
  const [pagosTarifas, setPagosTarifas] = useState({
    pregunta1: '¿Cómo se determinan las tarifas del establecimiento?',
    respuesta1: '',
    pregunta2: '¿Hay tarifas especiales para grupos, eventos o estadías prolongadas?',
    respuesta2: '',
    pregunta3: '¿Qué métodos de pago se aceptan?',
    respuesta3: '',
    pregunta4: '¿Se requiere algún depósito o pago por adelantado?',
    respuesta4: '',
    pregunta5: '¿Cuál es la política de cancelación?',
    respuesta5: '',
    pregunta6: '¿Hay cargos adicionales que los clientes deben conocer?',
    respuesta6: '',
    pregunta7: '¿Ofrecen descuentos o promociones especiales?',
    respuesta7: '',
    pregunta8: '¿Cómo se manejan los reembolsos en caso de cancelación?',
    respuesta8: ''
  });

  // Proceso de reserva
  const [procesoReserva, setProcesoReserva] = useState({
    pregunta1: '¿Cómo puede un cliente hacer una reserva?',
    respuesta1: 'Los clientes pueden realizar reservas a través de nuestro sitio web, por teléfono o enviando un correo electrónico a reservas@edelweiss.uy',
    pregunta2: '¿Qué información se necesita para completar una reserva?',
    respuesta2: 'Necesitamos nombre completo, fecha de llegada y salida, tipo de habitación preferida y datos de contacto (email y teléfono)',
    pregunta3: '¿Cuánto tiempo antes se debe hacer una reserva?',
    respuesta3: 'Recomendamos reservar con al menos 48 horas de anticipación, especialmente durante temporada alta'
  });

  // Situaciones
  const [situaciones, setSituaciones] = useState<Situacion[]>([
    {
      id: 1,
      titulo: 'Consultas sobre precios fuera del rango estándar',
      descripcion: 'Si el cliente solicita cotizaciones para más de 10 habitaciones o eventos especiales'
    },
    {
      id: 2,
      titulo: 'Solicitudes de descuentos personalizados',
      descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
    }
  ]);

  // Configuración Avanzada
  const [configAvanzada, setConfigAvanzada] = useState({
    detenerseCotizacion: true,
    totalMinimo: '5000',
    instruccionesCalculo: 'Calcular el precio total multiplicando la tarifa por noche por el número de noches. Agregar impuestos del 10% y fee de servicio del 5%.',
    mensajeFijo: 'Nota: Todas nuestras tarifas incluyen desayuno buffet y acceso al spa. Los precios pueden variar según disponibilidad y temporada.'
  });

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const sections: AccordionSection[] = [
    { id: 'pagos', title: 'Pagos y Tarifas', completed: 0, total: 8, borderColor: 'border-l-green-500' },
    { id: 'proceso', title: 'Proceso de reserva', completed: 3, total: 3, borderColor: 'border-l-orange-500' },
    { id: 'situaciones', title: 'Situaciones en las que el Asistente debe detenerse', completed: 2, total: 0, borderColor: 'border-l-red-500' }
  ];

  const addSituacion = () => {
    const newId = Math.max(...situaciones.map(s => s.id), 0) + 1;
    setSituaciones([...situaciones, {
      id: newId,
      titulo: '',
      descripcion: ''
    }]);
  };

  const removeSituacion = (id: number) => {
    setSituaciones(situaciones.filter(s => s.id !== id));
  };

  const updateSituacion = (id: number, field: 'titulo' | 'descripcion', value: string) => {
    setSituaciones(situaciones.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Importante Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-purple-900">Importante</h3>
              <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                <PlayCircle className="w-4 h-4" />
                <span>Ver Video</span>
              </button>
            </div>
            <p className="text-sm text-purple-900/80 leading-relaxed">
              En este apartado podrán responder preguntas típicas al brindar cotizaciones o información para gestionar reservas. Además, 
              podrás configurar opciones avanzadas como cuando el asistente debe detenerse si dar cotizaciones, definir totales para 
              solicitar precios, dar instrucciones específicas para el cálculo de precios y establecer un mensaje fijo que se enviará 
              siempre al realizar cotizaciones. Es importante entender como funciona la integración en tu motor para realizar los ajustes necesarios.
            </p>
          </div>
        </div>
      </div>

      {/* PAGOS Y TARIFAS */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('pagos')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-green-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('pagos') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Pagos y Tarifas</span>
          </div>
          <span className="text-sm text-gray-500">0/8 preguntas</span>
        </button>

        {expandedSections.has('pagos') && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
            {/* Pregunta 1 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta1}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta1}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta1: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 2 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta2}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta2}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta2: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 3 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta3}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta3}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta3: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 4 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta4}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta4}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta4: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 5 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta5}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta5}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta5: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 6 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta6}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta6}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta6: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 7 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta7}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta7}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta7: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 8 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{pagosTarifas.pregunta8}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={pagosTarifas.respuesta8}
                onChange={(e) => setPagosTarifas({...pagosTarifas, respuesta8: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* PROCESO DE RESERVA */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('proceso')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-orange-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('proceso') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Proceso de reserva</span>
          </div>
          <span className="text-sm text-gray-500">3/3 preguntas</span>
        </button>

        {expandedSections.has('proceso') && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
            {/* Pregunta 1 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{procesoReserva.pregunta1}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={procesoReserva.respuesta1}
                onChange={(e) => setProcesoReserva({...procesoReserva, respuesta1: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 2 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{procesoReserva.pregunta2}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={procesoReserva.respuesta2}
                onChange={(e) => setProcesoReserva({...procesoReserva, respuesta2: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>

            {/* Pregunta 3 */}
            <div className="space-y-2">
              <Label className="text-gray-700">{procesoReserva.pregunta3}</Label>
              <Textarea 
                placeholder="Escribe la respuesta aquí..."
                value={procesoReserva.respuesta3}
                onChange={(e) => setProcesoReserva({...procesoReserva, respuesta3: e.target.value})}
                rows={3}
                className="bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* SITUACIONES */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('situaciones')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-red-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('situaciones') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Situaciones en las que el Asistente debe detenerse</span>
          </div>
          <span className="text-sm text-gray-500">{situaciones.length} situaciones configuradas</span>
        </button>

        {expandedSections.has('situaciones') && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Define situaciones específicas en las que el asistente debe transferir la conversación a un humano en lugar de proporcionar cotizaciones.
            </p>

            {situaciones.map((situacion, index) => (
              <div key={situacion.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Situación {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSituacion(situacion.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Título de la situación</Label>
                    <Input
                      placeholder="Ej: Consultas sobre precios fuera del rango estándar"
                      value={situacion.titulo}
                      onChange={(e) => updateSituacion(situacion.id, 'titulo', e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Descripción</Label>
                    <Textarea
                      placeholder="Describe cuándo debe detenerse el asistente..."
                      value={situacion.descripcion}
                      onChange={(e) => updateSituacion(situacion.id, 'descripcion', e.target.value)}
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addSituacion}
              className="w-full border-dashed border-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar nueva situación
            </Button>
          </div>
        )}
      </div>

      {/* CONFIGURACIÓN AVANZADA */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('avanzada')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('avanzada') ? (
              <ChevronDown className="w-5 h-5 text-purple-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-purple-600" />
            )}
            <Settings className="w-5 h-5 text-purple-600" />
            <span className="text-purple-600">Configuración Avanzada de Precio y Disponibilidad</span>
          </div>
        </button>

        {expandedSections.has('avanzada') && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
            {/* Detenerse para cotización */}
            <div className="flex items-start justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex-1">
                <Label className="text-gray-900 mb-1">Detenerse para dar cotización</Label>
                <p className="text-sm text-gray-500">
                  El asistente transferirá al cliente a un humano cuando solicite cotizaciones o precios
                </p>
              </div>
              <Switch
                checked={configAvanzada.detenerseCotizacion}
                onCheckedChange={(checked) => setConfigAvanzada({...configAvanzada, detenerseCotizacion: checked})}
              />
            </div>

            {/* Total mínimo */}
            <div className="space-y-2">
              <Label className="text-gray-700">Total mínimo para solicitar precio (en moneda local)</Label>
              <Input
                type="number"
                placeholder="5000"
                value={configAvanzada.totalMinimo}
                onChange={(e) => setConfigAvanzada({...configAvanzada, totalMinimo: e.target.value})}
                className="bg-white"
              />
              <p className="text-xs text-gray-500">
                Si el total estimado supera este monto, el asistente solicitará confirmación de precios
              </p>
            </div>

            {/* Instrucciones de cálculo */}
            <div className="space-y-2">
              <Label className="text-gray-700">Instrucciones específicas para el cálculo de precios</Label>
              <Textarea
                placeholder="Describe cómo el asistente debe calcular los precios..."
                value={configAvanzada.instruccionesCalculo}
                onChange={(e) => setConfigAvanzada({...configAvanzada, instruccionesCalculo: e.target.value})}
                rows={4}
                className="bg-white"
              />
              <p className="text-xs text-gray-500">
                Ejemplo: Incluir detalles sobre tarifas adicionales, impuestos, descuentos automáticos, etc.
              </p>
            </div>

            {/* Mensaje fijo */}
            <div className="space-y-2">
              <Label className="text-gray-700">Mensaje fijo al realizar cotizaciones</Label>
              <Textarea
                placeholder="Este mensaje se enviará automáticamente con cada cotización..."
                value={configAvanzada.mensajeFijo}
                onChange={(e) => setConfigAvanzada({...configAvanzada, mensajeFijo: e.target.value})}
                rows={3}
                className="bg-white"
              />
              <p className="text-xs text-gray-500">
                Este texto se agregará al final de cada cotización que envíe el asistente
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuración de Página (Disabled) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden opacity-50">
        <button
          disabled
          className="w-full flex items-center justify-between p-5 cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Configuración de Página de Reservas y Medios de Pago</span>
          </div>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6">
        <Button variant="outline">
          Anterior
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
