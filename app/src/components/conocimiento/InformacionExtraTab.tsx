import { useState, useEffect, useRef, useMemo } from 'react';
import { Megaphone, PlayCircle } from 'lucide-react';
import { businessTypeContent, BusinessType } from '../../config/businessConfig/businessTypeContent';
import { SectionWithQuestions } from './shared/SectionWithQuestions';

interface Props {
  businessType: BusinessType;
  onProgressChange?: (progress: number) => void;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

export function InformacionExtraTab({ businessType, onProgressChange, initialData, onDataChange }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const content = businessTypeContent[businessType].informacionExtra;

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

  // Initialize state dynamically from initialData or defaults
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>(() => {
    return buildFormData(initialData, content);
  });

  // Hash para detectar cambios en formData desde initialData
  const formDataHash = useMemo(() => {
    if (!initialData || Object.keys(initialData).length === 0) return '';
    return JSON.stringify(
      Object.keys(initialData)
        .filter(key => key !== 'revisadoData')
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

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    onProgressChangeRef.current(progress);
  }, [revisadoData, content]);

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
    currentData.revisadoData = revisadoData;

    onDataChangeRef.current(currentData);
  }, [formData, revisadoData, content]);

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
              En este apartado podrán proporcionar información complementaria y enriquecedora que ayudará a que el asistente brinde una experiencia más completa. Cuanto más contexto y detalles proporciones, más valioso será el asesoramiento que el asistente podrá ofrecer.
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
            borderColor="border-l-blue-500"
          />
        );
      })}

    </div>
  );
}
