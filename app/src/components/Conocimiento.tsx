'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { BusinessSelector } from './BusinessSelector';
import { BusinessIndicator } from './BusinessIndicator';
import { PageHeader } from './layout/PageHeader';
import { useUserStore } from '../stores/userStore';
import { useAssistantStore } from '../stores/assistantStore';
import { Settings, DollarSign, Building2, FileText, Plug, Bot, Loader2 } from 'lucide-react';
import { ConfiguracionAsistenteTab } from './conocimiento/ConfiguracionAsistenteTab';
import { PrecioDisponibilidadTab } from './conocimiento/PrecioDisponibilidadTab';
import { InformacionEstablecimientoTab } from './conocimiento/InformacionEstablecimientoTab';
import { InformacionExtraTab } from './conocimiento/InformacionExtraTab';
import { IntegracionFotosTab } from './conocimiento/IntegracionFotosTab';
import { apiService } from '../services/api.service';
import { businessTypeContent, BusinessType } from '../config/businessConfig/businessTypeContent';
import { UnsavedChangesDialog } from './ui/unsaved-changes-dialog';
import { BehaviorConfigWarningDialog } from './ui/behavior-config-warning-dialog';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

interface TabCardProps {
  icon: any;
  title: string;
  progress: number;
  isActive: boolean;
  onClick: () => void;
}

