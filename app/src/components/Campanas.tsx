'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus,
  Search, 
  Filter,
  ArrowUpDown,
  ChevronLeft,
  Save,
  Info,
  Menu
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { PageHeaderResponsive } from './layout/PageHeaderResponsive';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { CrearCampana } from './CrearCampana';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'paused';
  filters: string[];
  recipients: number;
  template: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

const mockCampaigns: Campaign[] = [];

const mockContacts: Contact[] = [
  { id: '1', name: 'Ana Laura Gudynas', phone: '+59892681745' },
  { id: '2', name: 'Gabo Negri', phone: '+541154185344' },
  { id: '3', name: 'Selena', phone: '+59892480834' },
  { id: '4', name: 'Hector SILVA', phone: '+541123952168' },
  { id: '5', name: 'Aliu', phone: '+541133946678' },
  { id: '6', name: 'Mauricio/Ucrania ux', phone: '+543764884041' },
  { id: '7', name: 'Facundo', phone: '+59892315027' },
  { id: '8', name: 'Sergio Masal', phone: '+541145344500' },
  { id: '9', name: 'Vero', phone: '+541161566272' },
  { id: '10', name: 'Facundo Flores', phone: '+541156323286' }
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700'
};

const statusLabels = {
  draft: 'Borrador',
  scheduled: 'Programada',
  'in-progress': 'En progreso',
  completed: 'Completada',
  paused: 'Pausada'
};

function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: '',
    date: '',
    estimatedEnd: '',
    template: ''
  });
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(mockContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
          <Plus className="w-4 h-4" />
          Crear campaña
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear nueva campaña</DialogTitle>
          <DialogDescription>
            Configura una nueva campaña de mensajes. Completa los detalles abajo para comenzar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-6 p-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nombre de la campaña</Label>
                <Input
                  id="campaign-name"
                  placeholder="Ingresa el nombre de la campaña"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                />
              </div>

              {/* Date and Estimated End */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-date">Fecha de la campaña</Label>
                  <Input
                    id="campaign-date"
                    type="datetime-local"
                    value={campaignData.date}
                    onChange={(e) => setCampaignData({ ...campaignData, date: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Elige la fecha de y hora de inicio de la campaña.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-end">Finalización estimada</Label>
                  <Input
                    id="estimated-end"
                    type="text"
                    placeholder="--:--:--"
                    value={campaignData.estimatedEnd}
                    onChange={(e) => setCampaignData({ ...campaignData, estimatedEnd: e.target.value })}
                    disabled
                  />
                </div>
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <Label htmlFor="template">Seleccionar plantilla</Label>
                <Select value={campaignData.template} onValueChange={(value) => setCampaignData({ ...campaignData, template: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla de mensaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Plantilla de Bienvenida</SelectItem>
                    <SelectItem value="reminder">Recordatorio de Turno</SelectItem>
                    <SelectItem value="promotion">Promoción Especial</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-purple-600">
                  Puedes manejar tus plantillas <a href="#" className="underline">aquí</a>
                </p>
              </div>

              {/* Template Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  Selecciona una plantilla para ver la vista previa en formato WhatsApp
                </p>
                <div className="bg-green-50 rounded-lg p-4 relative" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23d4f4dd\'/%3E%3C/svg%3E")'
                }}>
                  <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                    <p className="text-sm text-gray-700">
                      {campaignData.template ? 
                        'Vista previa del mensaje de la plantilla seleccionada aparecerá aquí.' :
                        'Selecciona una plantilla para ver el preview'
                      }
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block text-right">10:25</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recipients */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Label>Filtros</Label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 mb-1">
                      <span className="font-semibold">Usuarios alcanzados: {selectedContacts.length} / 5000</span>
                    </p>
                    <p className="text-yellow-700 text-xs">
                      Límite diario: 800 mensajes
                    </p>
                    <p className="text-purple-600 text-xs mt-1">
                      <a href="#" className="underline">Ampliar límite con la API de WhatsApp</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipients List */}
              <div className="border border-gray-200 rounded-lg">
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedContacts.length === mockContacts.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm">Seleccionar todos</Label>
                  </div>
                  <span className="text-xs text-gray-500">
                    {selectedContacts.length} seleccionados
                  </span>
                </div>
                
                <ScrollArea className="h-[400px]">
                  {mockContacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-500 text-white text-xs">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Guardar borrador
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Crear campaña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Campanas() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isCreating, setIsCreating] = useState(false);
  const { activeBusiness } = useUserStore();

  const handleSaveCampaign = (campaign: Campaign) => {
    setCampaigns([...campaigns, campaign]);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <CrearCampana 
        onBack={() => setIsCreating(false)}
        onSave={handleSaveCampaign}
      />
    );
  }

  const stats = {
    total: campaigns.length,
    inProgress: campaigns.filter(c => c.status === 'in-progress').length,
    completed: campaigns.filter(c => c.status === 'completed').length
  };

  return (
    <div className="bg-gray-50 bg-gray-50">
      <PageHeaderResponsive
        title="Panel de campañas"
        actions={
          <Button 
            className="bg-purple-600 hover:bg-purple-700 gap-2"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Crear campaña
          </Button>
        }
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500">Total de campañas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Todas tus campañas creadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500">Campañas en progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl">{stats.inProgress}</p>
              <p className="text-xs text-gray-500 mt-1">Campañas activas en ejecución</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-500">Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-1">Campañas finalizadas con éxito</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar campaña..." className="pl-10" />
        </div>
      </PageHeaderResponsive>

      {/* Table */}
      <div className="flex-1 bg-white m-8 rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Nombre
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Estado
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Filtros
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>Destinatarios</TableHead>
              <TableHead>Plantillas</TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Creada
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Inicio
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Finalizada
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <p className="text-gray-500">No hay campañas que coincidan con la búsqueda.</p>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[campaign.status]}>
                      {statusLabels[campaign.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.filters.length > 0 ? campaign.filters.join(', ') : '-'}
                  </TableCell>
                  <TableCell>{campaign.recipients}</TableCell>
                  <TableCell>{campaign.template}</TableCell>
                  <TableCell className="text-sm text-gray-600">{campaign.createdAt}</TableCell>
                  <TableCell className="text-sm text-gray-600">{campaign.startDate || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{campaign.endDate || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}