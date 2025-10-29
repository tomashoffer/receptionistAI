'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { useRouter } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import StateSyncer from '@/components/StateSyncer';
import LogoutButton from '@/components/LogoutButton';
import DarkModeToggle from '@/components/DarkModeToggle';

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function AccountConfigPage() {
  const { user, setUser, getState } = useUserStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });


  const menuItems = [
    { id: 'overview', label: 'Resumen', action: () => router.push('/dashboard?tab=overview') },
    { id: 'businesses', label: 'Mis Negocios', action: () => router.push('/dashboard?tab=businesses') },
    { id: 'calls', label: 'Llamadas', action: () => router.push('/dashboard?tab=calls') },
    { id: 'system-config', label: 'Mi Recepcionista', action: () => router.push('/dashboard?tab=system-config') },
    { id: 'account-config', label: 'Configuración de Mi Cuenta', action: () => {} },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Cargar datos del usuario en el formulario
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: (user as any).phone || '',
    });
    setIsLoading(false);
  }, [user, router]);

  // Actualizar el formulario cuando cambien los datos del usuario
  useEffect(() => {
    console.log('🔍 AccountConfig useEffect ejecutado, user:', user);
    if (user) {
      console.log('🔍 Usuario cargado en AccountConfig:', user);
      const newFormData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
      };
      console.log('🔍 Actualizando formulario con:', newFormData);
      setFormData(newFormData);
    } else {
      console.log('🔍 Usuario es null/undefined en AccountConfig');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Actualizar los datos del usuario
      const updatedUser = await apiService.updateUser(formData);
      
      console.log('Usuario actualizado:', updatedUser);
      
      // Actualizar el estado global
      setUser(updatedUser as any);
      
      setSuccess('Datos actualizados correctamente');
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      
      if (error.message && error.message.includes('email')) {
        setError('Este email ya está en uso. Por favor, usa otro email.');
      } else {
        setError('Error al actualizar los datos. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Debug: Mostrar el estado actual
  console.log('Estado actual del formulario:', formData);
  console.log('Usuario actual:', user);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StateSyncer />
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
                  item.id === 'account-config'
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
        <header className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="Menú"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Configuración de Mi Cuenta
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Edita tu información personal y configuración de cuenta
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-6">
                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                          Error al actualizar
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          {error}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                          ¡Actualizado correctamente!
                        </h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                          {success}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Información Personal
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
      </div>
    </>
  );
}
