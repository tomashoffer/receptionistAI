'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { vapiService, VapiVoice } from '@/services/vapi.service';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import LogoutButton from '@/components/LogoutButton';
import StateSyncer from '@/components/StateSyncer';

export default function SystemConfigPage() {
  const { user, activeBusiness, isLoading, isLoggingOut, updateBusiness } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para obtener el mensaje de loading según la ruta
  const getLoadingMessage = () => {
    if (isLoggingOut) return 'Cerrando sesión...';
    if (pathname?.includes('/system-config')) return 'Cargando mi recepcionista...';
    return 'Cargando...';
  };

  // Estados del formulario
  const [formData, setFormData] = useState<{
    ai_prompt: string;
    ai_voice_id: string;
    ai_language: string;
    vapi_assistant_id: string;
    vapi_public_key: string;
    required_fields: (string | { name: string; type: string; label: string })[];
  }>({
    ai_prompt: '',
    ai_voice_id: '',
    ai_language: 'es',
    vapi_assistant_id: '',
    vapi_public_key: '',
    required_fields: ['name', 'email', 'phone', 'service', 'date', 'time'], // Campos por defecto
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableVoices, setAvailableVoices] = useState<VapiVoice[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  // Cargar datos del business actual
  useEffect(() => {
    const loadBusinessData = async () => {
      if (activeBusiness) {
        // Primero intentar cargar el prompt personalizado desde el backend
        try {
          const response = await fetch(`http://localhost:3001/assistants/business/${activeBusiness.id}/personalized-prompt`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setFormData({
              ai_prompt: activeBusiness.ai_prompt || data.prompt || '',
              ai_voice_id: activeBusiness.ai_voice_id || '',
              ai_language: activeBusiness.ai_language || 'es',
              vapi_assistant_id: activeBusiness.vapi_assistant_id || '',
              vapi_public_key: activeBusiness.vapi_public_key || '',
            });
          } else {
            // Si falla, usar los datos existentes
            setFormData({
              ai_prompt: activeBusiness.ai_prompt || '',
              ai_voice_id: activeBusiness.ai_voice_id || '',
              ai_language: activeBusiness.ai_language || 'es',
              vapi_assistant_id: activeBusiness.vapi_assistant_id || '',
              vapi_public_key: activeBusiness.vapi_public_key || '',
            });
          }
        } catch (error) {
          console.error('Error loading personalized prompt:', error);
          // Si hay error, usar los datos existentes
          setFormData({
            ai_prompt: activeBusiness.ai_prompt || '',
            ai_voice_id: activeBusiness.ai_voice_id || '',
            ai_language: activeBusiness.ai_language || 'es',
            vapi_assistant_id: activeBusiness.vapi_assistant_id || '',
            vapi_public_key: activeBusiness.vapi_public_key || '',
          });
        }
      }
    };
    
    loadBusinessData();
  }, [activeBusiness]);

  // Cargar voces disponibles de VAPI
  useEffect(() => {
    const loadVoicesByLanguage = async (language: string) => {
      setIsLoadingVoices(true);
      try {
        const languageCode = language === 'es' ? 'es-ES' : 'en-US';
        const response = await fetch(`http://localhost:3001/vapi/voices/language/${languageCode}`);
        if (response.ok) {
          const voices = await response.json();
          setAvailableVoices(voices.value || voices);
        } else {
          console.error('Error cargando voces:', response.statusText);
          setAvailableVoices([]);
        }
      } catch (error) {
        console.error('Error cargando voces:', error);
        setAvailableVoices([]);
      } finally {
        setIsLoadingVoices(false);
      }
    };

    loadVoicesByLanguage(formData.ai_language);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia el idioma, cargar las voces correspondientes
    if (name === 'ai_language') {
      const loadVoicesByLanguage = async (language: string) => {
        setIsLoadingVoices(true);
        try {
          const languageCode = language === 'es' ? 'es-ES' : 'en-US';
          const response = await fetch(`http://localhost:3001/vapi/voices/language/${languageCode}`);
          if (response.ok) {
            const voices = await response.json();
            setAvailableVoices(voices.value || voices);
          } else {
            console.error('Error cargando voces:', response.statusText);
            setAvailableVoices([]);
          }
        } catch (error) {
          console.error('Error cargando voces:', error);
          setAvailableVoices([]);
        } finally {
          setIsLoadingVoices(false);
        }
      };
      
      loadVoicesByLanguage(value);
      // Limpiar la voz seleccionada cuando cambie el idioma
      setFormData(prev => ({
        ...prev,
        ai_voice_id: ''
      }));
    }
  };

  // Función para actualizar el prompt con los campos actuales
  const updatePromptWithCurrentFields = async () => {
    if (!activeBusiness) return;
    
    try {
      const response = await fetch(`http://localhost:3001/assistants/business/${activeBusiness.id}/personalized-prompt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          required_fields: formData.required_fields || ['name', 'email', 'phone', 'service', 'date', 'time']
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ai_prompt: data.prompt
        }));
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleRequiredFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const fieldName = name.replace('required_', ''); // Quitar el prefijo "required_"
    
    setFormData(prev => {
      const currentFields = prev.required_fields || [];
      if (checked) {
        // Agregar el campo si no está presente
        return {
          ...prev,
          required_fields: [...currentFields, fieldName]
        };
      } else {
        // Remover el campo si está presente
        return {
          ...prev,
          required_fields: currentFields.filter(field => field !== fieldName)
        };
      }
    });
  };

  // Funciones para manejar campos personalizados
  const handleAddCustomField = () => {
    if (newFieldName.trim() && !formData.required_fields.includes(newFieldName.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        required_fields: [...prev.required_fields, {
          name: newFieldName.trim().toLowerCase(),
          type: newFieldType,
          label: newFieldName.trim()
        }]
      }));
      setNewFieldName('');
      setNewFieldType('text');
    }
  };

  const handleRemoveCustomField = (fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      required_fields: prev.required_fields.filter(field => {
        if (typeof field === 'string') {
          return field !== fieldName;
        } else {
          return field.name !== fieldName;
        }
      })
    }));
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

  const handleSave = async () => {
    if (!activeBusiness) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateBusiness(activeBusiness.id, formData);
      setSuccess('Configuración guardada exitosamente');
      
      // Actualizar el business en el store
      updateBusiness(activeBusiness.id, formData);
      
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setError('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAssistant = async () => {
    if (!activeBusiness) {
      setError('No hay negocio activo para crear un asistente.');
      return;
    }
    if (!formData.ai_prompt || !formData.ai_voice_id || !formData.ai_language) {
      setError('Por favor, complete el prompt, la voz y el idioma para crear el asistente.');
      return;
    }

    setIsCreatingAssistant(true);
    setError('');
    setSuccess('');

    try {
      // Crear assistant en VAPI
      const assistant = await vapiService.createAssistant({
        name: activeBusiness.name,
        prompt: formData.ai_prompt,
        voice: formData.ai_voice_id,
        language: formData.ai_language,
        businessId: activeBusiness.id,
      });

      // Actualizar el business con el nuevo assistant
      const updatedBusiness = await apiService.updateBusiness(activeBusiness.id, {
        vapi_assistant_id: assistant.id,
        ai_prompt: formData.ai_prompt,
        ai_voice_id: formData.ai_voice_id,
        ai_language: formData.ai_language,
      });

      updateBusiness(activeBusiness.id, updatedBusiness);
      setFormData(prev => ({ ...prev, vapi_assistant_id: assistant.id }));
      setSuccess('Asistente VAPI creado y conectado exitosamente.');
    } catch (error: any) {
      console.error('Error al crear asistente VAPI:', error);
      setError(error.message || 'Error al crear asistente VAPI.');
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Resumen', action: () => router.push('/dashboard?tab=overview') },
    { id: 'businesses', label: 'Mis Negocios', action: () => router.push('/dashboard?tab=businesses') },
    { id: 'calls', label: 'Llamadas', action: () => router.push('/dashboard?tab=calls') },
    { id: 'system-config', label: 'Mi Recepcionista', action: () => {} },
    { id: 'account-config', label: 'Configuración de Mi Cuenta', action: () => router.push('/dashboard/account-config') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{getLoadingMessage()}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>No autorizado</div>;
  }

  if (!activeBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay negocio activo</h2>
          <p className="text-gray-600 mb-4">Por favor, selecciona un negocio para configurar tu recepcionista AI.</p>
          <button
            onClick={() => router.push('/dashboard?tab=businesses')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Ir a Mis Negocios
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <StateSyncer />
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:shadow-lg transition-shadow lg:hidden"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <span className="sr-only">Cerrar menú</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-4">
            <div className="px-2 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                    item.id === 'system-config'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-4">
                <div onClick={() => setIsMenuOpen(false)}>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="px-6 py-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Mi Recepcionista - {activeBusiness?.name}
              </h1>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600">{success}</p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Configuración del Recepcionista AI
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda - Prompt */}
                    <div className="space-y-4">
                      {/* AI Prompt */}
                      <div>
                        <label htmlFor="ai_prompt" className="block text-sm font-medium text-gray-700 mb-2">
                          Prompt del Asistente
                        </label>
                        <div className="relative">
                          <textarea
                            id="ai_prompt"
                            name="ai_prompt"
                            rows={20}
                            value={formData.ai_prompt}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black resize-none"
                            placeholder="Escribe aquí el prompt que definirá el comportamiento de tu recepcionista AI..."
                          />
                          <button
                            type="button"
                            onClick={updatePromptWithCurrentFields}
                            className="absolute top-3 right-3 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          >
                            Generar Prompt
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Define cómo debe comportarse tu recepcionista AI, qué información puede proporcionar y cómo debe interactuar con los clientes.
                        </p>
                      </div>
                    </div>

                    {/* Columna derecha - Configuración */}
                    <div className="space-y-6">

                    {/* Language */}
                    <div>
                      <label htmlFor="ai_language" className="block text-sm font-medium text-gray-700 mb-2">
                        Idioma
                      </label>
                      <select
                        id="ai_language"
                        name="ai_language"
                        value={formData.ai_language}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    {/* Voice Selection */}
                    <div>
                      <label htmlFor="ai_voice_id" className="block text-sm font-medium text-gray-700 mb-2">
                        Voz del Asistente
                      </label>
                      <select
                        id="ai_voice_id"
                        name="ai_voice_id"
                        value={formData.ai_voice_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        disabled={isLoadingVoices}
                      >
                        <option value="">{isLoadingVoices ? 'Cargando voces...' : 'Seleccionar voz...'}</option>
                        {availableVoices.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} ({voice.gender === 'male' ? 'Masculina' : 'Femenina'})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Selecciona la voz que utilizará tu recepcionista AI para comunicarse.
                      </p>
                    </div>

                    {/* Tools Configuration */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Herramientas</h3>
                      
                      {/* Required Fields for create_appointment */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Campos requeridos para crear citas
                        </label>
                      <div className="space-y-2">
                        {/* Campos predefinidos */}
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_name"
                              checked={formData.required_fields?.some(field => 
                                typeof field === 'string' ? field === 'name' : field.name === 'name'
                              ) || false}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Nombre</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_email"
                              checked={formData.required_fields?.some(field => 
                                typeof field === 'string' ? field === 'email' : field.name === 'email'
                              ) || false}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Email</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_phone"
                              checked={formData.required_fields?.some(field => 
                                typeof field === 'string' ? field === 'phone' : field.name === 'phone'
                              ) || false}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Teléfono</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_service"
                              checked={formData.required_fields?.some(field => 
                                typeof field === 'string' ? field === 'service' : field.name === 'service'
                              ) || false}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Servicio</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_date"
                              checked={formData.required_fields?.some(field => 
                                typeof field === 'string' ? field === 'date' : field.name === 'date'
                              ) || false}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Fecha</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_time"
                              checked={formData.required_fields?.some(field => 
                                typeof field === 'string' ? field === 'time' : field.name === 'time'
                              ) || false}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Hora</span>
                          </label>
                        </div>
                        
                        {/* Campos personalizados integrados */}
                        {formData.required_fields?.filter(field => isCustomField(field)).map((field) => (
                          <div key={getFieldName(field)} className="flex items-center justify-between p-1 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                name={`required_${getFieldName(field)}`}
                                checked={true}
                                onChange={() => handleRemoveCustomField(getFieldName(field))}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              />
                              <span className="text-sm font-medium text-gray-800 capitalize">{getFieldLabel(field)}</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                                {getFieldType(field)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomField(getFieldName(field))}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors"
                              title="Eliminar campo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        
                        {/* Agregar campo personalizado */}
                        <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                          <div className="flex space-x-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                placeholder="Nombre del campo (ej: edad, dirección...)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
                              />
                            </div>
                            <div className="w-20">
                              <select
                                value={newFieldType}
                                onChange={(e) => setNewFieldType(e.target.value)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-sm"
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
                              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Selecciona qué información debe recopilar el asistente antes de crear una cita.
                        </p>
                      </div>
                    </div>

                    {/* Información del Plan */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            ¿Cómo funciona nuestro servicio?
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Nosotros manejamos toda la tecnología de VAPI por ti. Solo necesitas configurar:
                            </p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              <li>El comportamiento de tu recepcionista (prompt)</li>
                              <li>La voz que prefieres</li>
                              <li>El idioma de comunicación</li>
                            </ul>
                            <p className="mt-2 font-medium">
                              Nosotros nos encargamos de crear y mantener tu assistant en VAPI.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VAPI Configuration - Hidden from user (managed by our platform) */}
                    <div className="hidden">
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-md font-semibold text-gray-900 mb-4">
                          Configuración de VAPI
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="vapi_assistant_id" className="block text-sm font-medium text-gray-700 mb-2">
                              VAPI Assistant ID
                            </label>
                            <input
                              type="text"
                              id="vapi_assistant_id"
                              name="vapi_assistant_id"
                              value={formData.vapi_assistant_id}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                              placeholder="ID del assistant en VAPI"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              ID del assistant creado en VAPI (se generará automáticamente).
                            </p>
                          </div>

                          <div>
                            <label htmlFor="vapi_public_key" className="block text-sm font-medium text-gray-700 mb-2">
                              VAPI Public Key
                            </label>
                            <input
                              type="text"
                              id="vapi_public_key"
                              name="vapi_public_key"
                              value={formData.vapi_public_key}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                              placeholder="Clave pública de VAPI"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Clave pública para autenticar con VAPI.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-center gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => router.push('/dashboard?tab=businesses')}
                    className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${
                      isSaving
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Configuración</span>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCreateAssistant}
                    disabled={isCreatingAssistant || !formData.ai_prompt || !formData.ai_voice_id}
                    className={`px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${
                      isCreatingAssistant || !formData.ai_prompt || !formData.ai_voice_id
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
                      <span>Crear Assistant en VAPI</span>
                    )}
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
