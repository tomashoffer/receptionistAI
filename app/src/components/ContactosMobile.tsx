'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Search, 
  Filter, 
  UserPlus,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { PageHeaderMobile } from './layout/PageHeaderMobile';

interface Contact {
  id: string;
  lastUpdated: string;
  name: string;
  phone: string;
  email?: string;
  tags: Array<{
    label: string;
    color: string;
  }>;
  createdAt?: string;
  checkoutDate?: string;
  estimatedAmount?: {
    value: number;
    currency: string;
  };
  source?: 'whatsapp' | 'instagram' | 'facebook' | 'call';
}

const mockContacts: Contact[] = [
  {
    id: '1',
    lastUpdated: 'hace 7 minutos',
    name: 'Lu',
    phone: '+5491154686272',
    tags: [
      { label: 'CLIENTE LEAD', color: 'blue' }
    ],
    createdAt: 'dom. dic 21, 2025',
    checkoutDate: 'sáb. dic 27, 2025',
    source: 'instagram'
  },
  {
    id: '2',
    lastUpdated: 'hace 9 minutos',
    name: 'Facundo Flores',
    phone: '+541538323286',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ],
    source: 'whatsapp'
  },
  {
    id: '3',
    lastUpdated: 'hace 23 minutos',
    name: 'Daniel Vogani',
    phone: '+5491682223575',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ],
    source: 'whatsapp'
  },
  {
    id: '4',
    lastUpdated: 'hace una hora',
    name: 'NOELIA IFRAN',
    phone: '+5498875759958',
    tags: [],
    source: 'whatsapp'
  },
  {
    id: '5',
    lastUpdated: 'hace una hora',
    name: 'Mariana',
    phone: '+5491642130367',
    email: 'mariana@example.com',
    tags: [],
    source: 'whatsapp'
  }
];

const channelIcons = {
  whatsapp: '💬',
  instagram: '📷',
  facebook: '👥',
  call: '📞'
};

export function ContactosMobile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts] = useState<Contact[]>(mockContacts);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <PageHeaderMobile
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">Contactos</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              Tutorial
            </Badge>
          </div>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Agregar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </>
        }
      />

      {/* Search */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar contacto..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contact Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-purple-500 text-white">
                      {contact.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">{contact.name}</h3>
                    <p className="text-xs text-gray-500">{contact.lastUpdated}</p>
                  </div>
                </div>
                {contact.source && (
                  <span className="text-lg">{channelIcons[contact.source]}</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              )}

              {contact.estimatedAmount && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Monto estimado</p>
                  <p className="text-sm font-semibold text-green-600">
                    {contact.estimatedAmount.currency} ${contact.estimatedAmount.value.toLocaleString()}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

