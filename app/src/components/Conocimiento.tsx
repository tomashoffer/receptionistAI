'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { BusinessSelector } from './BusinessSelector';
import { BusinessIndicator } from './BusinessIndicator';
import { PageHeader } from './layout/PageHeader';
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
      className={`p-3 md:p-4 rounded-lg border-2 transition-all min-w-[140px] md:min-w-0 ${
        isActive 
          ? 'border-purple-600 bg-purple-600 text-white' 
          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
      }`}
    >
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
        <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        <span className="text-xs md:text-sm text-left line-clamp-2">{title}</span>
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
  const businessType = (activeBusiness?.industry as any) || 'other';

  const tabs = [
    { id: 'configuracion', icon: Settings, title: 'Configuración del Asistente', progress: 100 },
    { id: 'precios', icon: DollarSign, title: 'Precio y Disponibilidad', progress: 80 },
    { id: 'establecimiento', icon: Building2, title: 'Información del Establecimiento', progress: 100 },
    { id: 'extra', icon: FileText, title: 'Información Extra', progress: 100 },
    { id: 'integracion', icon: Plug, title: 'Integración y Fotos', progress: 100 }
  ];
  const tabOrder = tabs.map((tab) => tab.id);

  const buildNavigateHandler = (tabId: string, direction: 'previous' | 'next') => {
    const currentIndex = tabOrder.indexOf(tabId);
    if (currentIndex === -1) return undefined;
    const targetIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
    const targetId = tabOrder[targetIndex];
    if (!targetId) return undefined;
    return () => setActiveTab(targetId);
  };

  const previousHandler = buildNavigateHandler(activeTab, 'previous');
  const nextHandler = buildNavigateHandler(activeTab, 'next');
  const navButtonStyle = {
    flex: '1 0 180px',
    maxWidth: 240,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'configuracion':
        return <ConfiguracionAsistenteTab />;
      case 'precios':
        return <PrecioDisponibilidadTab />;
      case 'establecimiento':
        return <InformacionEstablecimientoTab businessType={businessType} />;
      case 'extra':
        return <InformacionExtraTab businessType={businessType} />;
      case 'integracion':
        return <IntegracionFotosTab businessType={businessType} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <PageHeader
        title="Conocimiento"
        subtitle="Configura tu asistente virtual para interactuar efectivamente con tus clientes."
        showBusinessSelector={true}
        actions={
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">52 de 52 completada</span>
            <span className="text-xs md:text-sm text-purple-600 font-medium">100%</span>
          </div>
        }
      >
        {/* Progress indicator */}
        <div className="mt-4 md:mt-6">
          <p className="text-xs text-gray-500 mb-3 md:mb-4">Progreso Total de Configuración</p>

          {/* Tab Cards - Horizontal scroll on mobile, grid on desktop */}
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0">
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-3">
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
        </div>
      </PageHeader>

      {/* Content */}
      <div className="min-h-[calc(100vh-300px)]">{renderActiveTab()}</div>

      <div className="px-4 md:px-6 lg:px-8 mt-6 md:mt-8 mb-6">
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          <Button
            variant="outline"
            className="px-6 py-3"
            onClick={() => previousHandler?.()}
            disabled={!previousHandler}
            style={navButtonStyle}
          >
            Anterior
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
            onClick={() => nextHandler?.()}
            disabled={!nextHandler}
            style={navButtonStyle}
          >
            Siguiente
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
            style={navButtonStyle}
          >
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
}