function TabCard({ icon: Icon, title, progress, isActive, onClick }: TabCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all h-24 flex flex-col justify-between ${
        isActive 
          ? 'border-purple-600 bg-purple-600 text-white' 
          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm text-center line-clamp-1 truncate">{title}</span>
      </div>
      <div className="space-y-1">
        <div className={`h-1.5 rounded-full overflow-hidden ${
          isActive ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-full rounded-full ${isActive ? 'bg-white' : 'bg-purple-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`text-xs text-center ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
          {progress}%
        </p>
      </div>
    </button>
  );
}

export function Conocimiento() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('configuracion');
  const { activeBusiness, updateBusiness } = useUserStore();
  const {
    assistantConfig,
    assistantConfigId,
    isLoadingConfig,
    setAssistantConfig,
    setAssistantConfigId,
    updateAssistantConfig,
    setLoadingConfig,
  } = useAssistantStore();
  const businessType = (activeBusiness?.industry as BusinessType) || 'other';
  const content = businessTypeContent[businessType] || businessTypeContent.other;

  // Funciones helper para calcular progreso desde config_data (sin montar componentes)
  const calculateConfiguracionProgress = useCallback((configData: any) => {
    const data = configData?.configuracionAsistente;
    if (!data || !content?.configuracionAsistente) return 0;

    const situacionesRelevantes = (data.situaciones || []).filter((sit: any) => sit.numero !== 8);
    const totalItems = content.configuracionAsistente.fields.length + 1 + situacionesRelevantes.length;
    let completedItems = 0;

    // Contar campos completados y con check "Revisado"
    content.configuracionAsistente.fields.forEach((field: any) => {
      const fieldData = data.fields?.find((f: any) => f.key === field.key);
      if (field.key === 'web') {
        if (fieldData && fieldData.locked) {
          completedItems++;
        }
      } else {
        if (fieldData && fieldData.value?.trim() !== '' && fieldData.locked) {
          completedItems++;
        }
      }
    });

    // Contar directrices con check
    if (data.directrices?.locked) {
      completedItems++;
    }

    // Contar situaciones completadas
    const situacionesCompletadas = situacionesRelevantes.filter((sit: any) => 
      sit.titulo?.trim() !== '' && sit.descripcion?.trim() !== '' && sit.revisado
    ).length;
    completedItems += situacionesCompletadas;

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [content]);

  const calculatePreciosProgress = useCallback((configData: any) => {
    const data = configData?.precioDisponibilidad;
    if (!data || !content?.precioDisponibilidad) return 0;

    let totalItems = 0;
    let completedItems = 0;

    // Contar preguntas revisadas en secciones
    content.precioDisponibilidad.secciones.forEach((section: any) => {
      totalItems += section.questions.length;
      section.questions.forEach((q: any, index: number) => {
        const fieldKey = `respuesta${index + 1}`;
        if (data.revisadoData?.[section.key]?.[fieldKey] === true) {
          completedItems++;
        }
      });
    });

    // Contar situaciones completadas
    const situaciones = data.situaciones || [];
    const situacionesCompletadas = situaciones.filter((sit: any) => 
      sit.titulo?.trim() !== '' && sit.descripcion?.trim() !== '' && sit.revisado
    ).length;
    totalItems += situaciones.length;
    completedItems += situacionesCompletadas;

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [content]);

  const calculateEstablecimientoProgress = useCallback((configData: any) => {
    const data = configData?.informacionEstablecimiento;
    if (!data || !content?.informacionEstablecimiento) return 0;

    let totalItems = 0;
    let completedItems = 0;

    // Contar preguntas revisadas en secciones
    Object.keys(content.informacionEstablecimiento).forEach((sectionKey) => {
      if (sectionKey === 'situaciones') return;
      const section = content.informacionEstablecimiento[sectionKey];
      if (section?.questions) {
        totalItems += section.questions.length;
        section.questions.forEach((q: any, index: number) => {
          const fieldKey = `respuesta${index + 1}`;
          if (data.revisadoData?.[sectionKey]?.[fieldKey] === true) {
            completedItems++;
          }
        });
      }
    });

    // Contar situaciones completadas
    const situaciones = data.situaciones || [];
    const situacionesCompletadas = situaciones.filter((sit: any) => 
      sit.titulo?.trim() !== '' && sit.descripcion?.trim() !== '' && sit.revisado
    ).length;
    totalItems += situaciones.length;
    completedItems += situacionesCompletadas;

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [content]);

  const calculateExtraProgress = useCallback((configData: any) => {
    const data = configData?.informacionExtra;
    if (!data || !content?.informacionExtra) return 0;

    let totalItems = 0;
    let completedItems = 0;

    // Contar preguntas revisadas en secciones
    Object.keys(content.informacionExtra).forEach((sectionKey) => {
      const section = content.informacionExtra[sectionKey];
      if (section?.questions) {
        totalItems += section.questions.length;
        section.questions.forEach((q: any, index: number) => {
          const fieldKey = `respuesta${index + 1}`;
          if (data.revisadoData?.[sectionKey]?.[fieldKey] === true) {
            completedItems++;
          }
        });
      }
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [content]);

  const calculateIntegracionProgress = useCallback((configData: any) => {
    const data = configData?.integracionFotos;
    if (!data) return 0;

    let totalItems = 0;
    let completedItems = 0;

    // Contar áreas comunes con fotos (al menos 1 foto por área)
    const areasComunes = data.areasComunes || [];
    totalItems += areasComunes.length;
    areasComunes.forEach((area: any) => {
      if (area.imagenes && area.imagenes.length > 0) {
        completedItems++;
      }
    });

    // Contar fotos generales (mínimo 5 fotos)
    const minFotosGenerales = 5;
    totalItems += 1;
    const fotosGenerales = data.fotosGenerales || [];
    if (fotosGenerales.length >= minFotosGenerales) {
      completedItems++;
    }

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, []);

  // Estado para almacenar el progreso de cada tab
  const [tabProgress, setTabProgress] = useState<Record<string, number>>({
    configuracion: 0,
    precios: 0,
    establecimiento: 0,
    extra: 0,
    integracion: 0
  });

  // Alias para compatibilidad con código existente
  const configId = assistantConfigId;
  const isLoading = isLoadingConfig;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [showBehaviorWarningDialog, setShowBehaviorWarningDialog] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const initialConfigRef = useRef<any>(null);
  const navigationBlockedRef = useRef(false);
  const progressInitializedRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Callback para que cada tab reporte su progreso
  const updateTabProgress = useCallback((tabId: string, progress: number) => {
    setTabProgress(prev => ({
      ...prev,
      [tabId]: progress
    }));
  }, []);

  // Función helper para comparar objetos profundamente
  const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        if (obj1[key].length !== obj2[key].length) return false;
        for (let i = 0; i < obj1[key].length; i++) {
          if (!deepEqual(obj1[key][i], obj2[key][i])) return false;
        }
      } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && 
                 !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
        if (!deepEqual(obj1[key], obj2[key])) return false;
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    
    return true;
  }, []);

  // Callback para que cada tab reporte cambios
  const onConfigChange = useCallback((tabId: string, data: any) => {
    if (!assistantConfig) return;
    
    // No establecer hasUnsavedChanges durante la carga inicial
    if (isInitialLoadRef.current) return;
    
    // Actualizar el store
    updateAssistantConfig({ [tabId]: data });
    
    // Comparar con el estado inicial para determinar si realmente hay cambios
    const currentConfigData = assistantConfig.config_data || {};
    const initialConfigData = initialConfigRef.current || {};
    
    // Crear una copia del config_data actualizado para comparar
    const updatedConfigData = {
      ...currentConfigData,
      [tabId]: data
    };
    
    // Comparar el config_data actualizado con el inicial
    const hasChanges = !deepEqual(updatedConfigData, initialConfigData);
    setHasUnsavedChanges(hasChanges);
  }, [assistantConfig, updateAssistantConfig, deepEqual]);

  // Cargar configuración al montar o cambiar business
  useEffect(() => {
    const loadConfig = async () => {
      if (!activeBusiness?.id) {
        setLoadingConfig(false);
        return;
      }

      try {
        // Marcar que estamos en carga inicial cuando cambia el business
        isInitialLoadRef.current = true;
        setLoadingConfig(true);
        const config = await apiService.getAssistantConfig(activeBusiness.id) as any;
        
        console.log('Configuración cargada del backend:', config);
        console.log('Config_data cargado:', config?.config_data);
        console.log('ConfiguracionAsistente cargada:', config?.config_data?.configuracionAsistente);
        console.log('Nombre del asistente en config_data:', config?.config_data?.configuracionAsistente?.fields?.find((f: any) => f.key === 'nombre')?.value);
        
        if (config) {
          // Verificar si hay datos en el store que no están en el backend (cambios locales)
          const currentStore = useAssistantStore.getState();
          const storeConfig = currentStore.assistantConfig;
          
          // Si hay config_data en el store del mismo business, mergear cambios locales con backend
          // Priorizar cambios locales (del store) sobre backend para mantener datos sin guardar
          let finalConfig = config;
          
          if (storeConfig?.config_data && storeConfig.business_id === activeBusiness.id && storeConfig.id === config.id) {
            // Hay datos locales del mismo business y misma config, mergear manteniendo cambios locales
            console.log('Hay datos locales en store, mergeando con backend (priorizando cambios locales)...');
            
            // Merge profundo: mantener cambios locales pero completar con datos del backend
            const mergedConfigData = {
              ...config.config_data, // Base desde backend
              ...storeConfig.config_data, // Sobrescribir con cambios locales
              // Merge profundo para cada sección
              configuracionAsistente: {
                ...config.config_data?.configuracionAsistente,
                ...storeConfig.config_data?.configuracionAsistente,
              },
              precioDisponibilidad: {
                ...config.config_data?.precioDisponibilidad,
                ...storeConfig.config_data?.precioDisponibilidad,
              },
              informacionEstablecimiento: {
                ...config.config_data?.informacionEstablecimiento,
                ...storeConfig.config_data?.informacionEstablecimiento,
              },
              informacionExtra: {
                ...config.config_data?.informacionExtra,
                ...storeConfig.config_data?.informacionExtra,
              },
              integracionFotos: {
                ...config.config_data?.integracionFotos,
                ...storeConfig.config_data?.integracionFotos,
              },
            };
            
            finalConfig = {
              ...config,
              config_data: mergedConfigData,
            };
            
            console.log('Config_data mergeado (cambios locales preservados)');
          }
          
          // Normalizar behaviorConfig a behavior_config para el store
          const normalizedConfig = {
            ...finalConfig,
            behavior_config: finalConfig.behaviorConfig || finalConfig.behavior_config || storeConfig?.behavior_config || {},
          };
          // Eliminar behaviorConfig si existe para evitar duplicados
          if (normalizedConfig.behaviorConfig) {
            delete normalizedConfig.behaviorConfig;
          }
          
          console.log('Actualizando store con datos mergeados...');
          setAssistantConfig(normalizedConfig);
          
          // Esperar un momento y verificar
          setTimeout(() => {
            const storeState = useAssistantStore.getState();
            console.log('Store DESPUÉS de actualizar:', storeState.assistantConfig?.config_data?.configuracionAsistente?.fields?.find((f: any) => f.key === 'nombre')?.value);
            console.log('Config_data completo en store:', storeState.assistantConfig?.config_data);
          }, 100);
          
          initialConfigRef.current = JSON.parse(JSON.stringify(config.config_data));
          console.log('initialConfigRef actualizado');

          // Calcular progreso de todas las tabs desde config_data
          const configData = config.config_data || {};
          setTabProgress({
            configuracion: calculateConfiguracionProgress(configData),
            precios: calculatePreciosProgress(configData),
            establecimiento: calculateEstablecimientoProgress(configData),
            extra: calculateExtraProgress(configData),
            integracion: calculateIntegracionProgress(configData),
          });
          progressInitializedRef.current = true;
          
          // Marcar que la carga inicial ha terminado después de un pequeño delay
          // para permitir que las tabs se sincronicen sin activar hasUnsavedChanges
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
        } else {
          // Si no existe, crear automáticamente en el backend
          console.log('No existe configuración, creando automáticamente...');
          try {
            const emptyConfigData = {
              configuracionAsistente: {},
              precioDisponibilidad: {},
              informacionEstablecimiento: {},
              informacionExtra: {},
              integracionFotos: {
                areasComunes: [],
                fotosGenerales: [],
              },
            };
            
            // Crear configuración en el backend con prompt básico
            const defaultPrompt = `Eres un asistente virtual profesional. Tu trabajo es ayudar a los clientes con información sobre servicios y agendar citas de manera amable y eficiente.`;
            
            const newConfig = await apiService.createAssistantConfig({
              business_id: activeBusiness.id,
              industry: activeBusiness.industry,
              prompt: defaultPrompt,
              config_data: emptyConfigData,
            }) as any;
            
            console.log('Configuración creada automáticamente:', newConfig);
            
            // Actualizar store con la nueva configuración
            setAssistantConfig(newConfig);
            initialConfigRef.current = JSON.parse(JSON.stringify(newConfig.config_data || emptyConfigData));

            // Inicializar progreso en 0 para configuración nueva
            setTabProgress({
              configuracion: 0,
              precios: 0,
              establecimiento: 0,
              extra: 0,
              integracion: 0,
            });
            
            // Marcar que la carga inicial ha terminado
            setTimeout(() => {
              isInitialLoadRef.current = false;
            }, 500);
            
            toast.success('Configuración de asistente creada automáticamente');
          } catch (createError) {
            console.error('Error creando configuración automáticamente:', createError);
            // Si falla la creación, usar estructura vacía local
          const emptyConfigData = {
            configuracionAsistente: {},
            precioDisponibilidad: {},
            informacionEstablecimiento: {},
            informacionExtra: {},
            integracionFotos: {
              areasComunes: [],
              fotosGenerales: [],
            },
          };
          const emptyAssistantConfig = {
            id: '',
            business_id: activeBusiness.id,
            industry: activeBusiness.industry,
            prompt: '',
            config_data: emptyConfigData,
            version: 1,
            created_by: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setAssistantConfig(emptyAssistantConfig);
          initialConfigRef.current = JSON.parse(JSON.stringify(emptyConfigData));

            setTabProgress({
              configuracion: 0,
              precios: 0,
              establecimiento: 0,
              extra: 0,
              integracion: 0,
            });
            
            setTimeout(() => {
              isInitialLoadRef.current = false;
            }, 500);
            
            toast.error('No se pudo crear la configuración automáticamente. Intenta guardar manualmente.');
          }
        }
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading assistant config:', error);
        // Crear estructura vacía en caso de error
        const emptyConfigData = {
          configuracionAsistente: {},
          precioDisponibilidad: {},
          informacionEstablecimiento: {},
          informacionExtra: {},
          integracionFotos: {
            areasComunes: [],
            fotosGenerales: [],
          },
        };
        const emptyAssistantConfig = {
          id: '',
          business_id: activeBusiness.id,
          industry: activeBusiness.industry,
          prompt: '',
          config_data: emptyConfigData,
          version: 1,
          created_by: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setAssistantConfig(emptyAssistantConfig);
        initialConfigRef.current = JSON.parse(JSON.stringify(emptyConfigData));

        // Inicializar progreso en 0 en caso de error
        setTabProgress({
          configuracion: 0,
          precios: 0,
          establecimiento: 0,
          extra: 0,
          integracion: 0,
        });
        
        // Marcar que la carga inicial ha terminado
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 500);
      } finally {
        setLoadingConfig(false);
      }
    };

    loadConfig();
  }, [activeBusiness?.id, calculateConfiguracionProgress, calculatePreciosProgress, calculateEstablecimientoProgress, calculateExtraProgress, calculateIntegracionProgress]);

  // Recalcular progreso cuando cambie assistantConfig (actualizaciones desde tabs)
  // Solo después de que se haya inicializado el progreso en la carga inicial
  useEffect(() => {
    if (!assistantConfig?.config_data || isLoadingConfig || !progressInitializedRef.current) return;
    
    const configData = assistantConfig.config_data;
    setTabProgress(prev => ({
      ...prev,
      configuracion: calculateConfiguracionProgress(configData),
      precios: calculatePreciosProgress(configData),
      establecimiento: calculateEstablecimientoProgress(configData),
      extra: calculateExtraProgress(configData),
      integracion: calculateIntegracionProgress(configData),
    }));
  }, [assistantConfig?.config_data, isLoadingConfig, calculateConfiguracionProgress, calculatePreciosProgress, calculateEstablecimientoProgress, calculateExtraProgress, calculateIntegracionProgress]);

  // Función helper para validar si behavior_config está configurado
  const hasBehaviorConfig = useCallback(() => {
    if (!assistantConfig?.behavior_config) return false;
    
    const behaviorConfig = assistantConfig.behavior_config;
    
    // Verificar que tenga al menos los campos esenciales configurados
    const hasEssentialFields = 
      behaviorConfig.estado !== undefined &&
      behaviorConfig.zonaHoraria !== undefined;
    
    // Verificar que no esté vacío (más que solo defaults)
    const hasData = Object.keys(behaviorConfig).length > 0;
    
    return hasEssentialFields && hasData;
  }, [assistantConfig?.behavior_config]);

  // Función para crear asistente en Vapi (extraída para reutilización)
  const createVapiAssistant = useCallback(async (configData: any, prompt: string, savedConfig: any) => {
    console.log('🎯 [createVapiAssistant] Iniciando creación de assistant...');
    console.log('🎯 [createVapiAssistant] activeBusiness:', { id: activeBusiness?.id, assistant_id: activeBusiness?.assistant_id });
    
    if (!activeBusiness?.id) {
      console.error('❌ [createVapiAssistant] No hay activeBusiness.id');
      return false;
    }
    
    // Verificar si tiene behavior_config configurado
    if (!hasBehaviorConfig()) {
      console.log('⚠️ [createVapiAssistant] No hay behavior_config configurado, mostrando advertencia...');
      setShowBehaviorWarningDialog(true);
      return false;
    }
    
    try {
      console.log('🎯 [createVapiAssistant] Iniciando try block...');
      // Cargar configuración completa desde el backend para obtener prompt_voice actualizado
      let configWithPromptVoice = savedConfig;
      if (savedConfig?.id) {
        try {
          const freshConfig = await apiService.getAssistantConfigById(savedConfig.id) as any;
          configWithPromptVoice = freshConfig;
          console.log('✅ Configuración cargada desde backend con prompt_voice:', {
            hasPromptVoice: !!freshConfig?.prompt_voice,
            promptVoiceLength: freshConfig?.prompt_voice?.length || 0,
            vapiSyncStatus: freshConfig?.vapiSyncStatus,
          });
          
          // ✅ Validar que KB esté "synced" antes de crear el assistant
          const syncStatus = (freshConfig as any).vapiSyncStatus;
          if (syncStatus === 'syncing') {
            console.log('⏳ KB está sincronizando, esperando a que termine...');
            toast.info('La base de conocimiento se está sincronizando. Esperando a que termine...');
            
            // Esperar hasta que el sync termine (máximo 30 segundos)
            let attempts = 0;
            const maxAttempts = 30; // 30 intentos * 1 segundo = 30 segundos máximo
            let currentStatus = syncStatus;
            
            while (currentStatus === 'syncing' && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
              attempts++;
              
              try {
                const updatedConfig = await apiService.getAssistantConfigById(savedConfig.id) as any;
                currentStatus = updatedConfig?.vapiSyncStatus || 'unknown';
                console.log(`⏳ Intento ${attempts}/${maxAttempts}: Estado de sync: ${currentStatus}`);
                
                if (currentStatus === 'synced') {
                  console.log('✅ KB sincronizada exitosamente');
                  configWithPromptVoice = updatedConfig;
                  break;
                } else if (currentStatus === 'error') {
                  console.warn('⚠️ KB sync terminó con error, pero continuaremos');
                  toast.warning('La base de conocimiento tiene un error. Se reintentará la sincronización al crear el assistant.');
                  break;
                }
              } catch (pollError) {
                console.warn('⚠️ Error al verificar estado de sync:', pollError);
                // Continuar intentando
              }
            }
            
            if (currentStatus === 'syncing' && attempts >= maxAttempts) {
              console.error('❌ Timeout esperando sync de KB');
              toast.error('La sincronización de la base de conocimiento está tomando demasiado tiempo. Por favor, intenta de nuevo en unos momentos.');
              return false;
            }
          }
          if (syncStatus === 'error') {
            toast.warning('La base de conocimiento tiene un error. Se reintentará la sincronización al crear el assistant.');
            // Continuar, el backend reintentará el sync
          }
          if (syncStatus && syncStatus !== 'synced' && syncStatus !== 'idle' && syncStatus !== 'error') {
            console.warn(`⚠️ Estado de sync KB desconocido: ${syncStatus}. Continuando...`);
          }
        } catch (loadError) {
          console.warn('⚠️ No se pudo cargar configuración desde backend, usando savedConfig:', loadError);
          // Continuar con savedConfig si falla la carga
        }
      }
      
      // Usar prompt_voice si existe, sino usar el prompt regular
      const systemPrompt = configWithPromptVoice?.prompt_voice || configWithPromptVoice?.prompt || prompt;
      
      if (!systemPrompt || systemPrompt.trim().length === 0) {
        console.error('❌ No hay prompt disponible para crear el asistente');
        toast.error('No hay prompt configurado. Por favor, completa la configuración del asistente.');
        return false;
      }
      
      console.log('📝 Creando asistente en Vapi con prompt:', {
        hasPromptVoice: !!configWithPromptVoice?.prompt_voice,
        promptLength: systemPrompt.length,
        usingPromptVoice: !!configWithPromptVoice?.prompt_voice,
      });
      
      // Obtener idioma y voz desde configData
      const language = configData.configuracionAsistente?.language || 'es';
      const voiceId = configData.configuracionAsistente?.voiceId || (language === 'es' ? 'tts-1' : 'tts-1');
      
      // Determinar el provider y configuración de voz según el voiceId
      // Si voiceId es 'tts-1', usar OpenAI TTS (no requiere voiceId)
      // Si voiceId es otro, usar ElevenLabs (requiere voiceId)
      const isOpenAI = voiceId === 'tts-1';
      const voiceConfig = isOpenAI
        ? {
            provider: 'openai' as const,
            model: 'tts-1',
            // No incluir voiceId para OpenAI TTS
          }
        : {
            provider: '11labs' as const,
            voiceId: voiceId,
            model: 'eleven_multilingual_v2',
          };
      
      // Determinar el endpoint según el idioma
      const endpoint = language === 'es' ? 'spanish' : 'english';
      
      const assistantPayload = {
        name: configData.configuracionAsistente?.fields?.find((f: any) => f.key === 'nombre')?.value || activeBusiness.name,
        language: language,
        voice: voiceConfig,
        model: {
          messages: [{
            role: 'system',
            content: systemPrompt,
          }],
        },
      };
      
      console.log('🎯 [createVapiAssistant] Llamando a apiService.createVapiAssistant...');
      console.log('🎯 [createVapiAssistant] businessId:', activeBusiness.id);
      console.log('🎯 [createVapiAssistant] endpoint:', endpoint);
      console.log('🎯 [createVapiAssistant] payload:', JSON.stringify(assistantPayload, null, 2));
      
      const vapiAssistant = await apiService.createVapiAssistant(activeBusiness.id, assistantPayload, endpoint) as any;
      console.log('✅ [createVapiAssistant] Asistente creado en Vapi:', vapiAssistant);
      
      // Actualizar activeBusiness con el nuevo assistant_id
      if (vapiAssistant?.dbAssistant?.id) {
        updateBusiness(activeBusiness.id, {
          assistant_id: vapiAssistant.dbAssistant.id,
        });
        console.log('✅ Business actualizado con assistant_id:', vapiAssistant.dbAssistant.id);
      } else {
        console.warn('⚠️ [createVapiAssistant] vapiAssistant no tiene dbAssistant.id:', vapiAssistant);
      }
      
      toast.success('Asistente creado en Vapi exitosamente');
      return true;
    } catch (vapiError: any) {
      console.error('Error creando asistente en Vapi:', vapiError);
      toast.error(`Error creando asistente en Vapi: ${vapiError.message || 'Error desconocido'}`);
      return false;
    }
  }, [activeBusiness, hasBehaviorConfig]);

  // Función para guardar cambios (optimistic update)
  const handleSave = useCallback(async () => {
    console.log('🔵 [handleSave] INICIANDO handleSave');
    console.log('🔵 [handleSave] activeBusiness:', { id: activeBusiness?.id, assistant_id: activeBusiness?.assistant_id });
    console.log('🔵 [handleSave] assistantConfig:', { id: assistantConfig?.id });
    
    if (!activeBusiness?.id || !assistantConfig) {
      console.warn('❌ [handleSave] No se puede guardar: falta activeBusiness o assistantConfig');
      return;
    }

    // Guardar el estado anterior para poder revertir si falla
    const previousConfig = JSON.parse(JSON.stringify(assistantConfig));
    const previousInitialConfig = JSON.parse(JSON.stringify(initialConfigRef.current));

    try {
      console.log('🔵 [handleSave] Iniciando guardado de configuración (optimistic update)...');
      // Obtener el prompt generado desde configuracionAsistente
      const configData = assistantConfig.config_data || {};
      const prompt = configData.configuracionAsistente?.prompt || assistantConfig.prompt || '';
      
      console.log('Config data a guardar:', JSON.stringify(configData, null, 2));
      console.log('Prompt:', prompt);
      
      // 1. ACTUALIZAR EL STORE INMEDIATAMENTE (optimistic update)
      console.log('Actualizando store inmediatamente con datos locales...');
      const optimisticConfig = {
        ...assistantConfig,
        config_data: configData,
        prompt: prompt,
        updated_at: new Date().toISOString(),
      };
      setAssistantConfig(optimisticConfig);
      initialConfigRef.current = JSON.parse(JSON.stringify(configData));
      setHasUnsavedChanges(false);
      navigationBlockedRef.current = false;
      
      // Asegurar que isInitialLoadRef esté en false después de guardar
      isInitialLoadRef.current = false;
      
      // Mostrar toast de éxito inmediatamente
      toast.success('Configuración del asistente actualizada', {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 3000,
      });
      
      // 2. GUARDAR EN EL BACKEND Y SINCRONIZAR CON VAPI
      // Capturar el valor de activeBusiness al momento de crear la función para evitar problemas de closure
      const currentBusinessId = activeBusiness?.id;
      const currentAssistantId = activeBusiness?.assistant_id;
      
      const saveToBackend = async () => {
        console.log('🟢 [saveToBackend] INICIANDO saveToBackend');
        console.log('🟢 [saveToBackend] currentBusinessId:', currentBusinessId);
        console.log('🟢 [saveToBackend] currentAssistantId:', currentAssistantId);
        console.log('🟢 [saveToBackend] activeBusiness actual:', { id: activeBusiness?.id, assistant_id: activeBusiness?.assistant_id });
        
        try {
          let savedConfig: any;
          
          if (assistantConfig.id) {
            // Actualizar config existente
            console.log('🟢 [saveToBackend] Guardando en backend (async)...');
            
            // Detectar qué cambió para sincronización inteligente
            const initialData = previousInitialConfig;
            const currentData = configData;
            
            // Comparar para detectar cambios en knowledge base (config_data)
            const knowledgeBaseChanged = !deepEqual(
              {
                precioDisponibilidad: initialData.precioDisponibilidad,
                informacionEstablecimiento: initialData.informacionEstablecimiento,
                informacionExtra: initialData.informacionExtra,
                integracionFotos: initialData.integracionFotos,
              },
              {
                precioDisponibilidad: currentData.precioDisponibilidad,
                informacionEstablecimiento: currentData.informacionEstablecimiento,
                informacionExtra: currentData.informacionExtra,
                integracionFotos: currentData.integracionFotos,
              }
            );
            
            // Comparar para detectar cambios en prompt
            const promptChanged = 
              (initialData.configuracionAsistente?.prompt || '') !== 
              (currentData.configuracionAsistente?.prompt || '');
            
            console.log('🟢 [saveToBackend] Cambios detectados:', { knowledgeBaseChanged, promptChanged });
            
            savedConfig = await apiService.updateAssistantConfig(assistantConfig.id, {
              config_data: configData,
              prompt,
            }) as any;
            
            console.log('🟢 [saveToBackend] Después de guardar config, verificando assistant_id...');
            console.log('🟢 [saveToBackend] currentAssistantId (capturado):', currentAssistantId);
            console.log('🟢 [saveToBackend] activeBusiness?.assistant_id (actual):', activeBusiness?.assistant_id);
            console.log('🟢 [saveToBackend] !currentAssistantId:', !currentAssistantId);
            
            // Si no hay assistant_id, SIEMPRE intentar crear asistente en Vapi
            // (incluso si no detectamos cambios, porque el usuario puede estar haciendo click en "Crear Asistente")
            // Usar el valor capturado para evitar problemas de closure
            console.log('🟢 [saveToBackend] Evaluando condición para crear assistant...');
            console.log('🟢 [saveToBackend] currentAssistantId === null:', currentAssistantId === null);
            console.log('🟢 [saveToBackend] currentAssistantId === undefined:', currentAssistantId === undefined);
            console.log('🟢 [saveToBackend] currentAssistantId == null:', currentAssistantId == null);
            console.log('🟢 [saveToBackend] !currentAssistantId:', !currentAssistantId);
            
            if (!currentAssistantId) {
              console.log('🚀 [CREATE ASSISTANT] ✅ CONDICIÓN CUMPLIDA: No hay assistant_id, intentando crear asistente en Vapi...');
              console.log('🚀 [CREATE ASSISTANT] activeBusiness:', { id: activeBusiness?.id, assistant_id: activeBusiness?.assistant_id });
              console.log('🚀 [CREATE ASSISTANT] currentBusinessId:', currentBusinessId);
              console.log('🚀 [CREATE ASSISTANT] currentData:', currentData);
              console.log('🚀 [CREATE ASSISTANT] prompt:', prompt);
              console.log('🚀 [CREATE ASSISTANT] savedConfig:', savedConfig);
              
              try {
                console.log('🚀 [CREATE ASSISTANT] Llamando a createVapiAssistant...');
                const created = await createVapiAssistant(currentData, prompt, savedConfig);
                console.log('🚀 [CREATE ASSISTANT] Resultado de createVapiAssistant:', created);
                if (created) {
                  console.log('✅ Asistente creado exitosamente. Recargando business para obtener assistant_id...');
                  // Recargar business para obtener el nuevo assistant_id
                  // Esto se hará automáticamente cuando el usuario recargue la página o navegue
                } else {
                  console.warn('⚠️ [CREATE ASSISTANT] createVapiAssistant retornó false');
                }
              } catch (createError: any) {
                console.error('❌ [CREATE ASSISTANT] Error al crear asistente:', createError);
                console.error('❌ [CREATE ASSISTANT] Stack:', createError?.stack);
                console.error('❌ [CREATE ASSISTANT] Message:', createError?.message);
                // NO re-lanzar el error aquí, solo loguearlo para no romper el flujo de guardado
                toast.error(`Error al crear asistente: ${createError?.message || 'Error desconocido'}`);
              }
            } else {
              console.log('ℹ️ [CREATE ASSISTANT] ❌ CONDICIÓN NO CUMPLIDA: Ya existe assistant_id, no se creará nuevo assistant');
              console.log('ℹ️ [CREATE ASSISTANT] currentAssistantId:', currentAssistantId);
              console.log('ℹ️ [CREATE ASSISTANT] activeBusiness.assistant_id:', activeBusiness?.assistant_id);
            }
            
            // Actualizar el store con la respuesta del backend
            console.log('Backend guardado exitosamente, actualizando store con respuesta del backend');
            setAssistantConfig(savedConfig);
            if (savedConfig?.config_data) {
              initialConfigRef.current = JSON.parse(JSON.stringify(savedConfig.config_data));
            }
          } else {
            // Crear nueva config
            console.log('Creando nueva configuración en backend (async)...');
            savedConfig = await apiService.createAssistantConfig({
              business_id: activeBusiness.id,
              industry: activeBusiness.industry,
              prompt,
              config_data: configData,
            }) as any;
            
            console.log('Nueva configuración creada en backend');
            setAssistantConfig(savedConfig);
            if (savedConfig?.config_data) {
              initialConfigRef.current = JSON.parse(JSON.stringify(savedConfig.config_data));
            }
            
            // Si no hay assistant_id, crear asistente en Vapi
            if (!activeBusiness?.assistant_id) {
              console.log('No hay assistant_id, intentando crear asistente en Vapi...');
              await createVapiAssistant(configData, prompt, savedConfig);
            }
          }
        } catch (backendError) {
          console.error('Error al guardar en backend:', backendError);
          // Revertir cambios si falla el backend
          console.log('Revirtiendo cambios debido a error en backend...');
          setAssistantConfig(previousConfig);
          initialConfigRef.current = previousInitialConfig;
          setHasUnsavedChanges(true);
          toast.error('Error al guardar en el servidor. Los cambios se revirtieron.');
        } finally {
          console.log('🟢 [saveToBackend] FINALIZANDO saveToBackend');
        }
      };
      
      // Ejecutar guardado en backend sin bloquear
      console.log('🔵 [handleSave] Ejecutando saveToBackend()...');
      saveToBackend()
        .then(() => {
          console.log('✅ [handleSave] saveToBackend completado exitosamente');
        })
        .catch((error) => {
          console.error('❌ [handleSave] Error en saveToBackend:', error);
          console.error('❌ [handleSave] Stack:', error?.stack);
        });
      
      return true;
    } catch (error) {
      console.error('Error saving assistant config:', error);
      // Revertir cambios si hay error
      setAssistantConfig(previousConfig);
      initialConfigRef.current = previousInitialConfig;
      setHasUnsavedChanges(true);
      toast.error('Error al guardar la configuración. Por favor intenta nuevamente.');
      throw error;
    }
  }, [activeBusiness, assistantConfig, setAssistantConfig, createVapiAssistant]);

  // Función para manejar el guardado y navegación
  const handleSaveAndNavigate = useCallback(async () => {
    try {
      await handleSave();
      setShowNavigationDialog(false);
      navigationBlockedRef.current = false;
      
      // Si hay una ruta pendiente, navegar a ella
      if (pendingRoute) {
        router.push(pendingRoute);
        setPendingRoute(null);
      } else {
        // Si es beforeunload, permitir que continúe
        window.location.reload();
      }
    } catch (error) {
      alert('Error al guardar la configuración. Por favor intenta nuevamente.');
    }
  }, [handleSave, pendingRoute, router]);

  // Función para cancelar y navegar
  const handleCancelAndNavigate = useCallback(() => {
    setHasUnsavedChanges(false);
    setShowNavigationDialog(false);
    navigationBlockedRef.current = false;
    
    // Si hay una ruta pendiente, navegar a ella
    if (pendingRoute) {
      router.push(pendingRoute);
      setPendingRoute(null);
    } else {
      // Si es beforeunload, permitir que continúe
      window.location.reload();
    }
  }, [pendingRoute, router]);

  // Función para manejar cambio de tabs (sin verificación - los tabs son parte de la misma página)
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
  }, []);

  // Interceptar recarga de página (F5, Ctrl+R, botón refresh) para mostrar nuestro diálogo personalizado
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Interceptar intentos de recarga usando Ctrl+R, F5, etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+R, F5, Ctrl+F5
      if ((e.ctrlKey && (e.key === 'r' || e.key === 'R')) || e.key === 'F5') {
        e.preventDefault();
        e.stopPropagation();
        if (!showNavigationDialog) {
          setShowNavigationDialog(true);
          navigationBlockedRef.current = true;
          setPendingRoute(null); // null indica recarga
        }
      }
    };

    // Interceptar beforeunload para prevenir la recarga
    // Nota: beforeunload es síncrono y no puede esperar a diálogos asíncronos
    // Prevenimos la recarga y mostramos nuestro diálogo inmediatamente
    // El navegador puede mostrar brevemente su diálogo nativo, pero nuestro diálogo personalizado aparecerá
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Solo prevenir si no estamos mostrando ya el diálogo
      if (!showNavigationDialog && !navigationBlockedRef.current) {
        // Prevenir la recarga
        e.preventDefault();
        e.returnValue = '';
        // Mostrar nuestro diálogo personalizado inmediatamente
        // Usar requestAnimationFrame para que se ejecute en el siguiente frame
        requestAnimationFrame(() => {
          setShowNavigationDialog(true);
          navigationBlockedRef.current = true;
          setPendingRoute(null);
        });
        return e.returnValue;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, showNavigationDialog]);

  // Interceptar navegación de Next.js (clicks en links y botones)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Mapa de rutas conocidas
    const routeMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'proceso comercial': '/dashboard/proceso-comercial',
      'conversaciones': '/dashboard/conversaciones',
      'contactos': '/dashboard/contactos',
      'campañas': '/dashboard/campanas',
      'configuración': '/dashboard/configuracion',
      'entrenamiento': '/dashboard/entrenamiento',
      'pruebas': '/dashboard/pruebas',
      'mis negocios': '/dashboard/mis-negocios',
      'canales': '/dashboard/canales',
      'mi cuenta': '/dashboard/mi-cuenta',
      'planes y pagos': '/dashboard/planes'
    };

    // Interceptar clicks en links del sidebar y otros elementos
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Interceptar links <a>
      const link = target.closest('a[href]') as HTMLAnchorElement;
      if (link) {
        const href = link.getAttribute('href');
        // Solo interceptar links internos que no sean tabs dentro de Conocimiento
        if (href && href.startsWith('/') && !href.includes('#') && href !== pathname) {
          e.preventDefault();
          e.stopPropagation();
          navigationBlockedRef.current = true;
          setPendingRoute(href);
          setShowNavigationDialog(true);
          return;
        }
      }

      // Interceptar botones del sidebar
      const button = target.closest('button');
      if (button) {
        // Verificar si el botón está en el sidebar
        const sidebar = button.closest('[class*="sidebar"]') || 
                       button.closest('aside') ||
                       document.querySelector('[class*="sidebar"]');
        
        if (sidebar && sidebar.contains(button)) {
          const buttonText = (button.textContent || '').toLowerCase().trim();
          
          // Buscar la ruta correspondiente al texto del botón
          for (const [key, route] of Object.entries(routeMap)) {
            if (buttonText.includes(key.toLowerCase()) && !buttonText.includes('conocimiento')) {
              if (route !== pathname) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                navigationBlockedRef.current = true;
                setPendingRoute(route);
                setShowNavigationDialog(true);
                return;
              }
            }
          }
        }
      }
    };

    // Interceptar el evento popstate (botón atrás/adelante del navegador)
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges && !navigationBlockedRef.current) {
        e.preventDefault();
        navigationBlockedRef.current = true;
        setShowNavigationDialog(true);
        // Mantener la URL actual
        window.history.pushState(null, '', pathname);
      }
    };

    document.addEventListener('click', handleClick, true); // Usar capture phase
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, pathname]);

  const tabs = [
    { id: 'configuracion', icon: Settings, title: 'Configuración del Asistente' },
    { id: 'precios', icon: DollarSign, title: 'Precio y Disponibilidad' },
    { id: 'establecimiento', icon: Building2, title: 'Información del Establecimiento' },
    { id: 'extra', icon: FileText, title: 'Información Extra' },
    { id: 'integracion', icon: Plug, title: 'Integración y Fotos' }
  ];
  const tabOrder = tabs.map((tab) => tab.id);

  // Calcular progreso general (promedio de todos los tabs)
  const overallProgress = useMemo(() => {
    const values = Object.values(tabProgress);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / values.length);
  }, [tabProgress]);

  // Calcular total de items completados y total
  const totalCompleted = useMemo(() => {
    // Esto se calculará basándose en el progreso de cada tab
    // Por ahora retornamos un valor estimado basado en el progreso general
    const totalItems = 52; // Este valor debería calcularse dinámicamente
    const completed = Math.round((overallProgress / 100) * totalItems);
    return { completed, total: totalItems };
  }, [overallProgress]);

  const buildNavigateHandler = (tabId: string, direction: 'previous' | 'next') => {
    const currentIndex = tabOrder.indexOf(tabId);
    if (currentIndex === -1) return undefined;
    const targetIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
    const targetId = tabOrder[targetIndex];
    if (!targetId) return undefined;
    return () => setActiveTab(targetId);
  };

  const previousHandler = buildNavigateHandler(activeTab, 'previous');
  const nextHandler = buildNavigateHandler(activeTab, 'next');
  const navButtonStyle = {
    flex: '1 0 180px',
    maxWidth: 240,
  };

  // Hacer configData referencialmente estable con useMemo (FUERA de renderActiveTab)
  const configData = useMemo(() => assistantConfig?.config_data || {}, [assistantConfig?.config_data]);
  
  // Usar solo el ID como key estable (no updated_at que cambia en cada guardado)
  const configKey = assistantConfig?.id || 'default';

  const renderActiveTab = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-500 dark:text-gray-400">Cargando configuración...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'configuracion':
        return (
          <ConfiguracionAsistenteTab
            key={configKey} // Key estable basado solo en ID
            onProgressChange={(progress) => updateTabProgress('configuracion', progress)}
            initialData={configData.configuracionAsistente}
            onDataChange={(data) => onConfigChange('configuracionAsistente', data)}
          />
        );
      case 'precios':
        return (
          <PrecioDisponibilidadTab
            onProgressChange={(progress) => updateTabProgress('precios', progress)}
            initialData={configData.precioDisponibilidad}
            onDataChange={(data: any) => onConfigChange('precioDisponibilidad', data)}
          />
        );
      case 'establecimiento':
        return (
          <InformacionEstablecimientoTab
            businessType={businessType}
            onProgressChange={(progress) => updateTabProgress('establecimiento', progress)}
            initialData={configData.informacionEstablecimiento}
            onDataChange={(data: any) => onConfigChange('informacionEstablecimiento', data)}
          />
        );
      case 'extra':
        return (
          <InformacionExtraTab
            businessType={businessType}
            onProgressChange={(progress) => updateTabProgress('extra', progress)}
            initialData={configData.informacionExtra}
            onDataChange={(data: any) => onConfigChange('informacionExtra', data)}
          />
        );
      case 'integracion':
        return (
          <IntegracionFotosTab
            businessType={businessType}
            onProgressChange={(progress) => updateTabProgress('integracion', progress)}
            initialData={configData.integracionFotos}
            onDataChange={(data: any) => onConfigChange('integracionFotos', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <PageHeader
        title="Conocimiento"
        subtitle="Configura tu asistente virtual para interactuar efectivamente con tus clientes."
        showBusinessSelector={true}
        actions={
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">{totalCompleted.completed} de {totalCompleted.total} completada</span>
            <span className="text-xs md:text-sm text-purple-600 font-medium">{overallProgress}%</span>
          </div>
        }
      >
        {/* Progress indicator */}
        <div className="mt-4 md:mt-6">
          <p className="text-xs text-gray-500 mb-3 md:mb-4">Progreso Total de Configuración</p>

          {/* Tab Cards - Horizontal scroll on mobile, grid on desktop */}
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0">
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-3">
              {tabs.map((tab) => (
                <TabCard
                  key={tab.id}
                  icon={tab.icon}
                  title={tab.title}
                  progress={tabProgress[tab.id] || 0}
                  isActive={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Content */}
      <div className={isLoading ? 'flex items-center justify-center min-h-[calc(100vh-300px)]' : 'min-h-[calc(100vh-300px)]'}>
        {renderActiveTab()}
      </div>

      {/* Botones de navegación - Solo mostrar si hay data cargada */}
      {!isLoading && assistantConfig && (
        <div className="px-4 md:px-6 lg:px-8 mt-6 md:mt-8 mb-6">
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            <Button
              variant="outline"
              className="px-6 py-3"
              onClick={() => previousHandler?.()}
              disabled={!previousHandler}
              style={navButtonStyle}
            >
              Anterior
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
              onClick={() => nextHandler?.()}
              disabled={!nextHandler}
              style={navButtonStyle}
            >
              Siguiente
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={navButtonStyle}
              onClick={handleSave}
              disabled={
                isLoading || 
                (activeBusiness?.assistant_id ? !hasUnsavedChanges : false)
                // Si no hay assistant_id, siempre habilitar el botón "Crear Asistente"
                // Si hay assistant_id, solo habilitar si hay cambios sin guardar
              }
            >
              {activeBusiness?.assistant_id ? 'Actualizar' : 'Crear Asistente'}
            </Button>
          </div>
        </div>
      )}

      {/* Dialog para cambios sin guardar (navegación fuera de la página) */}
      <UnsavedChangesDialog
        open={showNavigationDialog}
        onOpenChange={(open) => {
          if (!open) {
            navigationBlockedRef.current = false;
            setPendingRoute(null);
          }
          setShowNavigationDialog(open);
        }}
        onSave={handleSaveAndNavigate}
        onCancel={handleCancelAndNavigate}
        title="¿Tienes cambios sin guardar?"
        description="Tienes cambios sin guardar. Si navegas fuera de esta página, perderás los cambios que no hayas guardado."
        saveLabel={activeBusiness?.assistant_id ? 'Actualizar' : 'Crear Asistente'}
        cancelLabel="Salir"
        isLoading={isLoading}
      />

      {/* Dialog para advertencia de behavior_config faltante */}
      <BehaviorConfigWarningDialog
        open={showBehaviorWarningDialog}
        onOpenChange={setShowBehaviorWarningDialog}
        onGoToBehavior={() => {
          router.push('/dashboard/configuracion-asistente');
        }}
        onCancel={() => {
          setShowBehaviorWarningDialog(false);
        }}
      />
    </div>
  );
}