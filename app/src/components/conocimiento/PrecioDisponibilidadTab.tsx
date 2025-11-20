import { useState, useMemo, useEffect, useRef } from 'react';
import { Megaphone, PlayCircle, Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useUserStore } from '../../stores/userStore';
import { businessTypeContent, BusinessType } from '../../config/businessConfig/businessTypeContent';
import { AccordionSection } from './shared/AccordionSection';
import { SectionWithQuestions } from './shared/SectionWithQuestions';
import { SituacionCard } from './shared/SituacionCard';

interface PrecioDisponibilidadTabProps {
  onProgressChange?: (progress: number) => void;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

interface Situacion {
  id: number;
  titulo: string;
  descripcion: string;
  revisado: boolean;
}

export function PrecioDisponibilidadTab({ onProgressChange, initialData, onDataChange }: PrecioDisponibilidadTabProps = {}) {
  const { activeBusiness } = useUserStore();
  
  // Get business type content
  const businessType = useMemo(() => {
    return (activeBusiness?.industry as BusinessType) || 'other';
  }, [activeBusiness]);

  const content = useMemo(() => {
    return businessTypeContent[businessType] || businessTypeContent.other;
  }, [businessType]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pagos']));

  // Helper para construir formData desde initialData o defaults
  const buildFormData = (data: any, contentSections: any[]): Record<string, Record<string, string>> => {
    if (data?.secciones && Array.isArray(data.secciones) && data.secciones.length > 0) {
      // Si hay initialData, usarlo
      const result: Record<string, Record<string, string>> = {};
      data.secciones.forEach((section: any) => {
        result[section.key] = {};
        section.questions?.forEach((q: any, index: number) => {
          result[section.key][`respuesta${index + 1}`] = q.respuesta || q.defaultValue || '';
        });
      });
      return result;
    }
    // Si no hay initialData, usar defaults
    const defaultData: Record<string, Record<string, string>> = {};
    contentSections.forEach((section) => {
      defaultData[section.key] = {};
      section.questions.forEach((q, index) => {
        defaultData[section.key][`respuesta${index + 1}`] = q.defaultValue || '';
      });
    });
    return defaultData;
  };

  // Initialize form data from descriptor or initialData
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>(() => {
    return buildFormData(initialData, content.precioDisponibilidad.secciones);
  });

  // Hash para detectar cambios en formData desde initialData
  const formDataHash = useMemo(() => {
    if (!initialData?.secciones || !Array.isArray(initialData.secciones) || initialData.secciones.length === 0) {
      return '';
    }
    return JSON.stringify(
      initialData.secciones
        .map((section: any) => ({
          key: section.key,
          questions: (section.questions || []).map((q: any, index: number) => ({
            index: index + 1,
            respuesta: q.respuesta || '',
          }))
        }))
        .sort((a: any, b: any) => a.key.localeCompare(b.key))
    );
  }, [initialData?.secciones]);

  const lastFormDataHashRef = useRef<string | null>(null);

  // Sincronizar formData cuando initialData cambia
  useEffect(() => {
    if (formDataHash === lastFormDataHashRef.current) {
      return;
    }

    const newFormData = buildFormData(initialData, content.precioDisponibilidad.secciones);
    setFormData(newFormData);
    lastFormDataHashRef.current = formDataHash;
  }, [formDataHash, initialData, content.precioDisponibilidad.secciones]);

  // Initialize revisado state (all false by default)
  const [revisadoData, setRevisadoData] = useState<Record<string, Record<string, boolean>>>(() => {
    if (initialData?.revisadoData) {
      return initialData.revisadoData;
    }
    const defaultRevisado: Record<string, Record<string, boolean>> = {};
    content.precioDisponibilidad.secciones.forEach((section) => {
      defaultRevisado[section.key] = {};
      section.questions.forEach((q, index) => {
        defaultRevisado[section.key][`respuesta${index + 1}`] = false;
      });
    });
    return defaultRevisado;
  });

  // Hash para detectar cambios en revisadoData desde initialData
  const revisadoDataHash = useMemo(() => {
    if (!initialData?.revisadoData) return '';
    return JSON.stringify(initialData.revisadoData);
  }, [initialData?.revisadoData]);

  const lastRevisadoDataHashRef = useRef<string | null>(null);

  // Sincronizar revisadoData cuando initialData cambia
  useEffect(() => {
    if (revisadoDataHash === lastRevisadoDataHashRef.current) {
      return;
    }

    if (initialData?.revisadoData) {
      setRevisadoData(initialData.revisadoData);
    } else {
      // Si no hay initialData, usar defaults
      const defaultRevisado: Record<string, Record<string, boolean>> = {};
      content.precioDisponibilidad.secciones.forEach((section) => {
        defaultRevisado[section.key] = {};
        section.questions.forEach((q, index) => {
          defaultRevisado[section.key][`respuesta${index + 1}`] = false;
        });
      });
      setRevisadoData(defaultRevisado);
    }
    lastRevisadoDataHashRef.current = revisadoDataHash;
  }, [revisadoDataHash, initialData?.revisadoData, content.precioDisponibilidad.secciones]);

  // Situaciones
  const [situaciones, setSituaciones] = useState<Situacion[]>(() => {
    if (initialData?.situaciones && Array.isArray(initialData.situaciones) && initialData.situaciones.length > 0) {
      return initialData.situaciones.map((sit: any) => ({
        id: sit.id || sit.numero || 0,
        titulo: sit.titulo || '',
        descripcion: sit.descripcion || '',
        revisado: sit.revisado || false
      }));
    }
    return content.precioDisponibilidad.situaciones.map((sit, index) => ({
      id: index + 1,
      titulo: sit.titulo,
      descripcion: sit.descripcion,
      revisado: false // Por defecto desmarcado
    }));
  });

  // Hash para detectar cambios en situaciones desde initialData
  const situacionesHash = useMemo(() => {
    if (!initialData?.situaciones || !Array.isArray(initialData.situaciones) || initialData.situaciones.length === 0) {
      return '';
    }
    return JSON.stringify(
      initialData.situaciones
        .map((sit: any) => ({
          id: sit.id || sit.numero || 0,
          titulo: sit.titulo || '',
          descripcion: sit.descripcion || '',
          revisado: sit.revisado || false
        }))
        .sort((a: any, b: any) => a.id - b.id)
    );
  }, [initialData?.situaciones]);

  const lastSituacionesHashRef = useRef<string | null>(null);

  // Sincronizar situaciones cuando initialData cambia
  useEffect(() => {
    if (situacionesHash === lastSituacionesHashRef.current) {
      return;
    }

    if (initialData?.situaciones && Array.isArray(initialData.situaciones) && initialData.situaciones.length > 0) {
      setSituaciones(
        initialData.situaciones.map((sit: any) => ({
          id: sit.id || sit.numero || 0,
          titulo: sit.titulo || '',
          descripcion: sit.descripcion || '',
          revisado: sit.revisado || false
        }))
      );
    } else {
      // Si no hay initialData, usar defaults
      setSituaciones(
        content.precioDisponibilidad.situaciones.map((sit, index) => ({
          id: index + 1,
          titulo: sit.titulo,
          descripcion: sit.descripcion,
          revisado: false
        }))
      );
    }
    lastSituacionesHashRef.current = situacionesHash;
  }, [situacionesHash, initialData?.situaciones, content.precioDisponibilidad.situaciones]);

  // Configuración Avanzada
  const [configAvanzada, setConfigAvanzada] = useState(() => {
    return initialData?.configAvanzada || content.precioDisponibilidad.configAvanzada;
  });

  // Hash para detectar cambios en configAvanzada desde initialData
  const configAvanzadaHash = useMemo(() => {
    if (!initialData?.configAvanzada) return '';
    return JSON.stringify(initialData.configAvanzada);
  }, [initialData?.configAvanzada]);

  const lastConfigAvanzadaHashRef = useRef<string | null>(null);

  // Sincronizar configAvanzada cuando initialData cambia
  useEffect(() => {
    if (configAvanzadaHash === lastConfigAvanzadaHashRef.current) {
      return;
    }

    if (initialData?.configAvanzada) {
      setConfigAvanzada(initialData.configAvanzada);
    } else {
      setConfigAvanzada(content.precioDisponibilidad.configAvanzada);
    }
    lastConfigAvanzadaHashRef.current = configAvanzadaHash;
  }, [configAvanzadaHash, initialData?.configAvanzada, content.precioDisponibilidad.configAvanzada]);

  // Nota: No necesitamos un useEffect separado para resetear cuando cambia el business type
  // porque los efectos de sincronización ya manejan esto correctamente:
  // - Si hay initialData, se usa (datos guardados tienen prioridad)
  // - Si no hay initialData, se usan los defaults del content
  // - Cuando cambia el business type, el content cambia y los efectos de sincronización
  //   detectan los nuevos campos y los agregan, manteniendo los valores guardados si existen

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const sections = useMemo(() => {
    return content.precioDisponibilidad.secciones.map((section) => {
      const completed = section.questions.filter((q, index) => {
        const respuesta = formData[section.key]?.[`respuesta${index + 1}`];
        return respuesta && respuesta.trim() !== '';
      }).length;
      return {
        id: section.key,
        title: section.title,
        completed,
        total: section.questions.length,
        borderColor: section.borderColor
      };
    }).concat([
      { 
        id: 'situaciones', 
        title: 'Situaciones en las que el Asistente debe detenerse', 
        completed: situaciones.length, 
        total: 0, 
        borderColor: 'border-l-red-500' 
      }
    ]);
  }, [content, formData, situaciones]);

  const addSituacion = () => {
    const newId = Math.max(...situaciones.map(s => s.id), 0) + 1;
    setSituaciones([...situaciones, {
      id: newId,
      titulo: '',
      descripcion: '',
      revisado: false
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

  const toggleSituacionRevisado = (id: number) => {
    setSituaciones(situaciones.map(s => 
      s.id === id ? { ...s, revisado: !s.revisado } : s
    ));
  };

  const updateField = (sectionKey: string, fieldKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: value
      }
    }));
  };

  const toggleRevisado = (sectionKey: string, fieldKey: string) => {
    setRevisadoData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: !prev[sectionKey]?.[fieldKey]
      }
    }));
  };

  // Usar ref para almacenar el callback y evitar loops infinitos
  const onProgressChangeRef = useRef(onProgressChange);
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  // Calcular progreso
  useEffect(() => {
    if (!onProgressChangeRef.current) return;

    let totalItems = 0;
    let completedItems = 0;

    // Contar preguntas revisadas en secciones
    content.precioDisponibilidad.secciones.forEach((section) => {
      totalItems += section.questions.length;
      section.questions.forEach((q, index) => {
        const fieldKey = `respuesta${index + 1}`;
        if (revisadoData[section.key]?.[fieldKey] === true) {
          completedItems++;
        }
      });
    });

    // Contar situaciones completadas (con título, descripción Y marcadas como revisado)
    const situacionesCompletadas = situaciones.filter(sit => 
      sit.titulo.trim() !== '' && sit.descripcion.trim() !== '' && sit.revisado
    ).length;
    totalItems += situaciones.length;
    completedItems += situacionesCompletadas;

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    onProgressChangeRef.current(progress);
  }, [revisadoData, situaciones, content]);

  // Reportar cambios al padre
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  useEffect(() => {
    if (!onDataChangeRef.current) return;

    const currentData = {
      secciones: content.precioDisponibilidad.secciones.map((section) => ({
        key: section.key,
        title: section.title,
        borderColor: section.borderColor,
        questions: section.questions.map((q, index) => ({
          pregunta: q.pregunta,
          placeholder: q.placeholder,
          defaultValue: formData[section.key]?.[`respuesta${index + 1}`] || q.defaultValue,
          respuesta: formData[section.key]?.[`respuesta${index + 1}`] || q.defaultValue,
        })),
      })),
      situaciones: situaciones.map(sit => ({
        id: sit.id,
        titulo: sit.titulo,
        descripcion: sit.descripcion,
        revisado: sit.revisado,
      })),
      configAvanzada: configAvanzada,
      revisadoData: revisadoData,
    };

    onDataChangeRef.current(currentData);
  }, [formData, situaciones, configAvanzada, revisadoData, content]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      {/* Importante Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6">
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

      {/* Dynamic Sections */}
      {content.precioDisponibilidad.secciones.map((section) => {
        const sectionData = formData[section.key] || {};
        const sectionRevisado = revisadoData[section.key] || {};
        return (
          <SectionWithQuestions
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            questions={section.questions}
            formData={sectionData}
            revisadoData={sectionRevisado}
            isExpanded={expandedSections.has(section.key)}
            onToggle={() => toggleSection(section.key)}
            onUpdate={(fieldKey, value) => updateField(section.key, fieldKey, value)}
            onToggleRevisado={(fieldKey) => toggleRevisado(section.key, fieldKey)}
            borderColor={section.borderColor}
          />
        );
      })}

      {/* SITUACIONES */}
      <AccordionSection
        id="situaciones"
        title="Situaciones en las que el Asistente debe detenerse"
        isExpanded={expandedSections.has('situaciones')}
        onToggle={() => toggleSection('situaciones')}
        borderColor="border-l-red-500"
        customCount={`${situaciones.length} situaciones configuradas`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Define situaciones específicas en las que el asistente debe transferir la conversación a un humano en lugar de proporcionar cotizaciones.
          </p>

          {situaciones.map((situacion, index) => (
            <SituacionCard
              key={situacion.id}
              id={situacion.id}
              index={index}
              titulo={situacion.titulo}
              descripcion={situacion.descripcion}
              revisado={situacion.revisado}
              onUpdate={updateSituacion}
              onToggleRevisado={toggleSituacionRevisado}
              onRemove={removeSituacion}
            />
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
      </AccordionSection>

      {/* CONFIGURACIÓN AVANZADA */}
      <AccordionSection
        id="avanzada"
        title="Configuración Avanzada de Precio y Disponibilidad"
        isExpanded={expandedSections.has('avanzada')}
        onToggle={() => toggleSection('avanzada')}
        borderColor="border-l-purple-500"
      >
        <div className="space-y-6">
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
      </AccordionSection>

      {/* Configuración de Página (Disabled) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden opacity-50">
        <button
          disabled
          className="w-full flex items-center justify-between p-5 cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Configuración de Página de Reservas y Medios de Pago</span>
          </div>
        </button>
      </div>

    </div>
  );
}
