'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Search, Filter, Phone, Mail, MoreVertical, X, Tag, CheckCircle, AlertCircle, Clock, MessageSquare, Video, Send, Smile, Paperclip, Edit, Trash2, Plus, User, MapPin, Calendar, FolderOpen } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';
import { useUserStore } from '../stores/userStore';

interface Message {
  id: string;
  sender: 'user' | 'contact';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  channel: 'whatsapp' | 'instagram' | 'facebook';
  status: 'open' | 'closed';
  tags: string[];
  assignedTo?: string;
  country?: string;
  notes: Note[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    contactName: 'Lu 🎂',
    contactPhone: '+54 9 11 1234-5678',
    contactEmail: 'lu@example.com',
    lastMessage: 'Un placer ayudarte! Apenas tenga la respuesta...',
    timestamp: '09:45',
    unread: false,
    channel: 'whatsapp',
    status: 'open',
    tags: ['Cliente Lead'],
    assignedTo: 'Sin asignar',
    country: 'Uruguay',
    notes: []
  },
  {
    id: '2',
    contactName: 'Daniel Vogani',
    contactPhone: '+54 9 11 2345-6789',
    lastMessage: 'Hola, recibió mucho! Soy Tami de Estancia C...',
    timestamp: '20:45',
    unread: true,
    channel: 'whatsapp',
    status: 'open',
    tags: ['Respondido a ti'],
    assignedTo: 'Chatbot',
    country: 'Argentina',
    notes: []
  },
  {
    id: '3',
    contactName: 'NOELIA IFRAN',
    contactPhone: '+54 9 351 234-5678',
    lastMessage: 'Buen día Noelia, adjuntando le podre que datoro ser...',
    timestamp: '16:56',
    unread: false,
    channel: 'instagram',
    status: 'open',
    tags: ['Esperando Pagos'],
    assignedTo: 'Voice AI',
    country: 'Argentina',
    notes: []
  },
  {
    id: '4',
    contactName: 'María González',
    contactPhone: '+54 9 11 3456-7890',
    lastMessage: 'Gracias por la información!',
    timestamp: '15:30',
    unread: false,
    channel: 'facebook',
    status: 'open',
    tags: ['Turno Confirmado'],
    assignedTo: 'Chatbot',
    country: 'Argentina',
    notes: []
  },
  {
    id: '5',
    contactName: 'Carlos Ruiz',
    contactPhone: '+54 9 223 345-6789',
    lastMessage: '¿Tienen disponibilidad para esta semana?',
    timestamp: '14:20',
    unread: true,
    channel: 'whatsapp',
    status: 'open',
    tags: ['Primera consulta'],
    assignedTo: 'Sin asignar',
    country: 'Argentina',
    notes: []
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'contact',
    content: 'Hola, necesito agendar un turno para limpieza dental',
    timestamp: '18:30',
    status: 'read'
  },
  {
    id: '2',
    sender: 'user',
    content: 'Por supuesto! ¿Qué día te vendría bien?',
    timestamp: '18:31',
    status: 'read'
  },
  {
    id: '3',
    sender: 'contact',
    content: 'Para ayudarte con tu disponibilidad tal como te lo solicitaste en documento ( 23-25 )',
    timestamp: '18:32',
    status: 'read'
  },
  {
    id: '4',
    sender: 'user',
    content: 'En el transcurso del día, uno de nuestros asesores se pondrá en contacto contigo para ayudarte con la consulta. Gracias por tu paciencia.',
    timestamp: '18:32',
    status: 'read'
  },
  {
    id: '5',
    sender: 'contact',
    content: 'Muchas gracias',
    timestamp: '19:45',
    status: 'read'
  },
  {
    id: '6',
    sender: 'user',
    content: 'Perfecto, gracias por aclarar! Consulto con un asesor si es posible coordinar una visita. Apenas tenga respuesta, te escribo 👍',
    timestamp: '21:34',
    status: 'read'
  }
];

const channelIcons = {
  whatsapp: '💬',
  instagram: '📷',
  facebook: '👥'
};

const channelColors = {
  whatsapp: 'text-green-600',
  instagram: 'text-pink-600',
  facebook: 'text-blue-600'
};

