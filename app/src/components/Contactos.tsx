'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Search, 
  Filter, 
  Download,
  Upload,
  UserPlus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { PageHeader } from './layout/PageHeader';

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
    email: '',
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
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '3',
    lastUpdated: 'hace 23 minutos',
    name: 'Daniel Vogani',
    phone: '+5491682223575',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '4',
    lastUpdated: 'hace una hora',
    name: 'NOELIA IFRAN',
    phone: '+5498875759958',
    email: '',
    tags: [
      { label: 'CLIENTE LEAD', color: 'blue' },
      { label: '17D', color: 'gray' }
    ],
    createdAt: 'sáb. nov 22, 2025',
    checkoutDate: 'lun. nov 10, 2025'
  },
  {
    id: '5',
    lastUpdated: 'hace una hora',
    name: 'Mariana',
    phone: '+5491642130367',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '6',
    lastUpdated: 'hace una hora',
    name: 'Andrea',
    phone: '+5491143308334',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '7',
    lastUpdated: 'hace una hora',
    name: 'Silvia Silguero',
    phone: '',
    email: '',
    tags: [
      { label: 'Esperando Pagos', color: 'orange' }
    ],
    createdAt: 'mar. dic 16, 2025',
    checkoutDate: 'vie. dic 19, 2025',
    estimatedAmount: {
      value: 8294.05,
      currency: 'USD'
    },
    source: 'instagram'
  },
  {
    id: '8',
    lastUpdated: 'hace una hora',
    name: 'Geny',
    phone: '+5491151145684',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '9',
    lastUpdated: 'hace una hora',
    name: 'Guadalupe Berthoud',
    phone: '+5498945457075',
    email: 'Berthoudg@gmail.com',
    tags: [
      { label: 'Reserva 15D14', color: 'green' }
    ],
    createdAt: 'vie. nov 14, 2025',
    checkoutDate: 'lun. nov 10, 2025',
    estimatedAmount: {
      value: 12612.81,
      currency: 'ARS'
    }
  },
  {
    id: '10',
    lastUpdated: 'hace una hora',
    name: 'Jorge Segovia',
    phone: '+5491158177898',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '11',
    lastUpdated: 'hace 2 horas',
    name: 'Facundo Trinidad',
    phone: '+5989925049625',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '12',
    lastUpdated: 'hace 2 horas',
    name: 'Ismidson jonh',
    phone: '+5491152816585',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' },
      { label: 'Esperando Pagos', color: 'orange' }
    ],
    createdAt: 'mié. abr 16, 2026',
    checkoutDate: 'lun. nov 10, 2025'
  },
  {
    id: '13',
    lastUpdated: 'hace 2 horas',
    name: 'vale',
    phone: '+5491566853508',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' },
      { label: 'Reserva confirmada', color: 'orange' }
    ],
    createdAt: 'lun. ene 5, 2026',
    checkoutDate: 'lun. ene 12, 2026',
    estimatedAmount: {
      value: 2791,
      currency: 'USD'
    }
  },
  {
    id: '14',
    lastUpdated: 'hace 2 horas',
    name: 'Nico',
    phone: '+542214553239',
    email: '',
    tags: [
      { label: 'Respondido 2.1', color: 'blue' }
    ]
  },
  {
    id: '15',
    lastUpdated: 'hace 2 horas',
    name: 'Facundo',
    phone: '+5989623155527',
    email: '',
    tags: [
      { label: 'Posible Reserva', color: 'orange' }
    ],
    createdAt: 'mié. nov 12, 2025',
    checkoutDate: 'vie. nov 14, 2025',
    estimatedAmount: {
      value: 55013.72,
      currency: 'UYU'
    }
  }
];

const tagColors = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white',
  gray: 'bg-gray-500 text-white',
  purple: 'bg-purple-500 text-white'
};

export function Contactos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 bg-gray-50">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2xl">Contactos</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Tutorial
            </Badge>
          </div>
        }
      >
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Importar contactos
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Agregar contacto
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Descargar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar contacto..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualización
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Table */}
      <div className="flex-1">
        <Table>
          <TableHeader className="bg-purple-600 sticky top-0 z-10">
            <TableRow className="hover:bg-purple-600">
              <TableHead className="text-white">Actualizado</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Contacto</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Etiquetas</TableHead>
              <TableHead className="text-white">Creación</TableHead>
              <TableHead className="text-white">Checkout</TableHead>
              <TableHead className="text-white">Monto estimado</TableHead>
              <TableHead className="text-white text-right">IP & CPM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-transparent">
            {filteredContacts.map((contact) => (
              <TableRow
                key={contact.id}
                className="hover:bg-gray-50 dark:hover:bg-purple-500/20 transition-colors dark:hover:text-black"
              >
                <TableCell className="text-sm dark:hover:text-black">
                  {contact.lastUpdated}
                </TableCell>
                <TableCell className="text-sm dark:hover:text-black">
                  {contact.name}
                </TableCell>
                <TableCell className="text-sm dark:hover:text-black">
                  <div className="flex items-center gap-2">
                    {contact.phone}
                    {contact.source === 'instagram' && (
                      <span className="text-pink-600">📷</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm dark:hover:text-black">
                  {contact.email || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className={`${tagColors[tag.color as keyof typeof tagColors]} text-xs`}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm dark:hover:text-black">
                  {contact.createdAt || '-'}
                </TableCell>
                <TableCell className="text-sm dark:hover:text-black">
                  {contact.checkoutDate || '-'}
                </TableCell>
                <TableCell className="text-sm dark:hover:text-black">
                  {contact.estimatedAmount ? (
                    <span className="text-purple-600">
                      ${contact.estimatedAmount.value.toLocaleString()} {contact.estimatedAmount.currency}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredContacts.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-transparent">
            <p className="text-gray-500 dark:text-slate-400">No se encontraron contactos</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-transparent border-t border-gray-200 dark:border-slate-800 px-8 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Mostrando {filteredContacts.length} de {contacts.length} contactos
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}