'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { vapiService } from '@/services/vapi.service';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PlusIcon, CheckIcon, PencilIcon, Bars3Icon, PhoneIcon } from '@heroicons/react/24/outline';
import LogoutButton from '@/components/LogoutButton';
import AppointmentsTab from '@/components/reusable/AppointmentsTab';
import Sidebar from '@/components/reusable/Sidebar';
import Header from '@/components/reusable/Header';
import OverviewTab from '@/components/dashboard/OverviewTab';
import BusinessesTab from '@/components/dashboard/BusinessesTab';
import SystemConfigTab from '@/components/dashboard/SystemConfigTab';

// 🚨 IMPORTANTE: Indicar a Next.js que esta página es completamente dinámica
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function DashboardContent() {
  const { user, businesses, activeBusiness, isLoading, isLoggingOut, setActiveBusiness, setBusinesses, reset, updateBusiness } = useUserStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Función para obtener el mensaje de loading según la ruta
  const getLoadingMessage = () => {
    if (isLoggingOut) return 'Cerrando sesión...';
    if (pathname?.includes('/dashboard')) return 'Cargando dashboard...';
    if (pathname?.includes('/test-assistant')) return 'Cargando test assistant...';
    if (pathname?.includes('/account-config')) return 'Cargando configuración...';
    return 'Cargando...';
  };
  const router = useRouter();
  
  // Función auxiliar para leer el tab de la URL
  const getTabFromUrl = (): string => {
    if (searchParams) {
      const tab = searchParams.get('tab');
      if (tab && ['overview', 'businesses', 'appointments', 'calls', 'system-config'].includes(tab)) {
        return tab;
      }
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && ['overview', 'businesses', 'appointments', 'calls', 'system-config'].includes(tab)) {
        return tab;
      }
    }
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(() => getTabFromUrl());

  // Sincronizar el tab cuando cambian los query params
  useEffect(() => {
    const newTab = getTabFromUrl();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [searchParams]);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
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

  // Helper function para determinar si hay assistant (usando solo store global)
  const hasAssistant = !!(activeBusiness?.assistant?.vapi_assistant_id || activeBusiness?.assistant_id);

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
      console.log('🔄 Cambiando activeBusiness a:', selectedBusiness.name);
      
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

      // Forzar refresh de página para reinicializar el widget de Vapi
      setTimeout(() => {
        console.log('🔄 Refrescando página para reinicializar widget de Vapi...');
        window.location.reload();
      }, 300);
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
      webhook_url: 'https://ontogenetic-janene-accommodational.ngrok-free.dev/webhook-test/elevenlabs-appointment',
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
      
      const assistant = await vapiService.updateAssistant(activeBusiness.assistant.vapi_assistant_id, {
        name: `${activeBusiness.name}`,
        prompt: recepcionistaFormData.ai_prompt,
        voice: recepcionistaFormData.ai_voice_id,
        language: recepcionistaFormData.ai_language,
        firstMessage: recepcionistaFormData.first_message,
        required_fields: recepcionistaFormData.required_fields,
        businessId: activeBusiness.id // ✅ businessId para actualizar en BD
      });

      // Refrescar el business completo (con assistant actualizado) desde la BD
      const token = await getAuthToken();
      const refreshedBusinessResponse = await fetch(`${API_BASE_URL}/businesses/${activeBusiness.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (refreshedBusinessResponse.ok) {
        const refreshedBusiness = await refreshedBusinessResponse.json();
        
        // Actualizar el business en el store con los datos refrescados
        updateBusiness(activeBusiness.id, refreshedBusiness as any);
        setActiveBusiness(refreshedBusiness as any);
        
        console.log('✅ Business y assistant refrescados desde BD:', {
          businessName: refreshedBusiness.name,
          hasAssistant: !!refreshedBusiness.assistant,
          requiredFields: refreshedBusiness.assistant?.required_fields,
        });
      } else {
        // Fallback: actualizar solo lo que conocemos
        const updatedBusiness = await apiService.updateBusiness(activeBusiness.id, {
          ai_prompt: recepcionistaFormData.ai_prompt,
          ai_voice_id: recepcionistaFormData.ai_voice_id,
          ai_language: recepcionistaFormData.ai_language,
        });
        updateBusiness(activeBusiness.id, updatedBusiness as any);
      }

      setHasChanges(false);
      setRecepcionistaSuccess('Asistente actualizado exitosamente. Los cambios persisten después de refresh.');
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
      const assistant = await vapiService.createAssistant({
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


  const menuItems = [
    { id: 'overview', label: 'Dashboard', action: () => { setActiveTab('overview'); router.replace('/dashboard?tab=overview'); } },
    { id: 'businesses', label: 'Mis Negocios', action: () => { setActiveTab('businesses'); router.replace('/dashboard?tab=businesses'); } },
    { id: 'appointments', label: 'Citas / Appointments', action: () => { setActiveTab('appointments'); router.replace('/dashboard?tab=appointments'); } },
    { id: 'calls', label: 'Llamadas', action: () => { setActiveTab('calls'); router.replace('/dashboard?tab=calls'); } },
    { 
      id: 'system-config', 
      label: 'Mi Recepcionista', 
      action: () => { 
        // Si ya estamos en system-config, hacer refresh para reinicializar el widget
        if (activeTab === 'system-config') {
          console.log('🔄 Ya en Mi Recepcionista - Refrescando widget de Vapi...');
          window.location.reload();
        } else {
          // Si venimos de otra tab, navegar con refresh usando window.location.href
          console.log('🔄 Navegando a Mi Recepcionista con refresh...');
          window.location.href = '/dashboard?tab=system-config';
        }
      } 
    },
    { id: 'account-config', label: 'Configuración de Mi Cuenta', action: () => router.push('/dashboard/account-config') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{getLoadingMessage()}</p>
        </div>
      </div>
    );
  }

  if (!activeBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
        {/* Overlay para cerrar el menú */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${isMenuOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-800 shadow-lg relative z-20`}>
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menú</h2>
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
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-4">
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
          <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="lg:hidden mr-4 p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Hola, {user?.email}</span>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto dark:bg-gray-900">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                  {/* Empty State */}
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tienes negocios</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando tu primer negocio para usar el asistente de voz.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/dashboard/business/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Overlay para cerrar el menú */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuItems={menuItems}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
      {/* Header */}
      <Header
        user={user}
        activeBusiness={activeBusiness}
        businesses={businesses}
        isBusinessDropdownOpen={isBusinessDropdownOpen}
        setIsBusinessDropdownOpen={setIsBusinessDropdownOpen}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleSetActiveBusiness={handleSetActiveBusiness}
      />

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="py-6">
          {activeTab === 'overview' && (
            <OverviewTab activeBusiness={activeBusiness} hasAssistant={hasAssistant} />
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
                  <p className="text-gray-600">
                    El widget de prueba aparecerá directamente en la sección de "Mi Recepcionista" si tienes un assistant configurado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Historial de Llamadas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aquí verás el historial de llamadas atendidas por tu AI.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'businesses' && (
            <BusinessesTab 
              businesses={businesses}
              activeBusiness={activeBusiness}
              router={router}
              handleSetActiveBusiness={handleSetActiveBusiness}
              handleEditBusiness={handleEditBusiness}
            />
          )}

          {(activeTab === 'system-config' || activeTab === 'settings') && (
            <SystemConfigTab
              activeBusiness={activeBusiness}
              hasAssistant={hasAssistant}
              API_BASE_URL={API_BASE_URL}
              recepcionistaFormData={recepcionistaFormData}
              setRecepcionistaFormData={setRecepcionistaFormData}
              availableVoices={availableVoices}
              isLoadingVoices={isLoadingVoices}
              newFieldName={newFieldName}
              setNewFieldName={setNewFieldName}
              newFieldType={newFieldType}
              setNewFieldType={setNewFieldType}
              isSavingRecepcionista={isSavingRecepcionista}
              isCreatingAssistant={isCreatingAssistant}
              setIsCreatingAssistant={setIsCreatingAssistant}
              recepcionistaError={recepcionistaError}
              setRecepcionistaError={setRecepcionistaError}
              recepcionistaSuccess={recepcionistaSuccess}
              setRecepcionistaSuccess={setRecepcionistaSuccess}
              hasChanges={hasChanges}
              setHasChanges={setHasChanges}
              generateCreateAppointmentTool={generateCreateAppointmentTool}
              updateBusiness={updateBusiness}
              vapiService={vapiService}
              apiService={apiService}
              loadVoicesByLanguage={loadVoicesByLanguage}
              updatePromptWithCurrentFields={updatePromptWithCurrentFields}
              generateFirstMessage={generateFirstMessage}
            />
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

      {/* Tab Appointments */}
      {activeTab === 'appointments' && (
        <AppointmentsTab businessId={activeBusiness?.id} />
      )}
      
      </div>
    </div>
  );
}

// Wrapper component con Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
