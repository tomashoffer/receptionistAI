'use client';

import { useEffect, useState } from 'react';
import { Building2, Bot, CheckCircle } from 'lucide-react';
import { useUserStore } from '../stores/userStore';

const businessTypeLabels: Record<string, string> = {
  'hair_salon': 'Peluquería',
  'restaurant': 'Restaurante',
  'medical_clinic': 'Clínica Médica',
  'dental_clinic': 'Clínica Dental',
  'fitness_center': 'Gimnasio',
  'beauty_salon': 'Salón de Belleza',
  'law_firm': 'Estudio Jurídico',
  'consulting': 'Consultoría',
  'real_estate': 'Inmobiliaria',
  'automotive': 'Taller Automotriz',
  'hotel': 'Hotel',
  'other': 'Otro'
};

export function BusinessSwitchNotification() {
  const { activeBusiness } = useUserStore();
  const [show, setShow] = useState(false);
  const [prevBusinessId, setPrevBusinessId] = useState(activeBusiness?.id);

  useEffect(() => {
    if (activeBusiness && activeBusiness.id !== prevBusinessId && prevBusinessId !== undefined) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      setPrevBusinessId(activeBusiness.id);
      return () => clearTimeout(timer);
    }
    if (activeBusiness && prevBusinessId === undefined) {
      setPrevBusinessId(activeBusiness.id);
    }
  }, [activeBusiness]);

  if (!show || !activeBusiness) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className="bg-white border-2 border-purple-500 rounded-lg shadow-lg p-4 min-w-[320px]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm text-gray-900">Negocio cambiado</h4>
            </div>
            <p className="text-sm text-gray-700 mb-2">{activeBusiness.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                {businessTypeLabels[activeBusiness.type] || activeBusiness.industry}
              </span>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Recepcionista AI propio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}