'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Tag as TagIcon,
  Edit2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Contact } from '@/types/contact.types';
import { apiService } from '@/services/api.service';

const TAG_COLORS: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-700',
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  gray: 'bg-gray-600 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  yellow: 'bg-yellow-400 text-yellow-900',
  indigo: 'bg-indigo-500 text-white',
  teal: 'bg-teal-500 text-white',
};

interface ContactDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onEdit?: () => void;
}

export function ContactDetailsModal({
  open,
  onOpenChange,
  contact,
  onEdit,
}: ContactDetailsModalProps) {
  const [appointments, setAppointments] = useState<any>(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  useEffect(() => {
    if (open && contact) {
      loadAppointments();
    }
  }, [open, contact]);

  const loadAppointments = async () => {
    if (!contact) return;
    
    setIsLoadingAppointments(true);
    try {
      const data = await apiService.getContactAppointments(contact.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error al cargar appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  if (!contact) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAppointmentDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('es-AR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} - ${timeString}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pendiente', className: 'bg-yellow-500 text-white' },
      CONFIRMED: { label: 'Confirmado', className: 'bg-green-500 text-white' },
      COMPLETED: { label: 'Completado', className: 'bg-blue-500 text-white' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-500 text-white' },
      NO_SHOW: { label: 'No asistió', className: 'bg-gray-500 text-white' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      whatsapp: '💬',
      instagram: '📷',
      facebook: '👥',
      call: '☎️',
      web: '🌐',
      manual: '✏️',
    };
    return icons[source] || '📌';
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook',
      call: 'Llamada',
      web: 'Web',
      manual: 'Manual',
    };
    return labels[source] || source;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0">
        {/* Header fijo */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-xl flex-1">Detalles del Contacto</DialogTitle>
    
          </div>
        </DialogHeader>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Información Personal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {contact.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {contact.phone}
                    </p>
                  </div>
                </div>

                {contact.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{getSourceIcon(contact.source)}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Canal de contacto</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {getSourceLabel(contact.source)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {contact.contactTags && contact.contactTags.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Etiquetas
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.contactTags.map((ct) => (
                    <Badge
                      key={ct.id}
                      className={`${TAG_COLORS[ct.tag.color] || TAG_COLORS.gray} flex items-center gap-1`}
                    >
                      {ct.tag.icon && <span>{ct.tag.icon}</span>}
                      {ct.tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actividad
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {contact.total_interactions}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Interacciones
                  </p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Última interacción
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {contact.last_interaction 
                      ? formatDate(contact.last_interaction)
                      : 'Sin interacciones'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas */}
            {contact.notes && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            )}

            {/* Appointments */}
            {!isLoadingAppointments && appointments && appointments.total > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Turnos y Citas
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {appointments.total} total
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Próximo turno */}
                  {appointments.next && (
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Próximo turno
                          </span>
                        </div>
                        {getStatusBadge(appointments.next.status)}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {appointments.next.serviceType}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatAppointmentDate(appointments.next.appointmentDate, appointments.next.appointmentTime)}
                      </div>
                      {appointments.next.notes && (
                        <p className="text-xs text-gray-500 mt-2">
                          {appointments.next.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Último turno */}
                  {appointments.last && (
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Último turno
                          </span>
                        </div>
                        {getStatusBadge(appointments.last.status)}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {appointments.last.serviceType}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatAppointmentDate(appointments.last.appointmentDate, appointments.last.appointmentTime)}
                      </div>
                      {appointments.last.notes && (
                        <p className="text-xs text-gray-500 mt-2">
                          {appointments.last.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Historial resumido */}
                  {appointments.all.length > 2 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver historial completo ({appointments.all.length} turnos)
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isLoadingAppointments && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 text-center">
                  Cargando historial de turnos...
                </p>
              </div>
            )}

            {/* Última conversación */}
            {contact.last_conversation_summary && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resumen de última conversación
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {contact.last_conversation_summary}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <p className="font-medium mb-1">Fecha de creación</p>
                  <p>{formatDate(contact.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Última actualización</p>
                  <p>{formatDate(contact.updated_at)}</p>
                </div>
                {contact.conversation_id && (
                  <div className="col-span-2">
                    <p className="font-medium mb-1">ID de conversación (VAPI)</p>
                    <p className="font-mono text-xs">{contact.conversation_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="px-6 py-4 border-t flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

