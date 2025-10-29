import React from 'react';

interface EditBusinessModalProps {
  editingBusiness: any;
  editFormData: {
    name: string;
    phone_number: string;
    industry: string;
    email: string;
    website: string;
    address: string;
    description: string;
    rubro: string;
  };
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
}

export default function EditBusinessModal({
  editingBusiness,
  editFormData,
  onCancel,
  onSave,
  onChange,
}: EditBusinessModalProps) {
  if (!editingBusiness) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Editar Negocio
          </h3>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de Teléfono *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.phone_number}
                  onChange={(e) => onChange('phone_number', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sitio Web
                </label>
                <input
                  type="text"
                  value={editFormData.website || ''}
                  onChange={(e) => onChange('website', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                value={editFormData.address || ''}
                onChange={(e) => onChange('address', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={editFormData.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Industria *
                </label>
                <select
                  required
                  value={editFormData.industry}
                  onChange={(e) => onChange('industry', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="restaurant">Restaurante</option>
                  <option value="healthcare">Salud</option>
                  <option value="beauty">Belleza</option>
                  <option value="fitness">Fitness</option>
                  <option value="professional">Servicios Profesionales</option>
                  <option value="retail">Retail</option>
                  <option value="commerce">Comercio</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rubro
                </label>
                <input
                  type="text"
                  value={editFormData.rubro || ''}
                  onChange={(e) => onChange('rubro', e.target.value)}
                  placeholder="Ej: Repuestos automotrices, Consultoría legal..."
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSave}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

