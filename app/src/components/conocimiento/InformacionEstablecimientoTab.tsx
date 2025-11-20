import { useState, useEffect, useRef, useMemo } from 'react';
import { Megaphone, PlayCircle, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { businessTypeContent, BusinessType } from '../../config/businessConfig/businessTypeContent';
import { AccordionSection } from './shared/AccordionSection';
import { SectionWithQuestions } from './shared/SectionWithQuestions';
import { SituacionCard } from './shared/SituacionCard';

interface Situacion {
  id: number;
  titulo: string;
  descripcion: string;
  revisado: boolean;
}

interface Props {
  businessType: BusinessType;
  onProgressChange?: (progress: number) => void;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

export function InformacionEstablecimientoTab({ businessType, onProgressChange, initialData, onDataChange }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const content = businessTypeContent[businessType].informacionEstablecimiento;
  
  // Helper para construir formData desde initialData o defaults
  const buildFormData = (data: any, contentSections: any): Record<string, Record<string, string>> => {
    if (data && Object.keys(data).length > 0) {
      // Si hay initialData, usarlo
      const result: Record<string, Record<string, string>> = {};
      Object.keys(data).forEach(sectionKey => {
        if (data[sectionKey]?.questions && Array.isArray(data[sectionKey].questions)) {
          result[sectionKey] = {};
          data[sectionKey].questions.forEach((q: any, index: number) => {
            result[sectionKey][`respuesta${index + 1}`] = q.respuesta || q.defaultValue || '';
          });
        }
      });
      if (Object.keys(result).length > 0) return result;
    }
    // Si no hay initialData, usar defaults
    const defaultData: Record<string, Record<string, string>> = {};
    Object.keys(contentSections).forEach(sectionKey => {
      defaultData[sectionKey] = {};
      contentSections[sectionKey].questions.forEach((q: any, index: number) => {
        defaultData[sectionKey][`respuesta${index + 1}`] = q.defaultValue || '';
      });
    });
    return defaultData;
  };

  // Initialize state dynamically based on business type or initialData
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>(() => {
    return buildFormData(initialData, content);
  });

  // Hash para detectar cambios en formData desde initialData
  const formDataHash = useMemo(() => {
    if (!initialData || Object.keys(initialData).length === 0) return '';
    return JSON.stringify(
      Object.keys(initialData)
        .filter(key => key !== 'revisadoData' && key !== 'situaciones')
        .map(sectionKey => ({
          key: sectionKey,
          questions: (initialData[sectionKey]?.questions || []).map((q: any, index: number) => ({
            index: index + 1,
            respuesta: q.respuesta || '',
          }))
        }))
        .sort((a: any, b: any) => a.key.localeCompare(b.key))
    );
  }, [initialData]);

  const lastFormDataHashRef = useRef<string | null>(null);

  // Sincronizar formData cuando initialData cambia
  useEffect(() => {
    if (formDataHash === lastFormDataHashRef.current) {
      return;
    }

    const newFormData = buildFormData(initialData, content);
    setFormData(newFormData);
    lastFormDataHashRef.current = formDataHash;
  }, [formDataHash, initialData, content]);

  // Initialize revisado state (all false by default)
  const [revisadoData, setRevisadoData] = useState<Record<string, Record<string, boolean>>>(() => {
    if (initialData?.revisadoData) {
      return initialData.revisadoData;
    }
    const defaultRevisado: Record<string, Record<string, boolean>> = {};
    Object.keys(content).forEach(sectionKey => {
      defaultRevisado[sectionKey] = {};
      content[sectionKey].questions.forEach((q, index) => {
        defaultRevisado[sectionKey][`respuesta${index + 1}`] = false;
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
      Object.keys(content).forEach(sectionKey => {
        defaultRevisado[sectionKey] = {};
        content[sectionKey].questions.forEach((q, index) => {
          defaultRevisado[sectionKey][`respuesta${index + 1}`] = false;
        });
      });
      setRevisadoData(defaultRevisado);
    }
    lastRevisadoDataHashRef.current = revisadoDataHash;
  }, [revisadoDataHash, initialData?.revisadoData, content]);

  const [situaciones, setSituaciones] = useState<Situacion[]>(() => {
    if (initialData?.situaciones && Array.isArray(initialData.situaciones)) {
      return initialData.situaciones.map((sit: any) => ({
        id: sit.id || 0,
        titulo: sit.titulo || '',
        descripcion: sit.descripcion || '',
        revisado: sit.revisado || false
      }));
    }
    return [
    {
      id: 1,
      titulo: 'Consultas que requieren evaluación personalizada',
        descripcion: 'Casos complejos que requieren atención directa del equipo',
        revisado: false // Por defecto desmarcado
    }
    ];
  });

  // Hash para detectar cambios en situaciones desde initialData
  const situacionesHash = useMemo(() => {
    if (!initialData?.situaciones || !Array.isArray(initialData.situaciones) || initialData.situaciones.length === 0) {
      return '';
    }
    return JSON.stringify(
      initialData.situaciones
        .map((sit: any) => ({
          id: sit.id || 0,
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
          id: sit.id || 0,
          titulo: sit.titulo || '',
          descripcion: sit.descripcion || '',
          revisado: sit.revisado || false
        }))
      );
    } else {
      // Si no hay initialData, usar defaults
      setSituaciones([
        {
          id: 1,
          titulo: 'Consultas que requieren evaluación personalizada',
          descripcion: 'Casos complejos que requieren atención directa del equipo',
          revisado: false
        }
      ]);
    }
    lastSituacionesHashRef.current = situacionesHash;
  }, [situacionesHash, initialData?.situaciones]);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleRevisado = (section: string, field: string) => {
    setRevisadoData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section]?.[field]
      }
    }));
  };

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
    Object.keys(content).forEach((sectionKey) => {
      const section = content[sectionKey];
      totalItems += section.questions.length;
      section.questions.forEach((q, index) => {
        const fieldKey = `respuesta${index + 1}`;
        if (revisadoData[sectionKey]?.[fieldKey] === true) {
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

    const currentData: Record<string, any> = {};
    Object.keys(content).forEach(sectionKey => {
      currentData[sectionKey] = {
        title: content[sectionKey].title,
        questions: content[sectionKey].questions.map((q, index) => ({
          pregunta: q.pregunta,
          placeholder: q.placeholder,
          defaultValue: formData[sectionKey]?.[`respuesta${index + 1}`] || q.defaultValue,
          respuesta: formData[sectionKey]?.[`respuesta${index + 1}`] || q.defaultValue,
        })),
      };
    });
    currentData.situaciones = situaciones.map(sit => ({
      id: sit.id,
      titulo: sit.titulo,
      descripcion: sit.descripcion,
      revisado: sit.revisado,
    }));
    currentData.revisadoData = revisadoData;

    onDataChangeRef.current(currentData);
  }, [formData, situaciones, revisadoData, content]);

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
              En este apartado podrán proporcionar información completa y detallada sobre su establecimiento para que el asistente virtual pueda brindar respuestas precisas y personalizadas. Cuanta más información completa y detallada proporciones, más profesional y útil será la experiencia del cliente con su asistente virtual.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Sections */}
      {Object.keys(content).map((sectionKey) => {
        const section = content[sectionKey];
        const sectionData = formData[sectionKey] || {};
        const sectionRevisado = revisadoData[sectionKey] || {};
        
        return (
          <SectionWithQuestions
            key={sectionKey}
            sectionKey={sectionKey}
            title={section.title}
            questions={section.questions}
            formData={sectionData}
            revisadoData={sectionRevisado}
            isExpanded={expandedSections.has(sectionKey)}
            onToggle={() => toggleSection(sectionKey)}
            onUpdate={(fieldKey, value) => updateField(sectionKey, fieldKey, value)}
            onToggleRevisado={(fieldKey) => toggleRevisado(sectionKey, fieldKey)}
            borderColor="border-l-green-500"
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
            Define situaciones específicas en las que el asistente debe transferir la conversación a un humano.
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

    </div>
  );
}