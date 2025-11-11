'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ChevronLeft,
  Save,
  Info
} from 'lucide-react';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

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

interface CrearCampanaProps {
  onBack: () => void;
  onSave: (campaign: any) => void;
}

export function CrearCampana({ onBack, onSave }: CrearCampanaProps) {
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

  const handleCreateCampaign = () => {
    const newCampaign = {
      id: Date.now().toString(),
      name: campaignData.name,
      status: 'draft' as const,
      filters: [],
      recipients: selectedContacts.length,
      template: campaignData.template,
      createdAt: new Date().toLocaleDateString('es-ES'),
      startDate: campaignData.date,
    };
    onSave(newCampaign);
  };

  return (
    <div className="bg-gray-50 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl mb-2">Crear nueva campaña</h1>
        <p className="text-sm text-gray-500">
          Configura una nueva campaña de mensajes. Completa los detalles abajo para comenzar.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nombre de la campaña</Label>
                <Input
                  id="campaign-name"
                  placeholder="Ingresa el nombre de la campaña"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="h-12"
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
                    className="h-12"
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
                    className="h-12 bg-gray-50"
                  />
                </div>
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <Label htmlFor="template">Seleccionar plantilla</Label>
                <Select value={campaignData.template} onValueChange={(value) => setCampaignData({ ...campaignData, template: value })}>
                  <SelectTrigger className="h-12">
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
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-xs text-gray-500 mb-4">
                  Selecciona una plantilla para ver la vista previa en formato WhatsApp
                </p>
                <div 
                  className="rounded-lg p-6 relative min-h-[300px]" 
                  style={{
                    backgroundImage: 'linear-gradient(rgba(228, 221, 213, 0.3), rgba(228, 221, 213, 0.3)), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                    backgroundColor: '#e4ddd5'
                  }}
                >
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-sm">
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
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Label className="text-base">Filtros</Label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 mb-1">
                      <span className="font-semibold">Usuarios alcanzados: {selectedContacts.length} / 5000</span>
                    </p>
                    <p className="text-yellow-700 text-xs mb-2">
                      Límite diario: 800 mensajes
                    </p>
                    <p className="text-xs">
                      Costo aprox.: <span className="font-semibold">US$ 170.00</span>
                    </p>
                    <p className="text-purple-600 text-xs mt-2">
                      <a href="#" className="underline">Ampliar límites diarios de WhatsApp</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipients List */}
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedContacts.length === mockContacts.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm cursor-pointer">Seleccionar todos</Label>
                  </div>
                  <span className="text-xs text-gray-500">
                    {selectedContacts.length} seleccionados
                  </span>
                </div>
                
                <ScrollArea className="h-[500px]">
                  {mockContacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                      onClick={() => handleSelectContact(contact.id, !selectedContacts.includes(contact.id))}
                    >
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                      />
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-500 text-white">
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
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Guardar borrador
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateCampaign}
            disabled={!campaignData.name || selectedContacts.length === 0}
          >
            Crear campaña
          </Button>
        </div>
      </div>
    </div>
  );
}
