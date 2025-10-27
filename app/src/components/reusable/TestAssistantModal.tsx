"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Phone, Save, Settings } from "lucide-react";
import VapiCallModal from './VapiCallModal';
import { apiService } from '@/services/api.service';
import { useUserStore } from '@/stores/userStore';

interface TestConfig {
  prompt: string;
  voice: string;
  language: string;
  services: string[];
  operating_hours: any;
}

interface TestAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
}

export default function TestAssistantModal({ isOpen, onClose, businessId }: TestAssistantModalProps) {
  const { user } = useUserStore();
  const [config, setConfig] = useState<TestConfig>({
    prompt: '',
    voice: 'alloy',
    language: 'es',
    services: [],
    operating_hours: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showVapiModal, setShowVapiModal] = useState(false);
  const [assistantId, setAssistantId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadTestData();
    }
  }, [isOpen]);

  const loadTestData = async () => {
    try {
      setIsLoading(true);
      const configData = await apiService.getTestConfig();
      setConfig(configData as TestConfig);
      
      // Si hay un businessId, intentar obtener el assistant ID
      if (businessId) {
        try {
          const businessData = await apiService.getBusinessById(businessId);
          if (businessData && businessData.vapi_assistant_id) {
            setAssistantId(businessData.vapi_assistant_id);
          }
        } catch (error) {
          console.log('No hay assistant configurado para este negocio');
        }
      }
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

  const handleTestCall = () => {
    if (!assistantId) {
      alert('No hay un asistente configurado para este negocio. Por favor, crea un asistente primero.');
      return;
    }
    setShowVapiModal(true);
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

  const handleClose = () => {
    setShowVapiModal(false);
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Test Assistant
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Configuración del AI
              </h3>
              
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
                <div className="grid grid-cols-2 gap-2">
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
            </div>

            {/* Test Panel */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Probar Asistente
              </h3>

              {/* Assistant Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Estado del Asistente</h4>
                {assistantId ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Asistente configurado (ID: {assistantId.substring(0, 8)}...)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      No hay asistente configurado
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                
                <Button
                  onClick={handleTestCall}
                  disabled={!assistantId || !config.prompt}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Probar Llamada
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instrucciones</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Configura el prompt y la voz del asistente</li>
                  <li>• Selecciona los servicios que ofrece tu negocio</li>
                  <li>• Guarda la configuración</li>
                  <li>• Haz clic en "Probar Llamada" para testear</li>
                  <li>• Verás la transcripción en tiempo real</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vapi Call Modal */}
      {showVapiModal && (
        <VapiCallModal
          isOpen={showVapiModal}
          onClose={() => setShowVapiModal(false)}
          assistantId={assistantId}
        />
      )}
    </>
  );
}
