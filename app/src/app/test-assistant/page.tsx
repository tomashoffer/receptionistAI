'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/api.service';
import { useRouter } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import LogoutButton from '@/components/LogoutButton';

interface TestConfig {
  prompt: string;
  voice: string;
  language: string;
  services: string[];
  operating_hours: any;
}

interface TestCall {
  id: string;
  duration: number;
  status: string;
  created_at: string;
  transcription: string;
  ai_response: string;
  sentiment: string;
  outcome: string;
}

export default function TestAssistantPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [config, setConfig] = useState<TestConfig>({
    prompt: '',
    voice: 'alloy',
    language: 'es',
    services: [],
    operating_hours: {},
  });
  const [testCalls, setTestCalls] = useState<TestCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const menuItems = [
    { id: 'overview', label: 'Resumen', action: () => router.push('/dashboard?tab=overview') },
    { id: 'businesses', label: 'Mis Negocios', action: () => router.push('/dashboard?tab=businesses') },
    { id: 'test-assistant', label: 'Test Assistant', action: () => {} },
    { id: 'calls', label: 'Llamadas', action: () => router.push('/dashboard?tab=calls') },
    { id: 'system-config', label: 'Mi Recepcionista', action: () => router.push('/dashboard?tab=system-config') },
    { id: 'account-config', label: 'Configuración de Mi Cuenta', action: () => router.push('/dashboard/account-config') },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadTestData();
  }, [user, router]);

  const loadTestData = async () => {
    try {
      const [configData, callsData] = await Promise.all([
        apiService.getTestConfig(),
        apiService.getTestCalls(),
      ]);
      
      setConfig(configData as TestConfig);
      setTestCalls(callsData as TestCall[]);
    } catch (error) {
      console.error('Error cargando datos de test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await apiService.updateTestConfig(config);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestCall = async () => {
    setIsTesting(true);
    try {
      const testData = {
        business_id: user?.business_id,
        test_type: 'manual',
        config: config,
      };
      
      const result = await apiService.createTestCall(testData);
      alert('Llamada de prueba iniciada');
      
      // Recargar las llamadas de prueba
      const callsData = await apiService.getTestCalls();
      setTestCalls(callsData as TestCall[]);
    } catch (error) {
      console.error('Error iniciando llamada de prueba:', error);
      alert('Error al iniciar la llamada de prueba');
    } finally {
      setIsTesting(false);
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setConfig(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        services: prev.services.filter(s => s !== service)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando test assistant...</p>
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
                  item.id === 'test-assistant'
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
                    Test Assistant
                  </h1>
                  <p className="text-gray-600">
                    Prueba tu recepcionista AI antes de activarlo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {user?.first_name} {user?.last_name}
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Configuration Panel */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Configuración del AI
                </h3>
                
                <div className="space-y-6">
                  {/* Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt del AI
                    </label>
                    <textarea
                      value={config.prompt}
                      onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Escribe aquí el prompt que definirá el comportamiento de tu AI..."
                    />
                  </div>

                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voz del AI
                    </label>
                    <select
                      value={config.voice}
                      onChange={(e) => setConfig(prev => ({ ...prev, voice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="alloy">Alloy</option>
                      <option value="echo">Echo</option>
                      <option value="fable">Fable</option>
                      <option value="onyx">Onyx</option>
                      <option value="nova">Nova</option>
                      <option value="shimmer">Shimmer</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={config.language}
                      onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicios del Negocio
                    </label>
                    <div className="space-y-2">
                      {[
                        'Corte de cabello',
                        'Peinado',
                        'Tinte',
                        'Tratamiento capilar',
                        'Manicura',
                        'Pedicura',
                        'Masaje',
                        'Consulta médica',
                        'Tratamiento facial',
                        'Depilación'
                      ].map((service) => (
                        <label key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={config.services.includes(service)}
                            onChange={(e) => handleServiceChange(service, e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveConfig}
                      disabled={isSaving}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                    
                    <button
                      onClick={handleTestCall}
                      disabled={isTesting || !config.prompt}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isTesting ? 'Iniciando...' : 'Probar Llamada'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Calls History */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Historial de Pruebas
                </h3>
                
                {testCalls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay llamadas de prueba registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {testCalls.map((call) => (
                      <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Llamada #{call.id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(call.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            call.status === 'completed' ? 'bg-green-100 text-green-800' :
                            call.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {call.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Duración:</strong> {call.duration}s</p>
                          <p><strong>Sentimiento:</strong> {call.sentiment}</p>
                          <p><strong>Resultado:</strong> {call.outcome}</p>
                        </div>
                        
                        {call.transcription && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Transcripción:</p>
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {call.transcription}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
