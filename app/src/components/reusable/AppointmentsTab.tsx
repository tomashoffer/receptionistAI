'use client';

import React, { useState, useEffect } from 'react';
import { appointmentsService, Appointment, GoogleCalendarStatus } from '@/services/appointments.service';
import { 
  CheckIcon, 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon,
  CloudIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface AppointmentsTabProps {
  businessId?: string;
}

export default function AppointmentsTab({ businessId }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [gcStatus, setGcStatus] = useState<GoogleCalendarStatus>({
    connected: false,
    email: null,
    connected_at: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  const loadData = async () => {
    if (!businessId) return;
    
    try {
      setIsLoading(true);
      const [apptsData, statusData] = await Promise.all([
        appointmentsService.getAll(businessId),
        appointmentsService.getStatus(businessId),
      ]);
      
      setAppointments(apptsData);
      setGcStatus(statusData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    if (!businessId) return;
    
    try {
      setIsConnecting(true);
      await appointmentsService.connectGoogleCalendar(businessId);
      // La redirección se maneja automáticamente
    } catch (error) {
      console.error('Error conectando Google Calendar:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    if (!businessId) return;
    
    try {
      await appointmentsService.disconnectGoogleCalendar(businessId);
      await loadData(); // Recargar datos
    } catch (error) {
      console.error('Error desconectando Google Calendar:', error);
    }
  };

  // Helper para obtener appointments del mes actual
  const getAppointmentsForMonth = () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return appointments.filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return apptDate >= start && apptDate <= end;
    });
  };

  // Helper para generar el calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos antes del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getAppointmentsForDay = (day: number | null) => {
    if (day === null) return [];
    
    const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(appt => appt.appointmentDate === date);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Google Calendar Connection Status */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CloudIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Google Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {gcStatus.connected 
                  ? `Conectado a ${gcStatus.email}` 
                  : 'No conectado'}
              </p>
            </div>
          </div>
          
          {gcStatus.connected ? (
            <button
              onClick={handleDisconnectGoogleCalendar}
              className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition"
            >
              Desconectar
            </button>
          ) : (
            <button
              onClick={handleConnectGoogleCalendar}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {isConnecting ? 'Conectando...' : 'Conectar Google Calendar'}
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {viewMode === 'list' ? 'Lista de Citas' : formatMonth(currentMonth)}
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TableCellsIcon className="h-5 w-5" />
                <span>Lista</span>
              </div>
            </button>
            
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Squares2X2Icon className="h-5 w-5" />
                <span>Calendario</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay citas</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Las citas creadas desde el AI aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {appt.clientName}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appt.status === 'confirmed' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                              : appt.status === 'cancelled'
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(appt.appointmentDate).toLocaleDateString('es-AR')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-4 w-4" />
                            <span>{appt.appointmentTime}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{appt.serviceType}</p>
                          <p className="text-gray-500 dark:text-gray-500">{appt.clientEmail}</p>
                          <p className="text-gray-500 dark:text-gray-500">{appt.clientPhone}</p>
                          {appt.notes && (
                            <p className="text-gray-500 dark:text-gray-400 italic mt-2">📝 {appt.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {appt.googleCalendarEventId && (
                          <div className="flex items-center text-green-600 dark:text-green-400" title="En Google Calendar">
                            <CheckIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            >
              ←
            </button>
            <h3 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">{formatMonth(currentMonth)}</h3>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, idx) => {
              const dayAppointments = getAppointmentsForDay(day);
              
              return (
                <div
                  key={idx}
                  className={`min-h-24 border border-gray-200 dark:border-gray-700 p-1 ${
                    day === null ? 'bg-gray-50 dark:bg-gray-900' : dayAppointments.length > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium mb-1 text-gray-900 dark:text-white">{day}</div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((appt) => (
                          <div
                            key={appt.id}
                            className="text-xs p-1 bg-indigo-600 dark:bg-indigo-700 text-white rounded truncate"
                            title={`${appt.clientName} - ${appt.appointmentTime}`}
                          >
                            {appt.appointmentTime} {appt.clientName}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayAppointments.length - 2} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
