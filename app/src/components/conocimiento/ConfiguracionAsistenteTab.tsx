import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Badge } from '../ui/badge';
import { useUserStore } from '../../stores/userStore';
import { businessAppointmentType, appointmentTypeLabels, businessTypeContent, BusinessType, ConfigField as ConfigFieldType } from '../../config/businessConfig/businessTypeContent';
import { SituacionCard } from './shared/SituacionCard';
import { ConfigFieldInput } from './shared/ConfigFieldInput';
import { AccordionSection } from './shared/AccordionSection';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

// Custom hook para sincronizar estado local con prop (source of truth)
function useSyncedFields(initialData: any, content: any, activeBusiness: any): [Record<string, ConfigField>, (fields: Record<string, ConfigField>) => void] {
  // Función helper para construir fields desde initialData o defaults
  const buildFieldsFromData = (data: any, contentFields: any[]): Record<string, ConfigField> => {
    const newFields: Record<string, ConfigField> = {};
    
    // Determinar si hay datos guardados (si hay fields en initialData, significa que hay datos guardados)
    const hasSavedData = data?.fields && Array.isArray(data.fields) && data.fields.length > 0;
    
    // Crear un mapa de campos guardados para verificar rápidamente si un campo está guardado
    const savedFieldsMap = new Map<string, any>();
    if (hasSavedData) {
      data.fields.forEach((field: any) => {
        savedFieldsMap.set(field.key, field);
      });
    }
    
    // Mapeo de campos del business a campos de configuracionAsistente
    const businessFieldMap: Record<string, string> = {
      'web': 'website',
      'ubicacion': 'address',
      'establecimiento': 'name',
    };
    
    // Función helper para obtener valor del business si el campo está vacío
    const getBusinessValue = (fieldKey: string): string => {
      const businessKey = businessFieldMap[fieldKey];
      if (!businessKey || !activeBusiness) return '';
      
      const businessValue = (activeBusiness as any)[businessKey];
      return businessValue && typeof businessValue === 'string' ? businessValue : '';
    };
    
    // Inicializar con defaults del businessTypeContent
    contentFields.forEach((field: any) => {
      const savedField = savedFieldsMap.get(field.key);
      
      if (savedField) {
        // Campo existe en initialData, usar sus valores
        // Si el valor guardado está vacío o es undefined, priorizar el valor del business sobre el defaultValue
        const savedValue = savedField.value;
        let finalValue: string;
        
        if (savedValue && savedValue.trim() !== '') {
          // Hay un valor guardado explícitamente, usarlo
          finalValue = savedValue;
        } else {
          // No hay valor guardado, priorizar el valor del business sobre el defaultValue
          const businessValue = getBusinessValue(field.key);
          finalValue = businessValue || field.defaultValue || '';
        }
        
        newFields[field.key] = {
          label: field.label,
          value: finalValue,
          // locked solo puede ser true si está explícitamente guardado como true
          locked: savedField.locked === true,
          multiline: savedField.multiline !== undefined ? savedField.multiline : field.multiline,
          rows: savedField.rows !== undefined ? savedField.rows : field.rows
        };
      } else {
        // Campo NO existe en initialData, usar defaults pero SIEMPRE locked: false
        // Priorizar el valor del business sobre el defaultValue
        const businessValue = getBusinessValue(field.key);
        const finalValue = businessValue || field.defaultValue || '';
        
        newFields[field.key] = {
          label: field.label,
          value: finalValue,
          // SIEMPRE locked: false para campos nuevos/no guardados
          locked: false,
          multiline: field.multiline,
          rows: field.rows
        };
      }
    });
    
    return newFields;
  };

  // Crear un hash estable basado en valores (no referencias) para detectar cambios reales
  const fieldsHash = useMemo(() => {
    if (!initialData?.fields || !Array.isArray(initialData.fields) || initialData.fields.length === 0) {
      return '';
    }
    // Usar JSON.stringify para comparar valores, no referencias
    return JSON.stringify(
      initialData.fields
        .map((f: any) => ({
          key: f.key,
          value: f.value || '',
          locked: f.locked || false,
          multiline: f.multiline,
          rows: f.rows
        }))
        .sort((a: any, b: any) => a.key.localeCompare(b.key))
    );
  }, [initialData?.fields]);

  // Hash para detectar cambios en content (para nuevos campos)
  const contentHash = useMemo(() => {
    return JSON.stringify(
      content.configuracionAsistente.fields.map((f: any) => f.key).sort()
    );
  }, [content.configuracionAsistente.fields]);

  // Inicializar estado local desde initialData
  const [fields, setFields] = useState<Record<string, ConfigField>>(() => {
    return buildFieldsFromData(initialData, content.configuracionAsistente.fields);
  });

  // Refs para rastrear los últimos hashes procesados
  const lastFieldsHashRef = useRef<string | null>(null);
  const lastContentHashRef = useRef<string | null>(null);
  const lastBusinessHashRef = useRef<string | null>(null);

  // Hash para detectar cambios en activeBusiness
  const businessHash = useMemo(() => {
    if (!activeBusiness) return '';
    return JSON.stringify({
      website: (activeBusiness as any).website || '',
      address: (activeBusiness as any).address || '',
      name: activeBusiness.name || '',
      description: (activeBusiness as any).description || '',
    });
  }, [activeBusiness]);

  // Sincronizar cuando initialData cambia (datos guardados)
  useEffect(() => {
    // Solo actualizar si el hash cambió realmente
    if (fieldsHash === lastFieldsHashRef.current) {
      return;
    }

    const newFields = buildFieldsFromData(initialData, content.configuracionAsistente.fields);
    setFields(newFields);
    lastFieldsHashRef.current = fieldsHash;
  }, [fieldsHash, initialData, content.configuracionAsistente.fields, activeBusiness]);

  // Sincronizar cuando content cambia (nuevos campos del business type)
  useEffect(() => {
    // Solo actualizar si el content cambió realmente (nuevos campos)
    if (contentHash === lastContentHashRef.current) {
      return;
    }

    // Si hay initialData, mantener los valores guardados y solo agregar nuevos campos
    const newFields = buildFieldsFromData(initialData, content.configuracionAsistente.fields);
    setFields(newFields);
    lastContentHashRef.current = contentHash;
  }, [contentHash, initialData, content.configuracionAsistente.fields, activeBusiness]);

  // Sincronizar cuando activeBusiness cambia (para poblar campos con datos del business)
  useEffect(() => {
    if (businessHash === lastBusinessHashRef.current) {
      return;
    }

    // Actualizar campos con datos del business si están vacíos o tienen defaultValue
    setFields(prevFields => {
      const updatedFields = { ...prevFields };
      let hasChanges = false;

      Object.keys(updatedFields).forEach(key => {
        const field = updatedFields[key];
        // Solo actualizar si el campo no está bloqueado
        if (!field.locked) {
          const businessKey = key === 'web' ? 'website' : key === 'ubicacion' ? 'address' : key === 'establecimiento' ? 'name' : null;
          if (businessKey && activeBusiness) {
            const businessValue = (activeBusiness as any)[businessKey];
            if (businessValue && typeof businessValue === 'string' && businessValue.trim() !== '') {
              const currentValue = field.value || '';
              
              // Obtener el defaultValue del content
              const contentField = content.configuracionAsistente.fields.find((f: any) => f.key === key);
              const defaultValue = contentField?.defaultValue || '';
              
              // Actualizar si:
              // 1. El campo está vacío, O
              // 2. El valor actual es igual al defaultValue (significa que no se ha guardado un valor personalizado)
              if (!currentValue.trim() || currentValue === defaultValue) {
                if (currentValue !== businessValue) {
                  updatedFields[key] = { ...field, value: businessValue };
                  hasChanges = true;
                }
              }
            }
          }
        }
      });

      return hasChanges ? updatedFields : prevFields;
    });

    lastBusinessHashRef.current = businessHash;
  }, [businessHash, activeBusiness, content.configuracionAsistente.fields]);

  return [fields, setFields];
}

