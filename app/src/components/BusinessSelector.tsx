'use client';

import { useState } from 'react';
import { Building2, Plus, ChevronDown, Edit, Trash2, Check, Circle } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useUserStore, type Business } from '../stores/userStore';
import { BusinessDialog } from './shared/BusinessDialog';

const businessTypeLabels: Record<string, string> = {
  'medical_clinic': 'Salud',
  'beauty_salon': 'Belleza',
  'restaurant': 'Gastronomía',
  'fitness_center': 'Fitness',
  'hair_salon': 'Peluquería',
  'dental_clinic': 'Clínica Dental',
  'law_firm': 'Legal',
  'automotive': 'Automotriz',
  'real_estate': 'Inmobiliaria',
  'hotel': 'Hotel',
  'consulting': 'Consultoría',
  'other': 'Otro'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  'active': { label: 'Activo', color: 'text-green-600' },
  'paused': { label: 'Pausado', color: 'text-yellow-600' },
  'inactive': { label: 'Inactivo', color: 'text-gray-400' }
};


export function BusinessSelector() {
  const { activeBusiness, setActiveBusiness, businesses, setBusinesses } = useUserStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadBusinesses = async () => {
    try {
      const { apiService } = await import('../services/api.service');
      const response = (await apiService.getBusinesses()) as any;
      const list = Array.isArray(response) ? response : response ? [response] : [];
      setBusinesses(list);
      if (list.length > 0 && !activeBusiness) {
        setActiveBusiness(list[0]);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
    }
  };

  const handleSuccess = () => {
    loadBusinesses();
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2.5 min-w-[240px] justify-between hover:bg-gray-50 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <p className="text-sm truncate">
                  {activeBusiness?.name || 'Seleccionar negocio'}
                </p>
                {activeBusiness && (
                  <p className="text-xs text-gray-500">
                    {businessTypeLabels[activeBusiness.industry] || activeBusiness.industry}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[360px] z-[100]">
          <DropdownMenuLabel className="flex items-center justify-between py-2.5 px-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Mis Negocios</span>
            <span className="text-xs text-gray-400">
              {businesses.length} {businesses.length === 1 ? 'negocio' : 'negocios'}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {businesses.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No hay negocios creados</p>
              <p className="text-xs text-gray-400">Crea tu primer negocio para comenzar</p>
            </div>
          ) : (
            <div className="max-h-[450px] overflow-y-auto py-1.5">
              {businesses.map((business: Business) => {
                const isActive = activeBusiness?.id === business.id;
                const statusInfo = statusLabels[business.status] || { label: 'Activo', color: 'text-green-600' };
                const stats = (business as any).stats || { conversations: 0, appointments: 0, automation: 0 };
                
                return (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() => {
                      setActiveBusiness(business);
                    }}
                    className={`flex items-start gap-3 cursor-pointer px-3.5 py-3 my-1 mx-1.5 rounded-md focus:bg-purple-50 ${
                      isActive ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-purple-600' : 'bg-purple-100'
                    }`}>
                      <span className={`text-sm ${
                        isActive ? 'text-white' : 'text-purple-700'
                      }`}>
                        {business.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center">
                      <div className="flex items-center justify-center gap-2 mb-0.5">
                        <p className={`text-sm truncate ${isActive ? 'dark:text-black-important' : 'text-gray-500'}`}>{business.name}</p>
                        {isActive && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className={`flex items-center justify-center gap-2 text-xs mb-1.5 ${isActive ? 'dark:text-black-important' : 'text-gray-500'}`}>
                        <span>{businessTypeLabels[business.industry] || business.industry}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Circle className={`w-1.5 h-1.5 fill-current ${statusInfo.color}`} />
                          <span className={`${statusInfo.color} ${isActive ? 'dark:text-black-important' : ''}`}>{statusInfo.label}</span>
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-center gap-3 text-xs ${isActive ? 'dark:text-black-important' : 'text-gray-400'}`}>
                        <span>{stats.conversations} conv.</span>
                        <span>{stats.appointments} citas</span>
                        <span className={`${isActive ? 'dark:text-black-important' : 'text-purple-600'}`}>{stats.automation}% auto.</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-purple-600 cursor-pointer px-3.5 py-3 mx-1.5 my-1 rounded-md focus:text-purple-600"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Crear nuevo negocio</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Business Dialog */}
      <BusinessDialog 
        business={null} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSuccess={handleSuccess}
      />
    </>
  );
}