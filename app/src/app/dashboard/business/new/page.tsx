'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { useRouter } from 'next/navigation';

interface NewBusinessForm {
  name: string;
  phone_number: string;
  industry: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  rubro?: string;
}

export default function NewBusinessPage() {
  const { user, addBusiness, setActiveBusiness } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewBusinessForm>({
    name: '',
    phone_number: '',
    industry: 'other',
    email: '',
    website: '',
    address: '',
    description: '',
    rubro: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Crear el negocio usando el API service
      const newBusiness = await apiService.createBusiness(formData);
      
      console.log('Negocio creado:', newBusiness);
      
      // Actualizar el estado de Zustand con el nuevo negocio
      addBusiness(newBusiness as any);
      
      // Si es el primer negocio, establecerlo como activo
      setActiveBusiness(newBusiness as any);
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creando negocio:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message && error.message.includes('número telefónico')) {
        setError('Este número de teléfono ya está registrado. Por favor, usa un número diferente.');
      } else if (error.message && error.message.includes('Conflict')) {
        setError('Este número de teléfono ya está en uso. Por favor, elige otro número.');
      } else {
        setError('Error al crear el negocio. Por favor, verifica los datos e inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

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
                Crear Nuevo Negocio
              </h1>
              <p className="text-gray-600">
                Crea un nuevo negocio para gestionar desde tu dashboard
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error al crear el negocio
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            {error}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Información Básica
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sitio Web
                      </label>
                      <input
                        type="text"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Industria *
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
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

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Rubro
                    </label>
                    <input
                      type="text"
                      value={formData.rubro || ''}
                      onChange={(e) => setFormData({...formData, rubro: e.target.value})}
                      placeholder="Ej: Repuestos automotrices, Consultoría legal..."
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>


                {/* Botones */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creando...' : 'Crear Negocio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      </div>
  );
}