interface ConfiguracionAsistenteTabProps {
  onProgressChange?: (progress: number) => void;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

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
  revisado: boolean;
}

// Voces disponibles en Vapi
const VAPI_VOICES_ES = {
  MALENA_TANGO: {
    id: '1WXz8v08ntDcSTeVXMN2',
    name: 'Malena Tango',
    provider: '11labs',
    description: 'Mujer, español argentino'
  },
  FRANCO: {
    id: 'PBi4M0xL4G7oVYxKgqww',
    name: 'Franco',
    provider: '11labs',
    description: 'Hombre, español'
  },
  MELANIE: {
    id: 'bN1bDXgDIGX5lw0rtY2B',
    name: 'Melanie',
    provider: '11labs',
    description: 'Mujer, español'
  },
};

const VAPI_VOICES_EN = {
  CHRISTINA: {
    id: '2qfp6zPuviqeCOZIE9RZ',
    name: 'Christina',
    provider: '11labs',
    description: 'Woman, English'
  },
  CHRISTOPHER: {
    id: 'DHeSUVQvhhYeIxNUbtj3',
    name: 'Christopher',
    provider: '11labs',
    description: 'Man, English'
  },
  AARON: {
    id: 'D9Thk1W7FRMgiOhy3zVI',
    name: 'Aaron',
    provider: '11labs',
    description: 'Man, English'
  },
};