function ConversationListItem({ 
  conversation, 
  isActive, 
  onClick 
}: { 
  conversation: Conversation; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  // Truncar el mensaje a 50 caracteres
  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="bg-purple-500 text-white">
            {conversation.contactName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={channelColors[conversation.channel]}>{channelIcons[conversation.channel]}</span>
              <h4 className={`text-sm ${conversation.unread ? 'font-semibold' : ''}`}>
                {conversation.contactName}
              </h4>
            </div>
            <span className="text-xs text-gray-500">{conversation.timestamp}</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {truncateMessage(conversation.lastMessage)}
          </p>
          {conversation.tags && conversation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {conversation.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Conversaciones() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const { activeBusiness, user } = useUserStore();

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const handleCloseConversation = () => {
    if (!selectedConversation) return;
    
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, status: 'closed' }
        : conv
    ));
    
    setSelectedConversation(prev => prev ? { ...prev, status: 'closed' } : null);
    setIsCloseDialogOpen(false);
  };

  const handleAddTag = () => {
    if (!selectedConversation || !newTag.trim()) return;
    
    const updatedConversation = {
      ...selectedConversation,
      tags: [...selectedConversation.tags, newTag.trim()]
    };
    
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    
    setSelectedConversation(updatedConversation);
    setNewTag('');
    setIsTagDialogOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedConversation) return;
    
    const updatedConversation = {
      ...selectedConversation,
      tags: selectedConversation.tags.filter(tag => tag !== tagToRemove)
    };
    
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    
    setSelectedConversation(updatedConversation);
  };

  const handleAddNote = () => {
    if (!selectedConversation || !newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toLocaleString('es-AR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      createdBy: user?.first_name || 'Usuario' // En producción sería el usuario autenticado
    };
    
    const updatedConversation = {
      ...selectedConversation,
      notes: [...selectedConversation.notes, note]
    };
    
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    
    setSelectedConversation(updatedConversation);
    setNewNote('');
    setIsAddNoteDialogOpen(false);
  };

  const filteredConversations = conversations.filter(conv => {
    if (filterStatus === 'all') return true;
    return conv.status === filterStatus;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl">Conversaciones</h1>
        <BusinessSelector />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar conversaciones..." className="pl-10" />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'open' | 'closed')} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="open">Abiertas</TabsTrigger>
                <TabsTrigger value="closed">Cerradas</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={selectedConversation?.id === conversation.id}
                onClick={() => setSelectedConversation(conversation)}
              />
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-purple-500 text-white">
                      {selectedConversation.contactName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm">{selectedConversation.contactName}</h3>
                    <p className="text-xs text-gray-500">{selectedConversation.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Vista</Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCloseDialogOpen(true)}
                    disabled={selectedConversation.status === 'closed'}
                  >
                    Cerrar
                  </Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Pausar</Button>
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 p-6 overflow-y-auto" 
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3C/svg%3E")',
                  backgroundColor: '#e5ddd5'
                }}
              >
                <div className="space-y-3 max-w-4xl mx-auto">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-green-100 text-gray-900'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs text-gray-500 mt-1 block text-right">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Smile className="w-5 h-5 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje o selecciona una plantilla con /"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg mb-2">Selecciona una conversación</h3>
                <p className="text-sm text-gray-500">Elige un contacto de la lista para comenzar</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info Sidebar */}
        {selectedConversation && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Info/Notas Tabs */}
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6 mt-6">
                  {/* Agente asignado */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm">Agente asignado</h4>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedConversation.assignedTo || 'Sin asignar'}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Etiquetas */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm">Etiquetas</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsTagDialogOpen(true)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedConversation.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      {selectedConversation.tags.length === 0 && (
                        <p className="text-xs text-gray-400">Sin etiquetas</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Contacto */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm">Contacto</h4>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Teléfono:</p>
                        <p>{selectedConversation.contactPhone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Nombre:</p>
                        <p>{selectedConversation.contactName}</p>
                      </div>
                      {selectedConversation.country && (
                        <div>
                          <p className="text-gray-500">País:</p>
                          <p>🇦🇷 {selectedConversation.country}</p>
                        </div>
                      )}
                      {selectedConversation.contactEmail && (
                        <div>
                          <p className="text-gray-500">Email:</p>
                          <p>{selectedConversation.contactEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Archivos */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm">Archivos</h4>
                      <Button variant="ghost" size="sm">Subir</Button>
                    </div>
                    <div className="text-center py-4 text-gray-400">
                      <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">No hay archivos</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notas" className="mt-6">
                  <div className="space-y-4">
                    {selectedConversation.notes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedConversation.notes.map((note) => (
                          <Card key={note.id} className="p-3">
                            <p className="text-sm mb-2">{note.content}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{note.createdBy}</span>
                              <span>{note.createdAt}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay notas agregadas</p>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setIsAddNoteDialogOpen(true)}
                    >
                      + Agregar nota
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Dialog: Cerrar Conversación */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar conversación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cerrar esta conversación con {selectedConversation?.contactName}? 
              La conversación se moverá a la sección de "Cerradas".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCloseConversation} className="bg-purple-600 hover:bg-purple-700">
              Cerrar conversación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Etiqueta */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar etiqueta</DialogTitle>
            <DialogDescription>
              Agrega una etiqueta para clasificar esta conversación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Nombre de la etiqueta</Label>
              <Input
                id="tag"
                placeholder="Ej: Urgente, Seguimiento, etc."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsTagDialogOpen(false);
              setNewTag('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddTag} disabled={!newTag.trim()} className="bg-purple-600 hover:bg-purple-700">
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Nota */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar nota</DialogTitle>
            <DialogDescription>
              Agrega una nota sobre esta conversación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Nota</Label>
              <Textarea
                id="note"
                placeholder="Escribe tu nota aquí..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddNoteDialogOpen(false);
              setNewNote('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()} className="bg-purple-600 hover:bg-purple-700">
              Guardar nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}