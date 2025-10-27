'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { useRouter, useParams } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  phone_number: string;
  industry: string;
  status: string;
  ai_prompt?: string;
  ai_voice_id?: string;
  ai_language?: string;
  business_hours?: any;
  services?: any[];
  google_calendar_config?: any;
  google_drive_config?: any;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export default function BusinessManagePage() {
  const { user } = useUserStore();
  const router = useRouter();
  const params = useParams();
  const businessId = params?.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    industry: '',
    ai_prompt: '',
    ai_language: 'es-ES',
    ai_voice_id: '',
    rubro: '',
  });

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      const businessData = await apiService.getBusiness();
      const businesses = Array.isArray(businessData) ? businessData : [businessData];
      const currentBusiness = businesses.find(b => b.id === businessId);
      
      if (currentBusiness) {
        setBusiness(currentBusiness);
        setFormData({
          name: currentBusiness.name || '',
          phone_number: currentBusiness.phone_number || '',
          industry: currentBusiness.industry || '',
          ai_prompt: currentBusiness.ai_prompt || '',
          ai_language: currentBusiness.ai_language || 'es-ES',
          ai_voice_id: currentBusiness.ai_voice_id || '',
          rubro: currentBusiness.rubro || '',
        });
      }
    } catch (error) {
      console.error('Error cargando negocio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiService.updateBusiness(businessId, formData);
      setIsEditing(false);
      loadBusiness(); // Recargar datos
    } catch (error) {
      console.error('Error guardando negocio:', error);
    }
  };

  const handleCancel = () => {
    if (business) {
      setFormData({
        name: business.name || '',
        phone_number: business.phone_number || '',
        industry: business.industry || '',
        ai_prompt: business.ai_prompt || '',
        ai_language: business.ai_language || 'es-ES',
        ai_voice_id: business.ai_voice_id || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Negocio no encontrado</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {business.name}
              </h1>
              <p className="text-gray-600">
                Gestionar configuración del negocio
              </p>
            </div>
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Guardar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Información del Negocio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Información Básica</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre del Negocio
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{business.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Número de Teléfono
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{business.phone_number}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Industria
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 capitalize">{business.industry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rubro
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.rubro || ''}
                          onChange={(e) => setFormData({...formData, rubro: e.target.value})}
                          placeholder="Ej: Repuestos automotrices, Consultoría legal..."
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{business.rubro || 'No especificado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        business.status === 'active' ? 'bg-green-100 text-green-800' : 
                        business.status === 'trial' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {business.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Configuración AI */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Configuración del AI</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Idioma del AI
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.ai_language}
                          onChange={(e) => setFormData({...formData, ai_language: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="es-ES">Español</option>
                          <option value="en-US">Inglés</option>
                          <option value="pt-BR">Portugués</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{business.ai_language}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Voz del AI
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ai_voice_id}
                          onChange={(e) => setFormData({...formData, ai_voice_id: e.target.value})}
                          placeholder="ID de la voz"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{business.ai_voice_id || 'No configurado'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt del AI */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Prompt del AI
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.ai_prompt}
                    onChange={(e) => setFormData({...formData, ai_prompt: e.target.value})}
                    rows={6}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe cómo debe comportarse tu recepcionista AI..."
                  />
                ) : (
                  <div className="mt-1 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      {business.ai_prompt || 'No configurado'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
  );
}