export function ConfiguracionAsistenteTab({ onProgressChange, initialData, onDataChange }: ConfiguracionAsistenteTabProps = {}) {
  const { activeBusiness } = useUserStore();
  
  // Estado para idioma y voz
  const [language, setLanguage] = useState<'es' | 'en'>(() => {
    return initialData?.language || 'es';
  });
  
  const [voiceId, setVoiceId] = useState<string>(() => {
    if (initialData?.voiceId) {
      return initialData.voiceId;
    }
    // Usar la primera voz disponible según el idioma
    const availableVoices = language === 'es' ? Object.values(VAPI_VOICES_ES) : Object.values(VAPI_VOICES_EN);
    return availableVoices[0]?.id || '';
  });
  
  // Estado para "revisado" de idioma y voz
  const [languageReviewed, setLanguageReviewed] = useState<boolean>(() => {
    return initialData?.languageReviewed || false;
  });
  
  const [voiceReviewed, setVoiceReviewed] = useState<boolean>(() => {
    return initialData?.voiceReviewed || false;
  });
  
  // Función para generar el mensaje inicial por defecto
  const generateDefaultFirstMessage = useCallback((assistantName: string, businessName: string, lang: 'es' | 'en'): string => {
    if (lang === 'es') {
      return `¡Hola! Bienvenido. Soy ${assistantName}, recepcionista de ${businessName}. ¿Necesitas una cita?`;
    }
    return `Hello! Welcome. I'm ${assistantName}, receptionist at ${businessName}. Do you need an appointment?`;
  }, []);

  // Estado para firstMessage - inicializar con valor simple, luego actualizar cuando fields esté disponible
  const [firstMessage, setFirstMessage] = useState<string>(() => {
    if (initialData?.firstMessage) {
      return initialData.firstMessage;
    }
    // Valor temporal, se actualizará cuando fields esté disponible
    return language === 'es' 
      ? '¡Hola! Bienvenido. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
      : 'Hello! Welcome. I\'m your virtual assistant. How can I help you today?';
  });
  
  const [firstMessageReviewed, setFirstMessageReviewed] = useState<boolean>(() => {
    return initialData?.firstMessageReviewed || false;
  });
  
  // Sincronizar cuando initialData cambia
  useEffect(() => {
    if (initialData?.language) {
      setLanguage(initialData.language);
    }
    if (initialData?.voiceId) {
      setVoiceId(initialData.voiceId);
    }
    if (initialData?.languageReviewed !== undefined) {
      setLanguageReviewed(initialData.languageReviewed);
    }
    if (initialData?.voiceReviewed !== undefined) {
      setVoiceReviewed(initialData.voiceReviewed);
    }
    if (initialData?.firstMessage) {
      setFirstMessage(initialData.firstMessage);
    }
    if (initialData?.firstMessageReviewed !== undefined) {
      setFirstMessageReviewed(initialData.firstMessageReviewed);
    }
  }, [initialData?.language, initialData?.voiceId, initialData?.languageReviewed, initialData?.voiceReviewed, initialData?.firstMessage, initialData?.firstMessageReviewed]);
  
  
  // Obtener voces disponibles según el idioma seleccionado
  const availableVoices = useMemo(() => {
    return language === 'es' ? Object.values(VAPI_VOICES_ES) : Object.values(VAPI_VOICES_EN);
  }, [language]);
  
  // Resetear voz cuando cambia el idioma si la voz actual no está disponible en el nuevo idioma
  useEffect(() => {
    const currentVoice = availableVoices.find(v => v.id === voiceId);
    if (!currentVoice) {
      // Si la voz actual no está disponible, usar la primera disponible
      setVoiceId(availableVoices[0]?.id || '');
    }
  }, [language, availableVoices, voiceId]);
  
  // Determine appointment type and labels
  const appointmentType = useMemo(() => {
    const industry = activeBusiness?.industry;
    if (!industry) return 'appointment' as const;
    return businessAppointmentType[industry as keyof typeof businessAppointmentType] || ('appointment' as const);
  }, [activeBusiness]);

  const labels = useMemo(() => {
    return appointmentTypeLabels[appointmentType as keyof typeof appointmentTypeLabels];
  }, [appointmentType]);

  // Get business type content
  const businessType = useMemo(() => {
    return (activeBusiness?.industry as BusinessType) || 'other';
  }, [activeBusiness]);

  const content = useMemo(() => {
    return businessTypeContent[businessType] || businessTypeContent.other;
  }, [businessType]);

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

  // Usar custom hook para sincronizar fields con initialData (source of truth)
  // Esto asegura que siempre se sincronice cuando initialData cambia, incluso después de desmontar/montar
  const [fields, setFields] = useSyncedFields(initialData, content, activeBusiness);
  
  // Actualizar firstMessage con valores dinámicos cuando fields esté disponible (si no hay valor guardado)
  useEffect(() => {
    if (!initialData?.firstMessage && fields.nombre) {
      const assistantName = fields.nombre.value || 'tu asistente';
      const businessName = activeBusiness?.name || 'el negocio';
      const defaultMessage = generateDefaultFirstMessage(assistantName, businessName, language);
      setFirstMessage(defaultMessage);
    }
  }, [fields.nombre?.value, activeBusiness?.name, language, initialData?.firstMessage, generateDefaultFirstMessage]);

  // Memoizar defaultValue para evitar cambios en cada render
  const directricesDefaultValue = useMemo(() => {
    return content.configuracionAsistente.directrices.defaultValue;
  }, [content.configuracionAsistente.directrices.defaultValue]);

  // Hash para detectar cambios en directrices (incluye el caso cuando no existe)
  const directricesHash = useMemo(() => {
    if (!initialData?.directrices) {
      // Si no hay directrices, usar hash vacío pero estable
      return 'empty';
    }
    return JSON.stringify({
      value: initialData.directrices.value || '',
      locked: initialData.directrices.locked ?? false
    });
  }, [initialData?.directrices?.value, initialData?.directrices?.locked]);

  const lastDirectricesHashRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  // Sincronizar directrices con initialData
  const [directrices, setDirectrices] = useState(() => {
    // Inicializar con valores correctos desde el inicio
    const defaultValue = content.configuracionAsistente.directrices.defaultValue;
    if (initialData?.directrices) {
      return {
        value: initialData.directrices.value || defaultValue,
        locked: initialData.directrices.locked ?? false
      };
    }
    return {
      value: defaultValue,
      locked: false
    };
  });

  // Sincronizar directrices cuando initialData cambia (solo si el hash cambió)
  useEffect(() => {
    // En el primer mount, no hacer nada (ya se inicializó correctamente)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      lastDirectricesHashRef.current = directricesHash;
      return;
    }

    // Evitar actualización si el hash no cambió
    if (directricesHash === lastDirectricesHashRef.current) {
      return;
    }

    if (initialData?.directrices) {
      const newValue = initialData.directrices.value || directricesDefaultValue;
      const newLocked = initialData.directrices.locked ?? false;
      
      // Solo actualizar si realmente cambió
      setDirectrices(prev => {
        if (prev.value === newValue && prev.locked === newLocked) {
          return prev;
        }
        return {
          value: newValue,
          locked: newLocked
        };
      });
    } else {
      // Si no hay initialData, usar defaults
      setDirectrices(prev => {
        if (prev.value === directricesDefaultValue && prev.locked === false) {
          return prev;
        }
        return {
          value: directricesDefaultValue,
          locked: false
        };
      });
    }
    
    lastDirectricesHashRef.current = directricesHash;
  }, [directricesHash, directricesDefaultValue]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['directrices']));
  
  // Sincronizar situaciones con initialData
  const [situaciones, setSituaciones] = useState<Situacion[]>(() => {
    if (initialData?.situaciones && Array.isArray(initialData.situaciones) && initialData.situaciones.length > 0) {
      return initialData.situaciones.map((sit: any) => ({
        id: sit.id || sit.numero,
        numero: sit.numero,
        titulo: sit.titulo || '',
        descripcion: sit.descripcion || '',
        revisado: sit.revisado || false
      }));
    }
    return content.configuracionAsistente.situaciones.map((sit, index) => ({
      id: index + 1,
      numero: index + 1,
      titulo: sit.titulo,
      descripcion: sit.descripcion,
      revisado: false
    }));
  });

  // Hash para detectar cambios en situaciones
  const situacionesHash = useMemo(() => {
    if (!initialData?.situaciones || !Array.isArray(initialData.situaciones) || initialData.situaciones.length === 0) {
      return '';
    }
    return JSON.stringify(
      initialData.situaciones
        .map((sit: any) => ({
          id: sit.id || sit.numero,
          numero: sit.numero,
          titulo: sit.titulo || '',
          descripcion: sit.descripcion || '',
          revisado: sit.revisado || false
        }))
        .sort((a: any, b: any) => a.numero - b.numero)
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
          id: sit.id || sit.numero,
          numero: sit.numero,
          titulo: sit.titulo || '',
          descripcion: sit.descripcion || '',
          revisado: sit.revisado || false
        }))
      );
    } else {
      // Si no hay initialData, usar defaults
    setSituaciones(
      content.configuracionAsistente.situaciones.map((sit, index) => ({
        id: index + 1,
        numero: index + 1,
        titulo: sit.titulo,
        descripcion: sit.descripcion,
          revisado: false
      }))
    );
    }
    lastSituacionesHashRef.current = situacionesHash;
  }, [situacionesHash, initialData?.situaciones, content.configuracionAsistente.situaciones]);

  // Nota: No necesitamos un useEffect separado para resetear cuando cambia el business type
  // porque los efectos de sincronización (useSyncedFields y los useEffect para directrices/situaciones)
  // ya manejan esto correctamente:
  // - Si hay initialData, se usa (datos guardados tienen prioridad)
  // - Si no hay initialData, se usan los defaults del content
  // - Cuando cambia el business type, el content cambia y los efectos de sincronización
  //   detectan los nuevos campos y los agregan, manteniendo los valores guardados si existen

  const toggleLock = (fieldName: string) => {
    setFields({
      ...fields,
      [fieldName]: {
        ...fields[fieldName],
        locked: !fields[fieldName].locked
      }
    });
  };

  // Verificar si todo está marcado como revisado
  const isAllReviewed = useMemo(() => {
    // Verificar fields
    const allFieldsReviewed = Object.keys(fields).every(key => fields[key].locked === true);
    
    // Verificar directrices
    const directricesReviewed = directrices.locked === true;
    
    // Verificar situaciones (excluyendo la número 8)
    const situacionesRelevantes = situaciones.filter(sit => sit.numero !== 8);
    const allSituacionesReviewed = situacionesRelevantes.length > 0 && 
      situacionesRelevantes.every(sit => sit.revisado === true);
    
    // Verificar idioma, voz y firstMessage
    const languageAndVoiceReviewed = languageReviewed && voiceReviewed && firstMessageReviewed;
    
    return allFieldsReviewed && directricesReviewed && allSituacionesReviewed && languageAndVoiceReviewed;
  }, [fields, directrices, situaciones, languageReviewed, voiceReviewed]);

  // Función para marcar/desmarcar todo como revisado
  const toggleAllAsReviewed = () => {
    const shouldMark = !isAllReviewed;
    
    // Marcar/desmarcar todos los fields
    const updatedFields: Record<string, ConfigField> = {};
    Object.keys(fields).forEach(key => {
      updatedFields[key] = {
        ...fields[key],
        locked: shouldMark
      };
    });
    setFields(updatedFields);

    // Marcar/desmarcar directrices
    setDirectrices(prev => ({
      ...prev,
      locked: shouldMark
    }));

    // Marcar/desmarcar todas las situaciones (excluyendo la número 8)
    setSituaciones(prev => prev.map(sit => ({
      ...sit,
      revisado: sit.numero === 8 ? sit.revisado : shouldMark
    })));
    
    // Marcar/desmarcar idioma, voz y firstMessage
    setLanguageReviewed(shouldMark);
    setVoiceReviewed(shouldMark);
    setFirstMessageReviewed(shouldMark);
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

  const updateSituacion = (id: number, field: 'titulo' | 'descripcion', value: string) => {
    setSituaciones(situaciones.map(sit => 
      sit.id === id ? { ...sit, [field]: value } : sit
    ));
  };

  const toggleSituacionRevisado = (id: number) => {
    setSituaciones(situaciones.map(sit => 
      sit.id === id ? { ...sit, revisado: !sit.revisado } : sit
    ));
  };

  const removeSituacion = (id: number) => {
    setSituaciones(situaciones.filter(sit => sit.id !== id));
  };

  const addSituacion = () => {
    const newId = Math.max(...situaciones.map(s => s.id), 0) + 1;
    setSituaciones([...situaciones, {
      id: newId,
      numero: newId,
      titulo: '',
      descripcion: '',
      revisado: false
    }]);
  };

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  // Usar ref para almacenar el callback y evitar loops infinitos
  const onProgressChangeRef = useRef(onProgressChange);
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  // Calcular progreso
  useEffect(() => {
    if (!onProgressChangeRef.current) return;

    // Excluir la situación número 8 del total (es especial y no se cuenta)
    const situacionesRelevantes = situaciones.filter(sit => sit.numero !== 8);
    const totalItems = content.configuracionAsistente.fields.length + 1 + situacionesRelevantes.length + 3; // fields + directrices + situaciones (sin la 8) + idioma + voz + firstMessage
    let completedItems = 0;

    // Contar campos completados y con check "Revisado"
    // Nota: Los campos "web" y "ubicacion" pueden estar vacíos pero marcados como revisado
    content.configuracionAsistente.fields.forEach((field) => {
      const fieldData = fields[field.key];
      // Para campos opcionales (web, ubicacion), solo verificamos si está marcado como revisado
      if (field.key === 'web' || field.key === 'ubicacion') {
        if (fieldData && fieldData.locked) {
          completedItems++;
        }
      } else {
        // Para otros campos, deben tener valor Y estar marcados como revisado
        if (fieldData && fieldData.value.trim() !== '' && fieldData.locked) {
          completedItems++;
        }
      }
    });

    // Contar directrices con check
    if (directrices.locked) {
      completedItems++;
    }

    // Contar situaciones completadas (con título, descripción Y marcadas como revisado, excluyendo la 8)
    const situacionesCompletadas = situacionesRelevantes.filter(sit => 
      sit.titulo.trim() !== '' && sit.descripcion.trim() !== '' && sit.revisado
    ).length;
    completedItems += situacionesCompletadas;
    
    // Contar idioma, voz y firstMessage revisados
    if (languageReviewed) {
      completedItems++;
    }
    if (voiceReviewed) {
      completedItems++;
    }
    // Para firstMessage, solo verificamos si está marcado como revisado (debe tener texto)
    if (firstMessageReviewed && firstMessage.trim() !== '') {
      completedItems++;
    }

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // Debug: Log para verificar el cálculo
    console.log('📊 [Progreso]', {
      totalItems,
      completedItems,
      progress,
      fieldsCompleted: content.configuracionAsistente.fields.filter(f => {
        const fd = fields[f.key];
        if (f.key === 'web') return fd && fd.locked;
        return fd && fd.value.trim() !== '' && fd.locked;
      }).length,
      totalFields: content.configuracionAsistente.fields.length,
      directricesLocked: directrices.locked,
      situacionesCompletadas,
      totalSituaciones: situacionesRelevantes.length,
      languageReviewed,
      voiceReviewed,
      firstMessageReviewed: firstMessageReviewed && firstMessage.trim() !== '',
    });
    
    onProgressChangeRef.current(progress);
  }, [fields, directrices, situaciones, content, languageReviewed, voiceReviewed, firstMessageReviewed, firstMessage]);

  // Reportar cambios al padre
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  useEffect(() => {
    if (!onDataChangeRef.current) return;

    const currentData = {
      fields: Object.keys(fields).map(key => ({
        key,
        value: fields[key].value,
        locked: fields[key].locked,
        multiline: fields[key].multiline,
        rows: fields[key].rows,
        label: fields[key].label,
      })),
      directrices: {
        value: directrices.value,
        locked: directrices.locked,
      },
      situaciones: situaciones.map(sit => ({
        id: sit.id,
        numero: sit.numero,
        titulo: sit.titulo,
        descripcion: sit.descripcion,
        revisado: sit.revisado,
      })),
      prompt: generatePrompt(), // Incluir el prompt generado
      language: language, // Incluir idioma seleccionado
      voiceId: voiceId, // Incluir voz seleccionada
      languageReviewed: languageReviewed, // Incluir estado de revisado del idioma
      voiceReviewed: voiceReviewed, // Incluir estado de revisado de la voz
      firstMessage: firstMessage, // Incluir mensaje inicial
      firstMessageReviewed: firstMessageReviewed, // Incluir estado de revisado del mensaje inicial
    };

    onDataChangeRef.current(currentData);
  }, [fields, directrices, situaciones, appointmentType, language, voiceId, languageReviewed, voiceReviewed, firstMessage, firstMessageReviewed]);

  const generatePrompt = () => {
    // Helper para obtener valor de campo de forma segura
    const getFieldValue = (key: string, defaultValue: string = '') => {
      return fields[key]?.value || defaultValue;
    };

    const nombre = getFieldValue('nombre', 'Asistente');
    const establecimiento = getFieldValue('establecimiento', 'el establecimiento');
    const ubicacion = getFieldValue('ubicacion', '');
    const tono = getFieldValue('tono', 'Formal');
    const tipoEstablecimiento = getFieldValue('tipoEstablecimiento', '');
    const infoHotel = getFieldValue('infoHotel', '');
    const propuesta = getFieldValue('propuesta', '');
    const web = getFieldValue('web', '');
    
    // Obtener descripción del business si está disponible
    const businessDescription = (activeBusiness as any)?.description || '';

    // Generar prompt dinámico según el tipo de negocio
    const roleText = appointmentType === 'booking' 
      ? `Eres "${nombre}", asistente de reservas de "${establecimiento}". Tus acciones consultan servicios diseñados específicamente para "${establecimiento}"${ubicacion ? `, un establecimiento en ${ubicacion}` : ''}. Ayuda a los visitantes a reservar sus vacaciones. Debes confirmar con quién estás hablando (nombre completo), la fecha de ingreso y la fecha de egreso, además del tipo de habitación y método de pago.`
      : `Eres "${nombre}", asistente virtual de "${establecimiento}"${ubicacion ? ` ubicado en ${ubicacion}` : ''}. Tu trabajo es ayudar a los clientes con información sobre servicios, responder preguntas y agendar citas de manera profesional y amable.`;

    let prompt = `<rules>
<role>${roleText}</role>

${tono ? `Hablas en tono  ${tono.toLowerCase()}.` : ''}

Debes verificar al cliente las preguntas requeridas para generar una ${appointmentType === 'booking' ? 'reserva' : 'cita'}.

De preguntas de clientes y consultas generales que no estás capacitado para ayudar DEBES decir que escriba sobre eso y enviará la pregunta a un representante, aunque seas capaz de responder. Aquí indicarás que pueden responderle dentro de 24 horas (usando la función [contact]). Dado esto ocurra, el colaborador recibirá una notificación.

SOLO realizarás la función calendar() si lo consideras estrictamente NECESARIO. El calendario te proporcionará los horarios de disponibilidad.

${directrices.value}

[IMPORTANTE]:
</rules>

Nombre: ${nombre}
Establecimiento: ${establecimiento}
${ubicacion ? `Ubicación: ${ubicacion}` : ''}
${tipoEstablecimiento ? `Tipo: ${tipoEstablecimiento}` : ''}
${businessDescription ? `\nDescripción del negocio:\n${businessDescription}` : ''}
${infoHotel ? `\nInformación del establecimiento:\n${infoHotel}` : ''}
${propuesta ? `\nPropuesta de valor:\n${propuesta}` : ''}
${web ? `\nPágina web: ${web}` : ''}`;

    return prompt;
  };

  const renderPromptWithHighlights = () => {
    // Helper para obtener valor de campo de forma segura
    const getFieldValue = (key: string, defaultValue: string = '') => {
      return fields[key]?.value || defaultValue;
    };

    const nombre = getFieldValue('nombre', 'Asistente');
    const establecimiento = getFieldValue('establecimiento', 'el establecimiento');
    const ubicacion = getFieldValue('ubicacion', '');
    const tono = getFieldValue('tono', 'Formal');
    const tipoEstablecimiento = getFieldValue('tipoEstablecimiento', '');
    const infoHotel = getFieldValue('infoHotel', '');
    const propuesta = getFieldValue('propuesta', '');
    const web = getFieldValue('web', '');
    
    // Obtener descripción del business si está disponible
    const businessDescription = (activeBusiness as any)?.description || '';

    return (
      <>
        <span>&lt;rules&gt;</span>
        {'\n'}
        <span>&lt;role&gt;Eres "</span>
        <span className="underline decoration-2 decoration-purple-400">{nombre}</span>
        <span>", asistente {appointmentType === 'booking' ? 'de reservas' : 'virtual'} de "</span>
        <span className="underline decoration-2 decoration-purple-400">{establecimiento}</span>
        {appointmentType === 'booking' ? (
          <>
            <span>". Tus acciones consultan servicios diseñados específicamente para "</span>
            <span className="underline decoration-2 decoration-purple-400">{establecimiento}</span>
            {ubicacion ? (
              <>
                <span>", un establecimiento en </span>
                <span className="underline decoration-2 decoration-purple-400">{ubicacion}</span>
              </>
            ) : null}
            <span>. Ayuda a los visitantes a reservar sus vacaciones. Debes confirmar con quién estás hablando (nombre completo), la fecha de ingreso y la fecha de egreso, además del tipo de habitación y método de pago.</span>
          </>
        ) : (
          <>
            {ubicacion ? (
              <>
                <span>" ubicado en </span>
                <span className="underline decoration-2 decoration-purple-400">{ubicacion}</span>
              </>
            ) : null}
            <span>. Tu trabajo es ayudar a los clientes con información sobre servicios, responder preguntas y agendar citas de manera profesional y amable.</span>
          </>
        )}
        <span>&lt;/role&gt;</span>
        {'\n\n'}
        {tono && (
          <>
            <span>Hablas en tono </span>
            <span className="underline decoration-2 decoration-purple-400">{tono.toLowerCase()}</span>
            <span>.</span>
            {'\n\n'}
          </>
        )}
        <span>Debes verificar al cliente las preguntas requeridas para generar una {appointmentType === 'booking' ? 'reserva' : 'cita'}.</span>
        {'\n\n'}
        <span>De preguntas de clientes y consultas generales que no estás capacitado para ayudar DEBES decir que escriba sobre eso y enviará la pregunta a un representante, aunque seas capaz de responder. Aquí indicarás que pueden responderle dentro de 24 horas (usando la función [contact]). Dado esto ocurra, el colaborador recibirá una notificación.</span>
        {'\n\n'}
        <span>SOLO realizarás la función calendar() si lo consideras estrictamente NECESARIO. El calendario te proporcionará los horarios de disponibilidad.</span>
        {'\n\n'}
        <span className="underline decoration-2 decoration-purple-400">{directrices.value}</span>
        {'\n\n'}
        <span>[IMPORTANTE]:</span>
        {'\n'}
        <span>&lt;/rules&gt;</span>
        {'\n\n'}
        <span>Nombre: </span>
        <span className="underline decoration-2 decoration-purple-400">{nombre}</span>
        {'\n'}
        <span>Establecimiento: </span>
        <span className="underline decoration-2 decoration-purple-400">{establecimiento}</span>
        {'\n'}
        {ubicacion && (
          <>
            <span>Ubicación: </span>
            <span className="underline decoration-2 decoration-purple-400">{ubicacion}</span>
            {'\n'}
          </>
        )}
        {tipoEstablecimiento && (
          <>
            <span>Tipo: </span>
            <span className="underline decoration-2 decoration-purple-400">{tipoEstablecimiento}</span>
            {'\n\n'}
          </>
        )}
        {businessDescription && (
          <>
            <span>Descripción del negocio:</span>
            {'\n'}
            <span className="underline decoration-2 decoration-purple-400">{businessDescription}</span>
            {'\n\n'}
          </>
        )}
        {infoHotel && (
          <>
            <span>Información del establecimiento:</span>
            {'\n'}
            <span className="underline decoration-2 decoration-purple-400">{infoHotel}</span>
            {'\n\n'}
          </>
        )}
        {propuesta && (
          <>
            <span>Propuesta de valor:</span>
            {'\n'}
            <span className="underline decoration-2 decoration-purple-400">{propuesta}</span>
            {'\n\n'}
          </>
        )}
        {web && (
          <>
            <span>Página web: </span>
            <span className="underline decoration-2 decoration-purple-400">{web}</span>
          </>
        )}
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg mb-1">Información principal</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllAsReviewed}
            className="text-xs md:text-sm"
          >
            {isAllReviewed ? 'Desmarcar todo' : 'Marcar todo como revisado'}
          </Button>
        </div>

        {/* Nombre del asistente */}
        {fields.nombre && (
          <ConfigFieldInput
            field={{
              key: 'nombre',
              label: fields.nombre.label,
              value: fields.nombre.value,
              locked: fields.nombre.locked
            }}
            onUpdate={(key, value) => updateField(key, value)}
            onToggleLock={(key) => toggleLock(key)}
          />
        )}

        {/* Tono */}
        {fields.tono && (
          <ConfigFieldInput
            field={{
              key: 'tono',
              label: fields.tono.label,
              value: fields.tono.value,
              locked: fields.tono.locked
            }}
            onUpdate={(key, value) => updateField(key, value)}
            onToggleLock={(key) => toggleLock(key)}
            specialType="tono"
          />
        )}

        {/* Idioma */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="language">Idioma</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={languageReviewed}
                onCheckedChange={() => setLanguageReviewed(!languageReviewed)}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Select value={language} onValueChange={(value: 'es' | 'en') => setLanguage(value)} disabled={languageReviewed}>
            <SelectTrigger id="language" className={`w-full ${languageReviewed ? 'bg-gray-50' : 'bg-white'}`}>
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voz */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice">Voz</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={voiceReviewed}
                onCheckedChange={() => setVoiceReviewed(!voiceReviewed)}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <Select value={voiceId} onValueChange={(value: string) => setVoiceId(value)} disabled={voiceReviewed}>
            <SelectTrigger id="voice" className={`w-full ${voiceReviewed ? 'bg-gray-50' : 'bg-white'}`}>
              <SelectValue placeholder="Selecciona una voz" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span>{voice.name}</span>
                    {voice.description && (
                      <span className="text-xs text-gray-500">{voice.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mensaje inicial */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="firstMessage">Mensaje inicial</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={firstMessageReviewed}
                onCheckedChange={() => setFirstMessageReviewed(!firstMessageReviewed)}
              />
              <span className="text-sm text-gray-600">Revisado</span>
            </div>
          </div>
          <textarea
            id="firstMessage"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            disabled={firstMessageReviewed}
            className={`w-full p-3 border rounded-lg resize-none ${firstMessageReviewed ? 'bg-gray-50' : 'bg-white'}`}
            rows={3}
            placeholder={(() => {
              const assistantName = fields.nombre?.value || 'tu asistente';
              const businessName = activeBusiness?.name || 'el negocio';
              return generateDefaultFirstMessage(assistantName, businessName, language);
            })()}
          />
          <p className="text-xs text-gray-500">{firstMessage.length}/200 caracteres</p>
        </div>

        <div className="pt-4">
          <h2 className="text-lg mb-1">{businessInfoLabel}</h2>
        </div>

        {/* Nombre del establecimiento */}
        {fields.establecimiento && (
          <ConfigFieldInput
            field={{
              key: 'establecimiento',
              label: fields.establecimiento.label,
              value: fields.establecimiento.value,
              locked: fields.establecimiento.locked
            }}
            onUpdate={(key, value) => updateField(key, value)}
            onToggleLock={(key) => toggleLock(key)}
          />
        )}

        {/* Ubicación */}
        {fields.ubicacion && (
          <ConfigFieldInput
            field={{
              key: 'ubicacion',
              label: fields.ubicacion.label,
              value: fields.ubicacion.value,
              locked: fields.ubicacion.locked
            }}
            onUpdate={(key, value) => updateField(key, value)}
            onToggleLock={(key) => toggleLock(key)}
          />
        )}

        {/* Tipo de establecimiento */}
        {fields.tipoEstablecimiento && (
          <ConfigFieldInput
            field={{
              key: 'tipoEstablecimiento',
              label: fields.tipoEstablecimiento.label,
              value: fields.tipoEstablecimiento.value,
              locked: fields.tipoEstablecimiento.locked
            }}
            onUpdate={(key, value) => updateField(key, value)}
            onToggleLock={(key) => toggleLock(key)}
          />
        )}

        {/* Información del establecimiento (textarea) */}
        {fields.infoHotel && (
          <ConfigFieldInput
            field={{
              key: 'infoHotel',
              label: fields.infoHotel.label,
              value: fields.infoHotel.value,
              locked: fields.infoHotel.locked,
              multiline: true,
              rows: fields.infoHotel.rows
            }}
            onUpdate={(key, value) => updateField(key, value)}
            onToggleLock={(key) => toggleLock(key)}
          />
        )}

        {fields.propuesta && (
          <>
            <div className="pt-4">
              <h2 className="text-lg mb-1">Propuesta de valor</h2>
  
            </div>

            {/* Propuesta de valor */}
            <ConfigFieldInput
              field={{
                key: 'propuesta',
                label: 'Propuesta de valor del establecimiento',
                value: fields.propuesta.value,
                locked: fields.propuesta.locked,
                multiline: true,
                rows: fields.propuesta.rows
              }}
              onUpdate={(key, value) => updateField(key, value)}
              onToggleLock={(key) => toggleLock(key)}
            />
          </>
        )}

        {fields.web && (
          <>
            <div className="pt-4">
              <h2 className="text-lg mb-1">Página web</h2>
  
            </div>

            {/* Página web */}
            <ConfigFieldInput
              field={{
                key: 'web',
                label: fields.web.label,
                value: fields.web.value,
                locked: fields.web.locked
              }}
              onUpdate={(key, value) => updateField(key, value)}
              onToggleLock={(key) => toggleLock(key)}
            />
          </>
        )}

        {/* Directrices */}
        <AccordionSection
          id="directrices"
          title="Directrices de comunicación"
          isExpanded={expandedSections.has('directrices')}
          onToggle={() => toggleSection('directrices')}
          borderColor="border-l-purple-500"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={directrices.locked}
                  onChange={() => setDirectrices({ ...directrices, locked: !directrices.locked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-600">Revisado</span>
              </div>
            </div>
            <textarea
              value={directrices.value || directricesDefaultValue}
              onChange={(e) => {
                const newValue = e.target.value;
                // Si el usuario borra todo y queda igual al defaultValue, guardar string vacío
                const finalValue = newValue === directricesDefaultValue ? '' : newValue;
                setDirectrices({ ...directrices, value: finalValue });
              }}
              disabled={directrices.locked}
              className={`w-full p-3 border rounded-lg resize-none ${directrices.locked ? 'bg-gray-50' : 'bg-white'}`}
              rows={10}
              placeholder={directricesDefaultValue}
            />
            <p className="text-xs text-gray-500">{(directrices.value || directricesDefaultValue).length}/1500 caracteres</p>
          </div>
        </AccordionSection>

        {/* Situaciones */}
        <AccordionSection
          id="situaciones"
          title="Situaciones en las que el Asistente debe detenerse"
          isExpanded={expandedSections.has('situaciones')}
          onToggle={() => toggleSection('situaciones')}
          borderColor="border-l-red-500"
          customCount={`${situaciones.filter(sit => sit.numero !== 8).length} situaciones configuradas`}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Define situaciones específicas en las que el asistente debe transferir la conversación a un humano.
            </p>

            {situaciones
              .filter(sit => sit.numero !== 8) // Excluir la situación especial número 8
              .map((situacion, index) => (
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
                  showRemove={true}
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
    </div>
  );
}