import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Calendar, Phone, Mail, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalAppointments: number;
  lastAppointment: string;
  nextAppointment?: string;
  status: 'active' | 'pending' | 'inactive';
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'María García',
    phone: '+52 55 1234 5678',
    email: 'maria.garcia@email.com',
    totalAppointments: 5,
    lastAppointment: '2025-11-10',
    nextAppointment: '2025-11-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    phone: '+52 55 8765 4321',
    email: 'carlos.rodriguez@email.com',
    totalAppointments: 3,
    lastAppointment: '2025-11-10',
    nextAppointment: '2025-11-18',
    status: 'active',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    phone: '+52 55 2468 1357',
    email: 'ana.martinez@email.com',
    totalAppointments: 1,
    lastAppointment: '2025-10-15',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Luis Fernández',
    phone: '+52 55 9876 5432',
    email: 'luis.fernandez@email.com',
    totalAppointments: 8,
    lastAppointment: '2025-11-09',
    nextAppointment: '2025-11-22',
    status: 'active',
  },
  {
    id: '5',
    name: 'Patricia Sánchez',
    phone: '+52 55 3698 5214',
    email: 'patricia.sanchez@email.com',
    totalAppointments: 2,
    lastAppointment: '2025-11-09',
    status: 'pending',
  },
];

export function ContactsView() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContacts = mockContacts.filter((c) => c.status === 'active').length;
  const totalAppointments = mockContacts.reduce((sum, c) => sum + c.totalAppointments, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Contactos</h1>
          <p className="text-slate-600 mt-1">
            Gestión de clientes y seguimiento de citas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Contactos</p>
                <p className="text-3xl mt-1">{mockContacts.length}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Contactos Activos</p>
                <p className="text-3xl mt-1 text-green-600">{activeContacts}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Citas</p>
                <p className="text-3xl mt-1">{totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Contactos</CardTitle>
              <CardDescription>Todos tus clientes y su historial de citas</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar contacto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Citas</TableHead>
                <TableHead>Última Cita</TableHead>
                <TableHead>Próxima Cita</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-slate-50">
                  <TableCell>{contact.name}</TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </div>
                  </TableCell>
                  <TableCell>{contact.totalAppointments}</TableCell>
                  <TableCell className="text-slate-600">{contact.lastAppointment}</TableCell>
                  <TableCell>
                    {contact.nextAppointment ? (
                      <span className="text-green-600">{contact.nextAppointment}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        contact.status === 'active'
                          ? 'default'
                          : contact.status === 'pending'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        contact.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : contact.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          : ''
                      }
                    >
                      {contact.status === 'active'
                        ? 'Activo'
                        : contact.status === 'pending'
                        ? 'Pendiente'
                        : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
