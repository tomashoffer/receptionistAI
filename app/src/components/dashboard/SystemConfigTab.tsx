'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { elevenlabsService } from '@/services/vapi.service';
import { apiService } from '@/services/api.service';
import { useUserStore } from '@/stores/userStore';

// Componente wrapper para el widget de ElevenLabs que aplica correctamente los atributos
interface ElevenLabsWidgetProps {
  agentId?: string;
  actionText?: string;
  startCallText?: string;
  endCallText?: string;
  expandText?: string;
  listeningText?: string;
  speakingText?: string;
}

const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({
  agentId,
  actionText,
  startCallText,
  endCallText,
  expandText,
  listeningText,
  speakingText,
}) => {
  const widgetRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Verificar si el script del widget está cargado
  useEffect(() => {
    // Verificar si el custom element está definido
    if (customElements.get('elevenlabs-convai')) {
      setScriptLoaded(true);
      return;
    }
    
    // Si no está definido, verificar periódicamente
    const interval = setInterval(() => {
      if (customElements.get('elevenlabs-convai')) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    // Limpiar después de 5 segundos si no se carga
    const timeout = setTimeout(() => {
      clearInterval(interval);
      // Intentar de todos modos, puede que funcione
      setScriptLoaded(true);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Establecer atributos cuando el elemento esté listo
  useEffect(() => {
    if (widgetRef.current && agentId && scriptLoaded) {
      const widget = widgetRef.current as any;
      
      // Establecer atributos directamente en el elemento DOM
      widget.setAttribute('agent-id', agentId);
      widget.setAttribute('variant', 'full');
      widget.setAttribute('placement', 'center');
      widget.setAttribute('transcript-enabled', 'true');
      
      // Establecer textos personalizados si están definidos
      if (actionText) widget.setAttribute('action-text', actionText);
      if (startCallText) widget.setAttribute('start-call-text', startCallText);
      if (endCallText) widget.setAttribute('end-call-text', endCallText);
      if (expandText) widget.setAttribute('expand-text', expandText);
      if (listeningText) widget.setAttribute('listening-text', listeningText);
      if (speakingText) widget.setAttribute('speaking-text', speakingText);
    }
  }, [agentId, actionText, startCallText, endCallText, expandText, listeningText, speakingText, scriptLoaded]);

  if (!agentId) return null;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <elevenlabs-convai ref={widgetRef} />;
};

interface SystemConfigTabProps {
  activeBusiness: any;
  hasAssistant: boolean;
  API_BASE_URL: string;
  recepcionistaFormData: {
    ai_prompt: string;
    ai_voice_id: string;
    ai_language: string;
    first_message: string;
    required_fields: (string | { name: string; type: string; label: string })[];
  };
  setRecepcionistaFormData: (data: any) => void;
  availableVoices: any[];
  isLoadingVoices: boolean;
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldType: string;
  setNewFieldType: (type: string) => void;
  isSavingRecepcionista: boolean;
  isCreatingAssistant: boolean;
  setIsCreatingAssistant: (value: boolean) => void;
  recepcionistaError: string;
  setRecepcionistaError: (error: string) => void;
  recepcionistaSuccess: string;
  setRecepcionistaSuccess: (success: string) => void;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
  generateCreateAppointmentTool: () => any;
  updateBusiness: (businessId: string, updates: any) => void;
  elevenlabsService: any;
  apiService: any;
  loadVoicesByLanguage: (language: string) => void;
  updatePromptWithCurrentFields: () => Promise<void>;
  generateFirstMessage: () => void;
}

export default function SystemConfigTab({
  activeBusiness,
  hasAssistant,
  API_BASE_URL,
  recepcionistaFormData,
  setRecepcionistaFormData,
  availableVoices,
  isLoadingVoices,
  newFieldName,
  setNewFieldName,
  newFieldType,
  setNewFieldType,
  isSavingRecepcionista,
  isCreatingAssistant,
  setIsCreatingAssistant,
  recepcionistaError,
  setRecepcionistaError,
  recepcionistaSuccess,
  setRecepcionistaSuccess,
  hasChanges,
  setHasChanges,
  generateCreateAppointmentTool,
  updateBusiness,
  elevenlabsService,
  apiService,
  loadVoicesByLanguage,
  updatePromptWithCurrentFields,
  generateFirstMessage,
}: SystemConfigTabProps) {
  const [isRefreshingBusiness, setIsRefreshingBusiness] = useState(false);
  const { setActiveBusiness, setBusinesses, businesses } = useUserStore();


  // Funciones para manejar campos personalizados
  const handleAddCustomField = () => {
    if (newFieldName.trim() && !recepcionistaFormData.required_fields.includes(newFieldName.trim().toLowerCase())) {
      setRecepcionistaFormData((prev: any) => ({
        ...prev,
        required_fields: [...prev.required_fields, {
          name: newFieldName.trim().toLowerCase(),
          type: newFieldType,
          label: newFieldName.trim()
        }]
      }));
      setNewFieldName('');
      setNewFieldType('text');
      
      // Actualizar el prompt cuando se agregue un campo personalizado
      setTimeout(() => updatePromptWithCurrentFields(), 100);
    }
  };

  const handleRemoveCustomField = (fieldName: string) => {
    setRecepcionistaFormData((prev: any) => ({
      ...prev,
      required_fields: prev.required_fields.filter((field: any) => {
        if (typeof field === 'string') {
          return field !== fieldName;
        } else {
          return field.name !== fieldName;
        }
      })
    }));
    
    // Actualizar el prompt cuando se remueva un campo personalizado
    setTimeout(() => updatePromptWithCurrentFields(), 100);
  };

  const isCustomField = (field: any) => {
    const defaultFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
    if (typeof field === 'string') {
      return !defaultFields.includes(field);
    } else {
      return !defaultFields.includes(field.name);
    }
  };

  const getFieldName = (field: any) => {
    if (typeof field === 'string') {
      return field;
    } else {
      return field.name;
    }
  };

  const getFieldLabel = (field: any) => {
    if (typeof field === 'string') {
      return field;
    } else {
      return field.label || field.name;
    }
  };

  const getFieldType = (field: any) => {
    if (typeof field === 'string') {
      return 'text';
    } else {
      return field.type || 'text';
    }
  };

  // Función para actualizar assistant existente
  const handleUpdateAssistant = async () => {
    if (!hasAssistant || !activeBusiness) return;
    
    setIsCreatingAssistant(true);
    setRecepcionistaError('');
    setRecepcionistaSuccess('');
    
    try {
      // Actualizar el assistant en ElevenLabs
      if (!activeBusiness.assistant?.vapi_assistant_id) {
        throw new Error('No se encontró el ID del assistant en ElevenLabs');
      }
      
      const assistant = await elevenlabsService.updateAssistant(activeBusiness.assistant.vapi_assistant_id, {
        name: `${activeBusiness.name}`,
        prompt: recepcionistaFormData.ai_prompt,
        voice: recepcionistaFormData.ai_voice_id,
        language: recepcionistaFormData.ai_language,
        firstMessage: recepcionistaFormData.first_message,
        required_fields: recepcionistaFormData.required_fields,
        businessId: activeBusiness.id
      });

      // Actualizar el business con la nueva configuración
      const updatedBusiness = await apiService.updateBusiness(activeBusiness.id, {
        ai_prompt: recepcionistaFormData.ai_prompt,
        ai_voice_id: recepcionistaFormData.ai_voice_id,
        ai_language: recepcionistaFormData.ai_language,
      });

      updateBusiness(activeBusiness.id, updatedBusiness as any);
      setHasChanges(false);
      setRecepcionistaSuccess('Asistente de ElevenLabs actualizado exitosamente.');
    } catch (error: any) {
      console.error('Error al actualizar asistente de ElevenLabs:', error);
      setRecepcionistaError(error.message || 'Error al actualizar asistente de ElevenLabs.');
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const handleCreateAssistant = async () => {
    if (!activeBusiness) {
      setRecepcionistaError('No hay negocio activo para crear un asistente.');
      return;
    }
    if (!recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id || !recepcionistaFormData.ai_language) {
      setRecepcionistaError('Por favor, complete el prompt, la voz y el idioma para crear el asistente.');
      return;
    }

    setIsCreatingAssistant(true);
    setRecepcionistaError('');
    setRecepcionistaSuccess('');

    try {
      // Crear assistant en ElevenLabs
      const assistant = await elevenlabsService.createAssistant({
        name: activeBusiness.name,
        prompt: recepcionistaFormData.ai_prompt,
        voice: recepcionistaFormData.ai_voice_id,
        language: recepcionistaFormData.ai_language,
        firstMessage: recepcionistaFormData.first_message,
        businessId: activeBusiness.id,
        tools: [generateCreateAppointmentTool()],
        required_fields: recepcionistaFormData.required_fields
      });

      // Actualizar el business con el nuevo assistant
      if (!assistant.local_assistant) {
        throw new Error('No se pudo crear el assistant local');
      }
      
      const updatedBusiness = await apiService.updateBusiness(activeBusiness.id, {
        assistant_id: assistant.local_assistant.id,
        vapi_assistant_id: assistant.id,
        ai_prompt: recepcionistaFormData.ai_prompt,
        ai_voice_id: recepcionistaFormData.ai_voice_id,
        ai_language: recepcionistaFormData.ai_language,
      });

      updateBusiness(activeBusiness.id, updatedBusiness as any);
      
      // Refrescar el activeBusiness para obtener la relación assistant actualizada
      setIsRefreshingBusiness(true);
      try {
        const refreshedBusiness = await apiService.getBusinessById(activeBusiness.id);
        const updatedBusinesses = businesses.map(b => 
          b.id === activeBusiness.id ? refreshedBusiness as any : b
        );
        setBusinesses(updatedBusinesses);
        setActiveBusiness(refreshedBusiness as any);
      } catch (error) {
        console.error('Error refreshing business:', error);
      } finally {
        setIsRefreshingBusiness(false);
      }
      
      setRecepcionistaSuccess('Asistente de ElevenLabs creado y conectado exitosamente.');
    } catch (error: any) {
      console.error('Error al crear asistente de ElevenLabs:', error);
      setRecepcionistaError(error.message || 'Error al crear asistente de ElevenLabs.');
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const isFieldRequired = (fieldName: string): boolean => {
    const fields = recepcionistaFormData.required_fields;
    if (!Array.isArray(fields)) return false;
    return fields.some(field => 
      typeof field === 'string' ? field === fieldName : field.name === fieldName
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecepcionistaFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));

    // Si cambia el idioma, cargar las voces correspondientes
    if (name === 'ai_language') {
      loadVoicesByLanguage(value);
      // Limpiar la voz seleccionada cuando cambie el idioma
      setRecepcionistaFormData((prev: any) => ({
        ...prev,
        ai_voice_id: ''
      }));
    }
  };

  const handleRequiredFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const fieldName = name.replace('required_', '');
    
    setRecepcionistaFormData((prev: any) => {
      const currentFields = prev.required_fields || [];
      if (checked) {
        return {
          ...prev,
          required_fields: [...currentFields, fieldName]
        };
      } else {
        return {
          ...prev,
          required_fields: currentFields.filter((field: any) => field !== fieldName)
        };
      }
    });

    setTimeout(() => updatePromptWithCurrentFields(), 100);
  };


  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        {!activeBusiness ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tienes negocios</h3>
          </div>
        ) : (
          <React.Fragment key="recepcionista-config">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Mi Recepcionista - {activeBusiness?.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configura el comportamiento de tu recepcionista AI.
            </p>
            
            {/* Mensajes de error y éxito */}
            {recepcionistaError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400">{recepcionistaError}</p>
              </div>
            )}
            {recepcionistaSuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-600 dark:text-green-400">{recepcionistaSuccess}</p>
              </div>
            )}
                
            {/* Estado del Assistant */}
            <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    hasAssistant ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {hasAssistant ? 'Assistant Configurado' : 'Sin Assistant'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {hasAssistant 
                        ? `ID: ${activeBusiness?.assistant_id?.substring(0, 8)}...` 
                        : 'Crea un assistant para comenzar'
                      }
                    </p>
                  </div>
                </div>
                {hasAssistant && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckIcon className="w-4 h-4" />
                    <span>Listo para usar</span>
                  </div>
                )}
              </div>
            </div>
          
            {/* Formulario de configuración directamente aquí */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Prompt */}
              <div className="space-y-4">
                {/* First Message */}
                <div>
                  <label htmlFor="first_message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje de Bienvenida
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="first_message"
                      name="first_message"
                      value={recepcionistaFormData.first_message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      style={{ color: 'inherit' }}
                      placeholder="¡Hola! ¿En qué puedo ayudarte?"
                    />
                    <button
                      type="button"
                      onClick={generateFirstMessage}
                      className="absolute top-2 right-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      Generar
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Primer mensaje que dirá el asistente cuando reciba una llamada.
                  </p>
                </div>

                {/* AI Prompt */}
                <div>
                  <label htmlFor="ai_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comportamiento del Recepcionista
                  </label>
                  <div className="relative">
                    <textarea
                      id="ai_prompt"
                      name="ai_prompt"
                      rows={20}
                      value={recepcionistaFormData.ai_prompt}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      style={{ color: 'inherit' }}
                      placeholder="Define cómo quieres que tu recepcionista AI interactúe con los clientes..."
                    />
                    <button
                      type="button"
                      onClick={updatePromptWithCurrentFields}
                      className="absolute top-2 right-5 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      Generar
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Describe el comportamiento, tono y información que debe proporcionar tu recepcionista.
                  </p>
                </div>
              </div>

              {/* Columna derecha - Configuración */}
              <div className="space-y-6">
                {/* Language Selection */}
                <div>
                  <label htmlFor="ai_language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    id="ai_language"
                    name="ai_language"
                    value={recepcionistaFormData.ai_language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ color: 'inherit' }}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Selecciona el idioma principal para tu recepcionista AI.
                  </p>
                </div>

                {/* Voice Selection */}
                <div>
                  <label htmlFor="ai_voice_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voz del Asistente
                  </label>
                  <select
                    id="ai_voice_id"
                    name="ai_voice_id"
                    value={recepcionistaFormData.ai_voice_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ color: 'inherit' }}
                    disabled={isLoadingVoices}
                  >
                    <option value="">{isLoadingVoices ? 'Cargando voces...' : 'Seleccionar voz...'}</option>
                    {availableVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.gender === 'male' ? 'Masculina' : 'Femenina'} - {voice.provider === 'azure' ? 'Azure' : voice.provider === 'elevenlabs' ? 'ElevenLabs' : 'Vapi'})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Selecciona la voz que utilizará tu recepcionista AI para comunicarse.
                  </p>
                </div>

                {/* Tools Configuration */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configuración de Herramientas</h3>
                  
                  {/* Required Fields for create_appointment */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Campos requeridos para crear citas
                    </label>
                    <div className="space-y-2">
                      {/* Campos predefinidos */}
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            name="required_name"
                            checked={isFieldRequired('name')}
                            onChange={handleRequiredFieldChange}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Nombre</span>
                        </label>
                        <label className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            name="required_email"
                            checked={isFieldRequired('email')}
                            onChange={handleRequiredFieldChange}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email</span>
                        </label>
                        <label className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            name="required_phone"
                            checked={isFieldRequired('phone')}
                            onChange={handleRequiredFieldChange}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Teléfono</span>
                        </label>
                        <label className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            name="required_service"
                            checked={isFieldRequired('service')}
                            onChange={handleRequiredFieldChange}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Servicio</span>
                        </label>
                        <label className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            name="required_date"
                            checked={isFieldRequired('date')}
                            onChange={handleRequiredFieldChange}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Fecha</span>
                        </label>
                        <label className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            name="required_time"
                            checked={isFieldRequired('time')}
                            onChange={handleRequiredFieldChange}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hora</span>
                        </label>
                      </div>
                      
                      {/* Campos personalizados integrados */}
                      {recepcionistaFormData.required_fields?.filter(field => isCustomField(field)).map((field) => (
                        <label key={getFieldName(field)} className="flex items-center p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name={`required_${getFieldName(field)}`}
                              checked={true}
                              onChange={() => handleRemoveCustomField(getFieldName(field))}
                              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{getFieldLabel(field)}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                              {getFieldType(field)}
                            </span>
                          </div>
                        </label>
                      ))}
                      
                      {/* Agregar campo personalizado */}
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              placeholder="Nombre del campo (ej: edad, dirección...)"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                              style={{ color: 'inherit' }}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
                            />
                          </div>
                          <div className="w-20">
                            <select
                              value={newFieldType}
                              onChange={(e) => setNewFieldType(e.target.value)}
                              className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              style={{ color: 'inherit' }}
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="email">Email</option>
                              <option value="phone">Teléfono</option>
                              <option value="date">Fecha</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCustomField}
                            disabled={!newFieldName.trim()}
                            className="px-3 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-medium transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Selecciona qué información debe recopilar el asistente antes de crear una cita.
                    </p>
                  </div>
                </div>

                {/* Información del Plan */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        ¿Cómo funciona nuestro servicio?
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          Nosotros manejamos toda la tecnología de ElevenLabs por ti. Solo necesitas configurar:
                        </p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>El comportamiento de tu recepcionista (prompt)</li>
                          <li>La voz que prefieres</li>
                          <li>El idioma de comunicación</li>
                        </ul>
                        <p className="mt-2 font-medium">
                          Nosotros nos encargamos de crear y mantener tu assistant en ElevenLabs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget de ElevenLabs y Botones según si hay asistente */}
            {hasAssistant ? (
              <>
                {/* Widget de ElevenLabs */}
                <div>
                  {typeof window !== 'undefined' && (
                    <ElevenLabsWidget
                      agentId={activeBusiness?.assistant?.vapi_assistant_id}
                      actionText="Probar tu asistente"
                      startCallText="Empezar conversación"
                      endCallText="Finalizar llamada"
                      expandText="Abrir chat"
                      listeningText="Escuchando..."
                      speakingText="Asistente hablando"
                    />
                  )}
                </div>

                {/* Botón de Actualizar */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center w-full">
                  <button
                    type="button"
                    onClick={handleUpdateAssistant}
                    disabled={isCreatingAssistant || !hasChanges || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id}
                    className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-md ${
                      isCreatingAssistant || !hasChanges || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isCreatingAssistant ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      <>
                        <PencilIcon className="w-4 h-4" />
                        <span>Actualizar Assistant</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Botón de Crear - Solo si NO hay asistente */
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleCreateAssistant}
                  disabled={isCreatingAssistant || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id}
                  className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-md ${
                    isCreatingAssistant || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isCreatingAssistant ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <span>Crear Assistant</span>
                  )}
                </button>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

