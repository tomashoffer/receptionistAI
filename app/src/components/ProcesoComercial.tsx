'use client';

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { Filter, Search, Calendar, ChevronDown, MoreVertical, Phone, Mail, MessageSquare, MapPin, Users, DollarSign } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';
import { useUserStore } from '../stores/userStore';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  stage: string;
  avatar?: string;
  lastMessage?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  location?: string;
  value?: number;
  tags?: string[];
  assignedTo?: string;
  lastActivity?: string;
  source?: string;
}

const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'María González',
    phone: '+54 9 11 2345-6789',
    email: 'maria.g@email.com',
    status: 'active',
    stage: 'interesados',
    lastMessage: 'Hola, necesito turno para limpieza dental',
    checkIn: '15 Nov',
    checkOut: '10:00',
    guests: 1,
    location: 'Clínica Dental Dr. Pérez',
    tags: ['Primera consulta', 'Limpieza'],
    assignedTo: 'Chatbot',
    lastActivity: 'Hace 2h',
    source: 'WhatsApp'
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    phone: '+54 9 11 3456-7890',
    status: 'pending',
    stage: 'interesados',
    lastMessage: '¿Tienen disponibilidad para corte de pelo hoy?',
    checkIn: '11 Nov',
    checkOut: '16:30',
    guests: 1,
    location: 'Peluquería Estilo',
    tags: ['Urgente', 'Corte'],
    assignedTo: 'Voice AI',
    lastActivity: 'Hace 5h',
    source: 'Llamada'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    phone: '+54 9 351 234-5678',
    email: 'ana.martinez@email.com',
    status: 'active',
    stage: 'cotizados',
    lastMessage: 'Me pasaron el presupuesto del tratamiento',
    checkIn: '18 Nov',
    checkOut: '11:30',
    guests: 1,
    location: 'Clínica Dental Dr. Pérez',
    value: 12500,
    tags: ['Ortodoncia', 'Presupuesto enviado'],
    assignedTo: 'Chatbot',
    lastActivity: 'Hace 1h',
    source: 'Instagram'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    phone: '+54 9 223 345-6789',
    status: 'active',
    stage: 'cotizados',
    lastMessage: '¿El precio incluye los productos?',
    checkIn: '12 Nov',
    checkOut: '17:00',
    guests: 1,
    location: 'Peluquería Estilo',
    value: 8500,
    tags: ['Coloración', 'Presupuesto enviado'],
    assignedTo: 'Chatbot',
    lastActivity: 'Hace 30min',
    source: 'WhatsApp'
  },
  {
    id: '5',
    name: 'Lucía Fernández',
    phone: '+54 9 11 4567-8901',
    email: 'lucia.f@email.com',
    status: 'active',
    stage: 'solicitud',
    lastMessage: 'Quiero confirmar la reserva para 4 personas',
    checkIn: '14 Nov',
    checkOut: '21:00',
    guests: 4,
    location: 'Restaurante La Esquina',
    value: 18000,
    tags: ['Mesa para 4', 'Cena'],
    assignedTo: 'Voice AI',
    lastActivity: 'Hace 15min',
    source: 'Llamada'
  },
  {
    id: '6',
    name: 'Diego Morales',
    phone: '+54 9 261 234-5678',
    status: 'confirmed',
    stage: 'reservados',
    lastMessage: 'Perfecto, nos vemos mañana',
    checkIn: '11 Nov',
    checkOut: '09:00',
    guests: 1,
    location: 'Clínica Dental Dr. Pérez',
    value: 4200,
    tags: ['Confirmado', 'Extracción', 'Pagado'],
    assignedTo: 'Chatbot',
    lastActivity: 'Hace 1 día',
    source: 'WhatsApp'
  },
  {
    id: '7',
    name: 'Sofía Romero',
    phone: '+54 9 11 5678-9012',
    email: 'sofia.r@email.com',
    status: 'confirmed',
    stage: 'reservados',
    lastMessage: 'Gracias por la confirmación',
    checkIn: '13 Nov',
    checkOut: '20:30',
    guests: 2,
    location: 'Restaurante La Esquina',
    value: 9500,
    tags: ['Confirmado', 'Mesa para 2', 'Aniversario'],
    assignedTo: 'Chatbot',
    lastActivity: 'Hace 2 días',
    source: 'Web Chat'
  },
  {
    id: '8',
    name: 'Pablo Méndez',
    phone: '+54 9 11 6789-0123',
    status: 'active',
    stage: 'interesados',
    lastMessage: 'Necesito turno con urgencia',
    checkIn: '11 Nov',
    checkOut: '15:00',
    guests: 1,
    location: 'Clínica Dental Dr. Pérez',
    tags: ['Urgencia', 'Dolor'],
    assignedTo: 'Voice AI',
    lastActivity: 'Hace 20min',
    source: 'Llamada'
  }
];

