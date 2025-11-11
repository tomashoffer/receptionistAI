'use client';

import { Building2, Bot } from 'lucide-react';
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

export function BusinessIndicator() {
  const { activeBusiness } = useUserStore();

  if (!activeBusiness) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm text-gray-900">{activeBusiness.name}</h3>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
              {businessTypeLabels[activeBusiness.type] || activeBusiness.industry}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>Recepcionista AI configurado para este negocio</span>
          </div>
        </div>
      </div>
    </div>
  );
}