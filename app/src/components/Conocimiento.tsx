'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { BusinessSelector } from './BusinessSelector';
import { BusinessIndicator } from './BusinessIndicator';
import { useUserStore } from '../stores/userStore';
import { Settings, DollarSign, Building2, FileText, Plug, Bot } from 'lucide-react';
import { ConfiguracionAsistenteTab } from './conocimiento/ConfiguracionAsistenteTab';
import { PrecioDisponibilidadTab } from './conocimiento/PrecioDisponibilidadTab';
import { InformacionEstablecimientoTab } from './conocimiento/InformacionEstablecimientoTab';
import { InformacionExtraTab } from './conocimiento/InformacionExtraTab';
import { IntegracionFotosTab } from './conocimiento/IntegracionFotosTab';

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
      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
        isActive 
          ? 'border-purple-600 bg-purple-600 text-white' 
          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isActive ? 'bg-white' : 'bg-purple-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`text-xs text-right ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
          {progress}%
        </p>
      </div>
    </button>
  );
}

export function Conocimiento() {
  const [activeTab, setActiveTab] = useState('configuracion');
  const { activeBusiness } = useUserStore();
  const businessType = activeBusiness?.type || 'other';

  const tabs = [
    { id: 'configuracion', icon: Settings, title: 'Configuración del Asistente', progress: 100 },
    { id: 'precios', icon: DollarSign, title: 'Precio y Disponibilidad', progress: 80 },
    { id: 'establecimiento', icon: Building2, title: 'Información del Establecimiento', progress: 100 },
    { id: 'extra', icon: FileText, title: 'Información Extra', progress: 100 },
    { id: 'integracion', icon: Plug, title: 'Integración y Fotos', progress: 100 }
  ];

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-2">Precio y Disponibilidad</h1>
            <p className="text-sm text-gray-500">
              Configura tu asistente virtual para interactuar efectivamente con tus clientes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">52 de 52 completada</span>
            <span className="text-sm text-purple-600">100%</span>
            <BusinessSelector />
          </div>
        </div>

        {/* Progress indicator */}
        <p className="text-xs text-gray-500 mb-4">Progreso Total de Configuración</p>

        {/* Tab Cards */}
        <div className="grid grid-cols-5 gap-3">
          {tabs.map((tab) => (
            <TabCard
              key={tab.id}
              icon={tab.icon}
              title={tab.title}
              progress={tab.progress}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'configuracion' && <ConfiguracionAsistenteTab />}
        {activeTab === 'precios' && <PrecioDisponibilidadTab />}
        {activeTab === 'establecimiento' && <InformacionEstablecimientoTab businessType={businessType} />}
        {activeTab === 'extra' && <InformacionExtraTab businessType={businessType} />}
        {activeTab === 'integracion' && <IntegracionFotosTab businessType={businessType} />}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex justify-end mt-8">
        <Button className="bg-purple-600 hover:bg-purple-700">
          Actualizar
        </Button>
      </div>
    </div>
  );
}