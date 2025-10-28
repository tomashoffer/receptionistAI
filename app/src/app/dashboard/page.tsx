'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { elevenlabsService } from '@/services/vapi.service';
import { useRouter, usePathname } from 'next/navigation';
import { PlusIcon, CheckIcon, PencilIcon, Bars3Icon, PhoneIcon } from '@heroicons/react/24/outline';
import LogoutButton from '@/components/LogoutButton';
import ElevenLabsCallModal from '@/components/reusable/ElevenLabsCallModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DashboardPage() {
  const { user, businesses, activeBusiness, isLoading, isLoggingOut, setActiveBusiness, setBusinesses, reset, updateBusiness } = useUserStore();
  const pathname = usePathname();
  
  // Función para obtener el mensaje de loading según la ruta
  const getLoadingMessage = () => {
    if (isLoggingOut) return 'Cerrando sesión...';
    if (pathname?.includes('/dashboard')) return 'Cargando dashboard...';
    if (pathname?.includes('/test-assistant')) return 'Cargando test assistant...';
    if (pathname?.includes('/account-config')) return 'Cargando configuración...';
    return 'Cargando...';
  };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone_number: '',
    industry: 'other',
    email: '',
    website: '',
    address: '',
    description: '',
    rubro: '',
  });

  // Estados para configuración del recepcionista
  const [recepcionistaFormData, setRecepcionistaFormData] = useState<{
    ai_prompt: string;
    ai_voice_id: string;
    ai_language: string;
    first_message: string;
    required_fields: (string | { name: string; type: string; label: string })[];
  }>({
    ai_prompt: '',
    ai_voice_id: '',
    ai_language: 'es',
    first_message: '¡Hola! ¿En qué puedo ayudarte?',
    required_fields: ['name', 'email', 'phone', 'service', 'date', 'time'], // Campos por defecto
  });
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [isRefreshingBusiness, setIsRefreshingBusiness] = useState(false);
  const [newFieldType, setNewFieldType] = useState('text');
  const [isSavingRecepcionista, setIsSavingRecepcionista] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [recepcionistaError, setRecepcionistaError] = useState('');
  const [recepcionistaSuccess, setRecepcionistaSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Función para detectar cambios en la configuración
  const checkForChanges = () => {
    if (!activeBusiness?.assistant) {
      setHasChanges(false);
      return;
    }

    const assistant = activeBusiness.assistant;
    const hasPromptChanged = recepcionistaFormData.ai_prompt !== (assistant.prompt || '');
    const hasVoiceChanged = recepcionistaFormData.ai_voice_id !== (assistant.voice_id || '');
    const hasLanguageChanged = recepcionistaFormData.ai_language !== (assistant.language || 'es');
    const hasFirstMessageChanged = recepcionistaFormData.first_message !== (assistant.first_message || '¡Hola! ¿En qué puedo ayudarte?');
    
    // Comparar required_fields
    const currentFields = recepcionistaFormData.required_fields || [];
    const originalFields = assistant.required_fields || [];
    const hasFieldsChanged = JSON.stringify(currentFields) !== JSON.stringify(originalFields);

    const hasAnyChanges = hasPromptChanged || hasVoiceChanged || hasLanguageChanged || hasFirstMessageChanged || hasFieldsChanged;
    setHasChanges(hasAnyChanges);
  };
  const [showTestAssistantModal, setShowTestAssistantModal] = useState(false);

  // Helper function para determinar si hay assistant (usando solo store global)
  const hasAssistant = !!activeBusiness?.assistant_id;

  // Helper function para obtener el token de autenticación
  const getAuthToken = async () => {
    const token = apiService.getCurrentToken();
    console.log('🔑 DEBUG - Current token:', token);
    if (!token) {
      console.log('🔑 DEBUG - No token, initializing...');
      await apiService.initializeToken();
      const newToken = apiService.getCurrentToken();
      console.log('🔑 DEBUG - New token:', newToken);
      return newToken;
    }
    return token;
  };

  // Cargar datos del business activo en el formulario del recepcionista
  useEffect(() => {
    const loadBusinessData = async () => {
      if (activeBusiness) {
        // Primero intentar cargar el prompt personalizado desde el backend
        try {
          const token = await getAuthToken();
          const response = await fetch(`${API_BASE_URL}/assistants/business/${activeBusiness.id}/personalized-prompt`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              required_fields: recepcionistaFormData.required_fields || ['name', 'email', 'phone', 'service', 'date', 'time']
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setRecepcionistaFormData({
              ai_prompt: activeBusiness.assistant?.prompt || data.prompt || '',
              ai_voice_id: activeBusiness.assistant?.voice_id || '',
              ai_language: activeBusiness.assistant?.language || 'es',
              first_message: activeBusiness.assistant?.first_message || '¡Hola! ¿En qué puedo ayudarte?',
              required_fields: Array.isArray(activeBusiness.assistant?.required_fields) 
                ? activeBusiness.assistant.required_fields 
                : ['name', 'email', 'phone', 'service', 'date', 'time'], // Campos por defecto
            });
          } else {
            // Si falla, usar los datos existentes
            setRecepcionistaFormData({
              ai_prompt: activeBusiness.assistant?.prompt || '',
              ai_voice_id: activeBusiness.assistant?.voice_id || '',
              ai_language: activeBusiness.assistant?.language || 'es',
              first_message: activeBusiness.assistant?.first_message || '¡Hola! ¿En qué puedo ayudarte?',
              required_fields: Array.isArray(activeBusiness.assistant?.required_fields) 
                ? activeBusiness.assistant.required_fields 
                : ['name', 'email', 'phone', 'service', 'date', 'time'],
            });
            
            // Verificar cambios después de cargar los datos
            setTimeout(() => checkForChanges(), 100);
          }
        } catch (error) {
          console.error('Error loading personalized prompt:', error);
          // Si hay error, usar los datos existentes
          setRecepcionistaFormData({
            ai_prompt: activeBusiness.assistant?.prompt || '',
            ai_voice_id: activeBusiness.assistant?.voice_id || '',
            ai_language: activeBusiness.assistant?.language || 'es',
            first_message: activeBusiness.assistant?.first_message || '¡Hola! ¿En qué puedo ayudarte?',
            required_fields: Array.isArray(activeBusiness.assistant?.required_fields) 
              ? activeBusiness.assistant.required_fields 
              : ['name', 'email', 'phone', 'service', 'date', 'time'],
          });
        }
      }
    };
    
    loadBusinessData();
  }, [activeBusiness]);

  // Cargar voces iniciales cuando se carga el componente
  useEffect(() => {
    loadVoicesByLanguage(recepcionistaFormData.ai_language);
  }, []);

  const handleSetActiveBusiness = async (businessId: string) => {
    const selectedBusiness = businesses.find((b: any) => b.id === businessId);
    if (selectedBusiness) {
      // Si el business ya tiene la relación assistant, usarlo directamente
      if (selectedBusiness.assistant) {
        setActiveBusiness(selectedBusiness);
      } else {
        // Si no tiene la relación assistant, hacer fetch completo
        try {
          const fullBusiness = await apiService.getBusinessById(businessId);
          setActiveBusiness(fullBusiness as any);
          
          // También actualizar el business en el array
          const updatedBusinesses = businesses.map(b => 
            b.id === businessId ? fullBusiness as any : b
          );
          setBusinesses(updatedBusinesses);
        } catch (error) {
          console.error('Error fetching business:', error);
          // Fallback al business sin relación
          setActiveBusiness(selectedBusiness);
        }
      }
    }
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);
    setEditFormData({
      name: business.name || '',
      phone_number: business.phone_number || '',
      industry: business.industry || 'other',
      email: business.email || '',
      website: business.website || '',
      address: business.address || '',
      description: business.description || '',
      rubro: business.rubro || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBusiness) return;
    
    try {
      const { apiService } = await import('@/services/api.service');
      const updatedBusiness = await apiService.updateBusiness(editingBusiness.id, editFormData);
      
      // Actualizar el estado local
      updateBusiness(editingBusiness.id, updatedBusiness as any);
      
      // Si es el negocio activo, actualizarlo también
      if (activeBusiness?.id === editingBusiness.id) {
        setActiveBusiness({ ...(activeBusiness as any), ...(updatedBusiness as any) });
      }
      
      setEditingBusiness(null);
    } catch (error) {
      console.error('Error actualizando negocio:', error);
      alert('Error al actualizar el negocio. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBusiness(null);
    setEditFormData({
      name: '',
      phone_number: '',
      industry: 'other',
      email: '',
      website: '',
      address: '',
      description: '',
      rubro: '',
    });
  };

  // Helper function para verificar si un campo está en required_fields
  const isFieldRequired = (fieldName: string): boolean => {
    const fields = recepcionistaFormData.required_fields;
    if (!Array.isArray(fields)) return false;
    return fields.some(field => 
      typeof field === 'string' ? field === fieldName : field.name === fieldName
    );
  };

  // Helper function para generar la tool create_appointment
  const generateCreateAppointmentTool = () => {
    const requiredFields = recepcionistaFormData.required_fields || [];
    
    // Campos base siempre requeridos
    const baseFields = {
      name: { type: 'string', description: 'Nombre completo del cliente' },
      email: { type: 'string', description: 'Email del cliente' },
      phone: { type: 'string', description: 'Teléfono del cliente' },
      service: { type: 'string', description: 'Tipo de servicio solicitado' },
      date: { type: 'string', description: 'Fecha preferida para la cita' },
      time: { type: 'string', description: 'Hora preferida para la cita' }
    };

    // Agregar campos personalizados
    const customFields: { [key: string]: { type: string; description: string } } = {};
    requiredFields.forEach(field => {
      if (typeof field === 'object' && field.name && field.type) {
        customFields[field.name] = {
          type: field.type,
          description: field.label || field.name
        };
      }
    });

    // Combinar todos los campos
    const allFields = { ...baseFields, ...customFields };

    // Crear un nombre limpio para la empresa (sin caracteres especiales)
    const cleanBusinessName = activeBusiness?.name
      ?.replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .toLowerCase() || 'unknown';

    return {
      name: `create_appointment_${cleanBusinessName}`,
      description: 'Crea una nueva cita con la información del cliente',
      parameters: {
        type: 'object',
        properties: allFields,
        required: Object.keys(allFields)
      },
      webhook_url: 'https://ontogenetic-janene-accommodational.ngrok-free.dev/webhook-test/vapi-appointment',
      enabled: true
    };
  };

  // Funciones para el recepcionista
  const handleRecepcionistaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecepcionistaFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Verificar cambios después de actualizar los datos
    setTimeout(() => checkForChanges(), 100);

    // Si cambia el idioma, cargar las voces correspondientes
    if (name === 'ai_language') {
      loadVoicesByLanguage(value);
      // Limpiar la voz seleccionada cuando cambie el idioma
      setRecepcionistaFormData(prev => ({
        ...prev,
        ai_voice_id: ''
      }));
    }
  };

  const handleRequiredFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const fieldName = name.replace('required_', ''); // Quitar el prefijo "required_"
    
    setRecepcionistaFormData(prev => {
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

    // Marcar que hay cambios si ya existe un assistant
    if (hasAssistant) {
      setHasChanges(true);
    }

    // Actualizar el prompt cuando cambien los campos requeridos
    setTimeout(() => updatePromptWithCurrentFields(), 100);
  };

  // Función para generar mensaje de bienvenida dinámico
  const generateFirstMessage = () => {
    if (!activeBusiness) return;
    
    const businessName = activeBusiness.name;
    const industry = activeBusiness.industry;
    const language = recepcionistaFormData.ai_language;
    
    // Mensajes por industria en español
    const spanishMessages = {
      restaurant: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte a reservar tu mesa. ¿En qué puedo ayudarte hoy? ¿Te gustaría hacer una reservación?`,
      healthcare: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte a agendar tu cita médica. ¿En qué puedo ayudarte hoy? ¿Te gustaría agendar una consulta?`,
      beauty: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte a reservar tu cita de belleza. ¿En qué puedo ayudarte hoy? ¿Te gustaría agendar un servicio?`,
      fitness: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte a reservar tu clase o entrenamiento. ¿En qué puedo ayudarte hoy? ¿Te gustaría agendar una sesión?`,
      professional: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte a agendar tu consulta profesional. ¿En qué puedo ayudarte hoy? ¿Te gustaría programar una reunión?`,
      retail: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte con información sobre nuestros productos y servicios. ¿En qué puedo ayudarte hoy?`,
      commerce: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte con información sobre nuestros productos y servicios. ¿En qué puedo ayudarte hoy?`,
      other: `¡Hola! Soy ${businessName}, tu recepcionista AI. Estoy aquí para ayudarte con información sobre nuestros servicios. ¿En qué puedo ayudarte hoy?`
    };
    
    // Mensajes por industria en inglés
    const englishMessages = {
      restaurant: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you make a reservation. How can I assist you today? Would you like to book a table?`,
      healthcare: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you schedule your medical appointment. How can I assist you today? Would you like to book a consultation?`,
      beauty: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you book your beauty appointment. How can I assist you today? Would you like to schedule a service?`,
      fitness: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you book your class or training session. How can I assist you today? Would you like to schedule a session?`,
      professional: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you schedule your professional consultation. How can I assist you today? Would you like to book a meeting?`,
      retail: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you with information about our products and services. How can I assist you today?`,
      commerce: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you with information about our products and services. How can I assist you today?`,
      other: `Hello! I'm ${businessName}, your AI receptionist. I'm here to help you with information about our services. How can I assist you today?`
    };
    
    const messages = language === 'es' ? spanishMessages : englishMessages;
    const generatedMessage = messages[industry as keyof typeof messages] || messages.other;
    
    setRecepcionistaFormData(prev => ({
      ...prev,
      first_message: generatedMessage
    }));
  };

  // Función para actualizar el prompt con los campos actuales
  const updatePromptWithCurrentFields = async () => {
    if (!activeBusiness) return;
    
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/assistants/business/${activeBusiness.id}/personalized-prompt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          required_fields: recepcionistaFormData.required_fields || ['name', 'email', 'phone', 'service', 'date', 'time']
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecepcionistaFormData(prev => ({
          ...prev,
          ai_prompt: data.prompt
        }));
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  // Función para cargar voces según el idioma
  const loadVoicesByLanguage = async (language: string) => {
    setIsLoadingVoices(true);
    try {
      const languageCode = language === 'es' ? 'es-ES' : 'en-US';
      const response = await fetch(`${API_BASE_URL}/elevenlabs/voices/language/${languageCode}`);
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

  // Funciones para manejar campos personalizados
  const handleAddCustomField = () => {
    if (newFieldName.trim() && !recepcionistaFormData.required_fields.includes(newFieldName.trim().toLowerCase())) {
      setRecepcionistaFormData(prev => ({
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
    setRecepcionistaFormData(prev => ({
      ...prev,
      required_fields: prev.required_fields.filter(field => {
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

  const handleSaveRecepcionista = async () => {
    if (!activeBusiness) {
      setRecepcionistaError('No hay negocio activo para configurar.');
      return;
    }

    setIsSavingRecepcionista(true);
    setRecepcionistaError('');
    setRecepcionistaSuccess('');

    try {
      await apiService.updateBusiness(activeBusiness.id, recepcionistaFormData);
      updateBusiness(activeBusiness.id, recepcionistaFormData as any);
      setRecepcionistaSuccess('Configuración guardada exitosamente.');
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      setRecepcionistaError('Error al guardar la configuración.');
    } finally {
      setIsSavingRecepcionista(false);
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
        name: `${activeBusiness.name} - Recepcionista AI`,
        prompt: recepcionistaFormData.ai_prompt,
        voice: recepcionistaFormData.ai_voice_id,
        language: recepcionistaFormData.ai_language,
        firstMessage: recepcionistaFormData.first_message,
        tools: [generateCreateAppointmentTool()],
        required_fields: recepcionistaFormData.required_fields
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
    console.log('🚀 DEBUG - Starting handleCreateAssistant');
    console.log('🚀 DEBUG - ActiveBusiness:', activeBusiness);
    
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
      
      console.log('🚀 DEBUG - Assistant created:', assistant);
      console.log('🚀 DEBUG - Local assistant:', assistant.local_assistant);
      console.log('🚀 DEBUG - ElevenLabs assistant ID:', assistant.id);
      
      const updatedBusiness = await apiService.updateBusiness(activeBusiness.id, {
        assistant_id: assistant.local_assistant.id, // ✅ Usar el ID del assistant local
        vapi_assistant_id: assistant.id, // ✅ ID de ElevenLabs (guardado en campo vapi_assistant_id por compatibilidad)
        ai_prompt: recepcionistaFormData.ai_prompt,
        ai_voice_id: recepcionistaFormData.ai_voice_id,
        ai_language: recepcionistaFormData.ai_language,
      });

      console.log('🚀 DEBUG - Updated business:', updatedBusiness);
      console.log('🚀 DEBUG - Calling updateBusiness with:', {
        businessId: activeBusiness.id,
        updates: updatedBusiness
      });
      updateBusiness(activeBusiness.id, updatedBusiness as any);
      
      // Refrescar el activeBusiness para obtener la relación assistant actualizada
      setIsRefreshingBusiness(true);
      try {
        console.log('🚀 DEBUG - Starting business refresh...');
        const refreshedBusiness = await apiService.getBusinessById(activeBusiness.id);
        
        console.log('🔍 DEBUG - Refreshed Business:', refreshedBusiness);
        console.log('🔍 DEBUG - Assistant relation:', (refreshedBusiness as any).assistant);
        console.log('🔍 DEBUG - Vapi Assistant ID:', (refreshedBusiness as any).assistant?.vapi_assistant_id);
        console.log('🔍 DEBUG - Assistant ID type:', typeof (refreshedBusiness as any).assistant?.vapi_assistant_id);
        console.log('🔍 DEBUG - Assistant ID value:', JSON.stringify((refreshedBusiness as any).assistant?.vapi_assistant_id));
        
        // Actualizar el estado usando los métodos del UserStore
        console.log('🚀 DEBUG - Updating businesses array...');
        const currentBusinesses = businesses;
        const updatedBusinesses = currentBusinesses.map(b => 
          b.id === activeBusiness.id ? refreshedBusiness as any : b
        );
        setBusinesses(updatedBusinesses);
        
        console.log('🚀 DEBUG - Setting active business...');
        setActiveBusiness(refreshedBusiness as any);
        
        console.log('🚀 DEBUG - Business refresh completed successfully');
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

  const handleTestAssistant = () => {
    if (!activeBusiness?.assistant?.vapi_assistant_id) {
      setRecepcionistaError('⚠️ Primero debes crear un assistant en ElevenLabs. Completa el prompt, selecciona una voz y haz click en "Crear Assistant en ElevenLabs".');
      return;
    }
    setShowTestAssistantModal(true);
  };

  const menuItems = [
    { id: 'overview', label: 'Resumen', action: () => setActiveTab('overview') },
    { id: 'businesses', label: 'Mis Negocios', action: () => setActiveTab('businesses') },
    { id: 'calls', label: 'Llamadas', action: () => setActiveTab('calls') },
    { id: 'system-config', label: 'Mi Recepcionista', action: () => setActiveTab('system-config') },
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

  if (!activeBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex relative">
        {/* Overlay para cerrar el menú */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${isMenuOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-white shadow-lg relative z-20`}>
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">Menú</h2>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                    activeTab === item.id
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
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="lg:hidden mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Hola, {user?.email}</span>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                  {/* Empty State */}
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes negocios</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer negocio para usar el asistente de voz.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/dashboard/business/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agregar Business
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Overlay para cerrar el menú */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMenuOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-white shadow-lg relative z-20`}>
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Menú</h2>
          </div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === item.id
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 hover:text-gray-900 p-2"
                  title="Menú"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                    {activeBusiness.name}
              </h1>
              <p className="text-gray-600">
                    {activeBusiness.industry} • {activeBusiness.phone_number}
              </p>
            </div>
                
                {/* Selector de Negocio */}
                {businesses.length > 1 && (
                  <div className="ml-6">
                    <select
                      value={activeBusiness.id}
                      onChange={(e) => handleSetActiveBusiness(e.target.value)}
                      className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {businesses.map((business: any) => (
                        <option key={business.id} value={business.id}>
                          {business.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.first_name} {user?.last_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Estado del Negocio
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 capitalize">
                            {activeBusiness.status}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📞</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Número de Teléfono
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {activeBusiness.phone_number}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🤖</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            AI Configurado
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {hasAssistant ? 'Configurado' : 'No configurado'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Configuración Actual del AI
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prompt del AI
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          {activeBusiness.assistant?.prompt ? 
                            `${activeBusiness.assistant.prompt.substring(0, 100)}${activeBusiness.assistant.prompt.length > 100 ? '...' : ''}` : 
                            'No configurado'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Voz
                        </label>
                        <p className="mt-1 text-sm text-gray-600">
                          {activeBusiness.assistant?.voice_id ? 
                            (() => {
                              // Extraer el nombre de la voz del ID
                              const voiceName = activeBusiness.assistant.voice_id.includes('Alvaro') ? 'Álvaro (Masculina)' :
                                               activeBusiness.assistant.voice_id.includes('Esperanza') ? 'Esperanza (Femenina)' :
                                               activeBusiness.assistant.voice_id.includes('Hana') ? 'Hana (Femenina)' :
                                               activeBusiness.assistant.voice_id;
                              return voiceName;
                            })() : 
                            'No configurado'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Idioma
                        </label>
                        <p className="mt-1 text-sm text-gray-600">
                          {activeBusiness.assistant?.language ? 
                            (activeBusiness.assistant.language === 'es' ? 'Español' : 
                             activeBusiness.assistant.language === 'en' ? 'Inglés' : 
                             activeBusiness.assistant.language) : 
                            'No configurado'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Test Assistant
                </h3>
                <p className="text-gray-600 mb-6">
                  Prueba tu recepcionista AI antes de activarlo para llamadas reales.
                </p>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowTestAssistantModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
                  >
                    Abrir Test Assistant
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Historial de Llamadas
                </h3>
                <p className="text-gray-600">
                  Aquí verás el historial de llamadas atendidas por tu AI.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'businesses' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl leading-6 font-medium text-gray-900">
                      Mis Negocios
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Gestiona todos tus negocios desde aquí.
                    </p>
                  </div>
            <button
              onClick={() => router.push('/dashboard/business/new')}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
              title="Crear Nuevo Negocio"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {businesses.map((business: any) => (
                    <div key={business.id} className={`border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                      business.id === activeBusiness.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-medium text-gray-900">{business.name}</h4>
                            {business.id === activeBusiness.id && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                Activo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{business.industry} • {business.phone_number}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            business.status === 'active' ? 'bg-green-100 text-green-800' : 
                            business.status === 'trial' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {business.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {business.id !== activeBusiness.id && (
                            <button
                              onClick={() => handleSetActiveBusiness(business.id)}
                              className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
                              title="Activar"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditBusiness(business)}
                            className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system-config' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {!activeBusiness ? (
                  // Estado vacío cuando no hay business
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes negocios</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer negocio para usar el asistente de voz.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/dashboard/business/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agregar Business
                      </button>
                    </div>
                  </div>
                ) : (
                  // Contenido normal cuando hay business
                  <>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Mi Recepcionista - {activeBusiness?.name}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Configura el comportamiento de tu recepcionista AI.
                    </p>
                    
                    {/* Mensajes de error y éxito */}
                    {recepcionistaError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600">{recepcionistaError}</p>
                      </div>
                    )}
                    {recepcionistaSuccess && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-600">{recepcionistaSuccess}</p>
                      </div>
                    )}
                    
                    {/* Estado del Assistant */}
                    <div className="mb-6 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            hasAssistant ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {hasAssistant ? 'Assistant Configurado' : 'Sin Assistant'}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {hasAssistant 
                                ? `ID: ${activeBusiness?.assistant_id?.substring(0, 8)}...` 
                                : 'Crea un assistant para comenzar'
                              }
                            </p>
                          </div>
                        </div>
                        {hasAssistant && (
                          <div className="flex items-center space-x-2 text-sm text-green-600">
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
                          <label htmlFor="first_message" className="block text-sm font-medium text-gray-700 mb-2">
                            Mensaje de Bienvenida
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="first_message"
                              name="first_message"
                              value={recepcionistaFormData.first_message}
                              onChange={handleRecepcionistaInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                              placeholder="¡Hola! ¿En qué puedo ayudarte?"
                            />
                            <button
                              type="button"
                              onClick={generateFirstMessage}
                              className="absolute top-2 right-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                              Generar
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Primer mensaje que dirá el asistente cuando reciba una llamada.
                          </p>
                        </div>
                        {/* AI Prompt */}
                        <div>
                          <label htmlFor="ai_prompt" className="block text-sm font-medium text-gray-700 mb-2">
                            Comportamiento del Recepcionista
                          </label>
                          <div className="relative">
                            <textarea
                              id="ai_prompt"
                              name="ai_prompt"
                              rows={20}
                              value={recepcionistaFormData.ai_prompt}
                              onChange={handleRecepcionistaInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black resize-none"
                              placeholder="Define cómo quieres que tu recepcionista AI interactúe con los clientes..."
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
                            Describe el comportamiento, tono y información que debe proporcionar tu recepcionista.
                          </p>
                        </div>

                       
                      </div>

                      {/* Columna derecha - Configuración */}
                      <div className="space-y-6">

                  {/* Language Selection */}
                  <div>
                    <label htmlFor="ai_language" className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      id="ai_language"
                      name="ai_language"
                      value={recepcionistaFormData.ai_language}
                      onChange={handleRecepcionistaInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Selecciona el idioma principal para tu recepcionista AI.
                    </p>
                  </div>

                  {/* Voice Selection */}
                  <div>
                    <label htmlFor="ai_voice_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Voz del Asistente
                    </label>
                    <select
                      id="ai_voice_id"
                      name="ai_voice_id"
                      value={recepcionistaFormData.ai_voice_id}
                      onChange={handleRecepcionistaInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      disabled={isLoadingVoices}
                    >
                      <option value="">{isLoadingVoices ? 'Cargando voces...' : 'Seleccionar voz...'}</option>
                      {availableVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender === 'male' ? 'Masculina' : 'Femenina'} - {voice.provider === 'azure' ? 'Azure' : voice.provider === 'elevenlabs' ? 'ElevenLabs' : 'Vapi'})
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
                              checked={isFieldRequired('name')}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Nombre</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_email"
                              checked={isFieldRequired('email')}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Email</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_phone"
                              checked={isFieldRequired('phone')}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Teléfono</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_service"
                              checked={isFieldRequired('service')}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Servicio</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_date"
                              checked={isFieldRequired('date')}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Fecha</span>
                          </label>
                          <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              name="required_time"
                              checked={isFieldRequired('time')}
                              onChange={handleRequiredFieldChange}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Hora</span>
                          </label>
                        </div>
                        
                        {/* Campos personalizados integrados */}
                        {recepcionistaFormData.required_fields?.filter(field => isCustomField(field)).map((field) => (
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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


                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-center gap-3 pt-4 border-t border-gray-200">
                  {/* Botón de Crear - Solo si NO hay asistente */}
                  {!hasAssistant && (
                    <button
                      type="button"
                      onClick={handleCreateAssistant}
                      disabled={isCreatingAssistant || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id}
                      className={`px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${
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
                  )}
                  
                  {/* Botón de Editar - Solo si YA hay asistente Y hay cambios */}
                  {hasAssistant && (
                    <button
                      type="button"
                      onClick={handleUpdateAssistant}
                      disabled={isCreatingAssistant || !hasChanges || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id}
                      className={`px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${
                        isCreatingAssistant || !hasChanges || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {isCreatingAssistant ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Actualizando...</span>
                        </>
                      ) : (
                        <span>Editar Assistant</span>
                      )}
                    </button>
                  )}
                  
                  {/* Botón de Test - Solo si YA hay asistente */}
                  {hasAssistant && (
                    <button
                      type="button"
                      onClick={handleTestAssistant}
                      className="px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span>Test Assistant</span>
                    </button>
                  )}
                </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Mi Recepcionista
                </h3>
                <p className="text-gray-600">
                  Configura los detalles de tu negocio y el comportamiento del AI.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Edición */}
      {editingBusiness && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Negocio
              </h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre del Negocio *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número de Teléfono *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.phone_number}
                      onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sitio Web
                    </label>
                    <input
                      type="text"
                      value={editFormData.website || ''}
                      onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Industria *
                    </label>
                    <select
                      required
                      value={editFormData.industry}
                      onChange={(e) => setEditFormData({...editFormData, industry: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="restaurant">Restaurante</option>
                      <option value="healthcare">Salud</option>
                      <option value="beauty">Belleza</option>
                      <option value="fitness">Fitness</option>
                      <option value="professional">Servicios Profesionales</option>
                      <option value="retail">Retail</option>
                      <option value="commerce">Comercio</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rubro
                    </label>
                    <input
                      type="text"
                      value={editFormData.rubro || ''}
                      onChange={(e) => setEditFormData({...editFormData, rubro: e.target.value})}
                      placeholder="Ej: Repuestos automotrices, Consultoría legal..."
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Test Assistant - ElevenLabs */}
      <ElevenLabsCallModal
        isOpen={showTestAssistantModal}
        onClose={() => setShowTestAssistantModal(false)}
        assistantId={activeBusiness?.assistant?.vapi_assistant_id}
        businessName={activeBusiness?.name || 'Asistente'}
      />
      </div>
    </div>
  );
}