'use client';

import React, { useState, useEffect } from 'react';
import { appointmentsService } from '@/services/appointments.service';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

interface OverviewTabProps {
  activeBusiness: any;
  hasAssistant: boolean;
}

export default function OverviewTab({ activeBusiness, hasAssistant }: OverviewTabProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  useEffect(() => {
    const loadUpcomingAppointments = async () => {
      if (!activeBusiness?.id) return;
      
      setIsLoadingAppointments(true);
      try {
        const allAppointments = await appointmentsService.getAll(activeBusiness.id);
        // Filtrar solo los appointments programados y ordenar por fecha
        const upcoming = allAppointments
          .filter((apt: any) => apt.status === 'scheduled' || apt.status === 'confirmed')
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
            const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5); // Solo los próximos 5
        setUpcomingAppointments(upcoming || []);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setUpcomingAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadUpcomingAppointments();
  }, [activeBusiness?.id]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Plan
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                    {activeBusiness.status}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📞</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Teléfono
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {activeBusiness.phone_number}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Google Calendar Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Google Calendar
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {(activeBusiness.google_calendar_config as any)?.connected ? 'Conectado' : 'No conectado'}
                  </dd>
                  {(activeBusiness.google_calendar_config as any)?.connected && (
                    <dd className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {(activeBusiness.google_calendar_config as any)?.email}
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Google Drive Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📂</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Google Drive
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {(activeBusiness.google_drive_config as any)?.enabled ? 'Conectado' : 'No conectado'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración del AI y Próximos Appointments en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración Actual del AI */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Estado del AI
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* AI Configurado */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🤖</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Estado</p>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                      {hasAssistant ? 'Activo' : 'Sin configurar'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voz */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🎤</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Voz</p>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                      {activeBusiness.assistant?.voice_id ? 
                        (() => {
                          // Extraer el nombre de la voz del assistant data si existe
                          const voiceId = activeBusiness.assistant.voice_id;
                          const voiceName = activeBusiness.assistant.voice_name || 
                                            voiceId.includes('Alvaro') || voiceId.includes('alvaro') ? 'Álvaro' :
                                            voiceId.includes('Esperanza') || voiceId.includes('esperanza') ? 'Esperanza' :
                                            voiceId.includes('Hana') || voiceId.includes('hana') ? 'Hana' :
                                            voiceId.includes('Rachel') || voiceId.includes('rachel') ? 'Rachel' :
                                            voiceId.includes('Nova') || voiceId.includes('nova') ? 'Nova' :
                                            voiceId.includes('Adam') || voiceId.includes('adam') ? 'Adam' :
                                            'Voz configurada';
                          return voiceName;
                        })() : 
                        'No configurado'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Idioma */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🌐</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Idioma</p>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                      {activeBusiness.assistant?.language ? 
                        (() => {
                          const lang = activeBusiness.assistant.language;
                          // Manejar diferentes formatos de código de idioma
                          if (lang === 'es' || lang === 'es-ES' || lang === 'es_AR' || lang.startsWith('es')) return 'Español';
                          if (lang === 'en' || lang === 'en-US' || lang === 'en_GB' || lang.startsWith('en')) return 'Inglés';
                          if (lang === 'pt' || lang === 'pt-BR' || lang === 'pt_PT' || lang.startsWith('pt')) return 'Portugués';
                          return lang;
                        })() : 
                        'No configurado'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt Status */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💬</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Prompt</p>
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 truncate">
                      {activeBusiness.assistant?.prompt ? 'Configurado' : 'Sin prompt'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Appointments */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-emerald-500" />
              Próximos Turnos
            </h3>
            
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay turnos programados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {appointment.clientName || appointment.name || 'Cliente'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            <span>{appointment.appointmentDate}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                        </div>
                        {appointment.serviceType && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {appointment.serviceType}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                        Programado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

