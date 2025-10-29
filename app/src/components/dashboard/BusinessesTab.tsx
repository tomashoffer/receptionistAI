'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import { apiService } from '@/services/api.service';
import { useUserStore } from '@/stores/userStore';

interface BusinessesTabProps {
  businesses: any[];
  activeBusiness: any;
  router: any;
  handleSetActiveBusiness: (businessId: string) => void;
  handleEditBusiness: (business: any) => void;
}

export default function BusinessesTab({
  businesses,
  activeBusiness,
  router,
  handleSetActiveBusiness,
  handleEditBusiness,
}: BusinessesTabProps) {
  const { updateBusiness } = useUserStore();

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-white">
              Mis Negocios
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestiona todos tus negocios desde aquí.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/business/new')}
            className="bg-green-600 dark:bg-green-700 text-white p-2 rounded-full hover:bg-green-700 dark:hover:bg-green-600 shadow-sm hover:shadow-md transition-all"
            title="Crear Nuevo Negocio"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {businesses.map((business: any) => (
            <div key={business.id} className={`border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
              business.id === activeBusiness.id ? 'border-indigo-500 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } bg-white dark:bg-gray-800`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{business.name}</h4>
                    {business.id === activeBusiness.id && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{business.industry} • {business.phone_number}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    business.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 
                    business.status === 'trial' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' : 
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {business.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {business.id !== activeBusiness.id && (
                    <button
                      onClick={() => handleSetActiveBusiness(business.id)}
                      className="bg-gray-600 dark:bg-gray-700 text-white p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                      title="Activar"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditBusiness(business)}
                    className="bg-indigo-600 dark:bg-indigo-700 text-white p-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

