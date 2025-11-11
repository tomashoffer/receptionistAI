import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Phone, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ConversationDetail } from './ConversationDetail';

interface CallLog {
  id: string;
  caller: string;
  phone: string;
  date: string;
  duration: string;
  status: 'success' | 'failed' | 'partial';
  hasAppointment: boolean;
}

const mockCallLogs: CallLog[] = [
  {
    id: '1',
    caller: 'María García',
    phone: '+52 55 1234 5678',
    date: '2025-11-10 14:30',
    duration: '4:12',
    status: 'success',
    hasAppointment: true,
  },
  {
    id: '2',
    caller: 'Carlos Rodríguez',
    phone: '+52 55 8765 4321',
    date: '2025-11-10 13:15',
    duration: '3:45',
    status: 'success',
    hasAppointment: true,
  },
  {
    id: '3',
    caller: 'Ana Martínez',
    phone: '+52 55 2468 1357',
    date: '2025-11-10 11:20',
    duration: '2:30',
    status: 'failed',
    hasAppointment: false,
  },
  {
    id: '4',
    caller: 'Luis Fernández',
    phone: '+52 55 9876 5432',
    date: '2025-11-09 16:45',
    duration: '5:20',
    status: 'success',
    hasAppointment: true,
  },
  {
    id: '5',
    caller: 'Patricia Sánchez',
    phone: '+52 55 3698 5214',
    date: '2025-11-09 10:30',
    duration: '3:15',
    status: 'partial',
    hasAppointment: false,
  },
];

export function ConversationsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<string | null>(null);

  const filteredLogs = mockCallLogs.filter(
    (log) =>
      log.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phone.includes(searchQuery)
  );

  if (selectedCall) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedCall(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Conversaciones
        </Button>
        <ConversationDetail callId={selectedCall} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Conversaciones</h1>
        <p className="text-slate-600 mt-1">
          Auditoría completa de todas las interacciones con tu Recepcionista AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Conversaciones</p>
                <p className="text-3xl mt-1">{mockCallLogs.length}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Exitosas</p>
                <p className="text-3xl mt-1 text-green-600">
                  {mockCallLogs.filter((log) => log.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Duración Promedio</p>
                <p className="text-3xl mt-1">3:42</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Llamadas</CardTitle>
              <CardDescription>Listado completo de interacciones recientes</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
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
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cita</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>{log.caller}</TableCell>
                  <TableCell className="text-slate-600">{log.phone}</TableCell>
                  <TableCell className="text-slate-600">{log.date}</TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'success'
                          ? 'default'
                          : log.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className={
                        log.status === 'success'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : ''
                      }
                    >
                      {log.status === 'success'
                        ? 'Exitosa'
                        : log.status === 'failed'
                        ? 'Fallida'
                        : 'Parcial'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.hasAppointment ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCall(log.id)}
                    >
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
