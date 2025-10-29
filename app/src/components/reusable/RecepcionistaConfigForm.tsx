import React from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

interface RecepcionistaConfigFormProps {
  activeBusiness: any;
  hasAssistant: boolean;
  recepcionistaFormData: {
    ai_prompt: string;
    ai_voice_id: string;
    ai_language: string;
    first_message: string;
    required_fields: (string | { name: string; type: string; label: string })[];
  };
  availableVoices: any[];
  isLoadingVoices: boolean;
  newFieldName: string;
  newFieldType: string;
  recepcionistaError: string;
  recepcionistaSuccess: string;
  hasChanges: boolean;
  isCreatingAssistant: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onRequiredFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddCustomField: () => void;
  onRemoveCustomField: (fieldName: string) => void;
  onGenerateFirstMessage: () => void;
  onUpdatePromptWithCurrentFields: () => void;
  onCreateAssistant: () => void;
  onUpdateAssistant: () => void;
  isFieldRequired: (fieldName: string) => boolean;
  isCustomField: (field: any) => boolean;
  getFieldName: (field: any) => string;
  getFieldLabel: (field: any) => string;
  getFieldType: (field: any) => string;
  setNewFieldName: (name: string) => void;
  setNewFieldType: (type: string) => void;
}

export default function RecepcionistaConfigForm({
  activeBusiness,
  hasAssistant,
  recepcionistaFormData,
  availableVoices,
  isLoadingVoices,
  newFieldName,
  newFieldType,
  recepcionistaError,
  recepcionistaSuccess,
  hasChanges,
  isCreatingAssistant,
  onInputChange,
  onRequiredFieldChange,
  onAddCustomField,
  onRemoveCustomField,
  onGenerateFirstMessage,
  onUpdatePromptWithCurrentFields,
  onCreateAssistant,
  onUpdateAssistant,
  isFieldRequired,
  isCustomField,
  getFieldName,
  getFieldLabel,
  getFieldType,
  setNewFieldName,
  setNewFieldType,
}: RecepcionistaConfigFormProps) {
  return (
    <>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        Mi Recepcionista - {activeBusiness?.name}
      </h3>
      <p className="text-gray-600 mb-6">
        Configura el comportamiento de tu recepcionista AI.
      </p>
      
      {/* Mensajes de error y éxito */}
      {recepcionistaError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{recepcionistaError}</p>
        </div>
      )}
      {recepcionistaSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">{recepcionistaSuccess}</p>
        </div>
      )}
          
      {/* Estado del Assistant */}
      <div className="mb-6 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              hasAssistant ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {hasAssistant ? 'Assistant Configurado' : 'Sin Assistant'}
              </h3>
              <p className="text-xs text-gray-500">
                {hasAssistant 
                  ? `ID: ${activeBusiness?.assistant_id?.substring(0, 8)}...` 
                  : 'Crea un assistant para comenzar'
                }
              </p>
            </div>
          </div>
          {hasAssistant && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckIcon className="w-4 h-4" />
              <span>Listo para usar</span>
            </div>
          )}
        </div>
      </div>
    
      {/* Formulario de configuración directamente aquí */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda - Prompt */}
        <div className="space-y-4">
          {/* First Message */}
          <div>
            <label htmlFor="first_message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de Bienvenida
            </label>
            <div className="relative">
              <input
                type="text"
                id="first_message"
                name="first_message"
                value={recepcionistaFormData.first_message}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="¡Hola! ¿En qué puedo ayudarte?"
              />
              <button
                type="button"
                onClick={onGenerateFirstMessage}
                className="absolute top-2 right-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Generar
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Primer mensaje que dirá el asistente cuando reciba una llamada.
            </p>
          </div>
          
          {/* AI Prompt */}
          <div>
            <label htmlFor="ai_prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Comportamiento del Recepcionista
            </label>
            <div className="relative">
              <textarea
                id="ai_prompt"
                name="ai_prompt"
                rows={20}
                value={recepcionistaFormData.ai_prompt}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black resize-none"
                placeholder="Define cómo quieres que tu recepcionista AI interactúe con los clientes..."
              />
              <button
                type="button"
                onClick={onUpdatePromptWithCurrentFields}
                className="absolute top-3 right-3 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Generar Prompt
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Describe el comportamiento, tono y información que debe proporcionar tu recepcionista.
            </p>
          </div>
        </div>

        {/* Columna derecha - Configuración */}
        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label htmlFor="ai_language" className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              id="ai_language"
              name="ai_language"
              value={recepcionistaFormData.ai_language}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona el idioma principal para tu recepcionista AI.
            </p>
          </div>

          {/* Voice Selection */}
          <div>
            <label htmlFor="ai_voice_id" className="block text-sm font-medium text-gray-700 mb-2">
              Voz del Asistente
            </label>
            <select
              id="ai_voice_id"
              name="ai_voice_id"
              value={recepcionistaFormData.ai_voice_id}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
              disabled={isLoadingVoices}
            >
              <option value="">{isLoadingVoices ? 'Cargando voces...' : 'Seleccionar voz...'}</option>
              {availableVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.gender === 'male' ? 'Masculina' : 'Femenina'} - {voice.provider === 'azure' ? 'Azure' : voice.provider === 'elevenlabs' ? 'ElevenLabs' : 'Vapi'})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona la voz que utilizará tu recepcionista AI para comunicarse.
            </p>
          </div>

          {/* Tools Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Herramientas</h3>
            
            {/* Required Fields for create_appointment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campos requeridos para crear citas
              </label>
              <div className="space-y-2">
                {/* Campos predefinidos */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="required_name"
                      checked={isFieldRequired('name')}
                      onChange={onRequiredFieldChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Nombre</span>
                  </label>
                  <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="required_email"
                      checked={isFieldRequired('email')}
                      onChange={onRequiredFieldChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="required_phone"
                      checked={isFieldRequired('phone')}
                      onChange={onRequiredFieldChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Teléfono</span>
                  </label>
                  <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="required_service"
                      checked={isFieldRequired('service')}
                      onChange={onRequiredFieldChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Servicio</span>
                  </label>
                  <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="required_date"
                      checked={isFieldRequired('date')}
                      onChange={onRequiredFieldChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Fecha</span>
                  </label>
                  <label className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="required_time"
                      checked={isFieldRequired('time')}
                      onChange={onRequiredFieldChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Hora</span>
                  </label>
                </div>
                
                {/* Campos personalizados integrados */}
                {recepcionistaFormData.required_fields?.filter(field => isCustomField(field)).map((field) => (
                  <div key={getFieldName(field)} className="flex items-center justify-between p-1 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name={`required_${getFieldName(field)}`}
                        checked={true}
                        onChange={() => onRemoveCustomField(getFieldName(field))}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-800 capitalize">{getFieldLabel(field)}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                        {getFieldType(field)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomField(getFieldName(field))}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors"
                      title="Eliminar campo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Agregar campo personalizado */}
                <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Nombre del campo (ej: edad, dirección...)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && onAddCustomField()}
                      />
                    </div>
                    <div className="w-20">
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black text-sm"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="email">Email</option>
                        <option value="phone">Teléfono</option>
                        <option value="date">Fecha</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={onAddCustomField}
                      disabled={!newFieldName.trim()}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Selecciona qué información debe recopilar el asistente antes de crear una cita.
              </p>
            </div>
          </div>

          {/* Información del Plan */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  ¿Cómo funciona nuestro servicio?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Nosotros manejamos toda la tecnología de ElevenLabs por ti. Solo necesitas configurar:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>El comportamiento de tu recepcionista (prompt)</li>
                    <li>La voz que prefieres</li>
                    <li>El idioma de comunicación</li>
                  </ul>
                  <p className="mt-2 font-medium">
                    Nosotros nos encargamos de crear y mantener tu assistant en ElevenLabs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget de ElevenLabs - Mostrar directamente si hay assistant */}
      {hasAssistant && (
        <div className="mb-6 pt-6 border-t border-gray-200 w-full">
          <div className="bg-gray-50 rounded-lg p-4" style={{ minHeight: '500px' }}>
            {typeof window !== 'undefined' && (
              // Widget de ElevenLabs
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              <elevenlabs-convai
                agent-id={activeBusiness?.assistant?.vapi_assistant_id}
                action-text="Probar tu asistente"
                variant="full"
                placement="center"
                transcript-enabled="true"
              />
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Una sola columna centrada */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center w-full">
        {/* Botón de Crear - Solo si NO hay asistente */}
        {!hasAssistant && (
          <button
            type="button"
            onClick={onCreateAssistant}
            disabled={isCreatingAssistant || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id}
            className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-md ${
              isCreatingAssistant || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isCreatingAssistant ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creando...</span>
              </>
            ) : (
              <span>Crear Assistant</span>
            )}
          </button>
        )}
        
        {/* Botón de Actualizar - Solo si YA hay asistente */}
        {hasAssistant && (
          <button
            type="button"
            onClick={onUpdateAssistant}
            disabled={isCreatingAssistant || !hasChanges || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id}
            className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-md ${
              isCreatingAssistant || !hasChanges || !recepcionistaFormData.ai_prompt || !recepcionistaFormData.ai_voice_id
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isCreatingAssistant ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <PencilIcon className="w-4 h-4" />
                <span>Actualizar Assistant</span>
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}

