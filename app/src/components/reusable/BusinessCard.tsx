import React from 'react';
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';

interface BusinessCardProps {
  business: any;
  activeBusinessId: string;
  onSetActive: (businessId: string) => void;
  onEdit: (business: any) => void;
}

export default function BusinessCard({ business, activeBusinessId, onSetActive, onEdit }: BusinessCardProps) {
  return (
    <div key={business.id} className={`border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
      business.id === activeBusinessId ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-medium text-gray-900">{business.name}</h4>
            {business.id === activeBusinessId && (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                Activo
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{business.industry} • {business.phone_number}</p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
            business.status === 'active' ? 'bg-green-100 text-green-800' : 
            business.status === 'trial' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {business.status}
          </span>
        </div>
        <div className="flex space-x-2">
          {business.id !== activeBusinessId && (
            <button
              onClick={() => onSetActive(business.id)}
              className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
              title="Activar"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(business)}
            className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