const stages = [
  { id: 'interesados', name: 'Leads / Interesados', color: 'bg-blue-500', count: 0 },
  { id: 'cotizados', name: 'Presupuestados', color: 'bg-yellow-500', count: 0 },
  { id: 'solicitud', name: 'Pendiente de confirmación', color: 'bg-orange-500', count: 0 },
  { id: 'reservados', name: 'Confirmados', color: 'bg-green-500', count: 0 }
];

function ContactCard({ contact, moveCard }: { contact: Contact; moveCard: (id: string, newStage: string) => void }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CONTACT',
    item: { id: contact.id, stage: contact.stage },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500'
  };

  return (
    <div
      ref={drag as any}
      className={`bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-purple-500 text-white text-xs">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">{contact.name}</p>
            <p className="text-xs text-gray-500">{contact.lastActivity}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Phone className="w-3 h-3" />
          <span>{contact.phone}</span>
        </div>
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3 h-3" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.location && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{contact.location}</span>
          </div>
        )}
      </div>

      {contact.lastMessage && (
        <div className="bg-gray-50 rounded p-2 mb-3">
          <p className="text-xs text-gray-600 line-clamp-2">{contact.lastMessage}</p>
        </div>
      )}

      {(contact.checkIn || contact.checkOut) && (
        <div className="flex items-center gap-2 mb-3 text-xs">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600">
            {contact.checkIn} - {contact.checkOut}
          </span>
          {contact.guests && (
            <>
              <Users className="w-3 h-3 text-gray-400 ml-2" />
              <span className="text-gray-600">{contact.guests}</span>
            </>
          )}
        </div>
      )}

      {contact.value && (
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">${contact.value.toLocaleString()}</span>
        </div>
      )}

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {contact.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5">
            <AvatarFallback className="bg-orange-500 text-white text-xs">
              {contact.assignedTo?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">{contact.assignedTo}</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Phone className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ 
  stage, 
  contacts, 
  moveCard 
}: { 
  stage: typeof stages[0]; 
  contacts: Contact[];
  moveCard: (id: string, newStage: string) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CONTACT',
    drop: (item: { id: string; stage: string }) => {
      if (item.stage !== stage.id) {
        moveCard(item.id, stage.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  const columnContacts = contacts.filter(c => c.stage === stage.id);

  return (
    <div className="flex-1 min-w-[320px]">
      <div className="sticky top-0 bg-gray-50 pb-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
            <h3 className="text-sm">{stage.name}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {columnContacts.length}
          </Badge>
        </div>
      </div>
      
      <div
        ref={drop as any}
        className={`min-h-[500px] ${isOver ? 'bg-blue-50' : ''} rounded-lg transition-colors`}
      >
        {columnContacts.map(contact => (
          <ContactCard key={contact.id} contact={contact} moveCard={moveCard} />
        ))}
      </div>
    </div>
  );
}

export function ProcesoComercial() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const { activeBusiness } = useUserStore();

  const moveCard = (id: string, newStage: string) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === id ? { ...contact, stage: newStage } : contact
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gray-50 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl">Proceso comercial</h1>
            <div className="flex items-center gap-2">
              <BusinessSelector />
              <Button variant="outline" size="sm">
                Exportar
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                + Nuevo contacto
              </Button>
            </div>
          </div>

          {activeBusiness && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900">
                📋 Viendo proceso comercial de: <span className="font-semibold">{activeBusiness.name}</span>
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar contactos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              Asignado a
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              Fecha
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              Origen
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1">
          <div className="flex gap-4 p-8 min-w-max">
            {stages.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                contacts={contacts}
                moveCard={moveCard}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}