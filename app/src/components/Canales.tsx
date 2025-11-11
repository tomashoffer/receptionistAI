'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { BusinessSelector } from './BusinessSelector';
import { 
  Calendar,
  MessageCircle,
  Facebook as FacebookIcon,
  Instagram,
  CheckCircle2,
  Trash2,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Separator } from './ui/separator';

interface Channel {
  id: string;
  name: string;
  type: 'whatsapp-api' | 'whatsapp-qr' | 'facebook' | 'instagram' | 'google-calendar';
  icon: any;
  iconColor: string;
  bgColor: string;
  connected: boolean;
  connectionInfo?: {
    phoneNumber?: string;
    username?: string;
    email?: string;
    status?: string;
    lastSync?: string;
  };
  badges?: Array<{
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  description: string;
}

export function Canales() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'whatsapp-qr',
      name: 'WhatsApp - QR',
      type: 'whatsapp-qr',
      icon: MessageCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      connected: false,
      description: 'No has podido conectar aún un número de WhatsApp conectado mediante la API oficial'
    },
    {
      id: 'whatsapp-api',
      name: 'WhatsApp - API',
      type: 'whatsapp-api',
      icon: MessageCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      connected: true,
      connectionInfo: {
        phoneNumber: '+598 92 233 220',
        status: 'Conectado'
      },
      badges: [
        { text: 'Número aprobado', variant: 'secondary' },
        { text: 'OOO: conversacionActiva', variant: 'destructive' }
      ],
      description: 'Conectado'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      type: 'facebook',
      icon: FacebookIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      connected: true,
      connectionInfo: {
        username: '@Estanciacab',
        status: 'Conectado'
      },
      description: 'Conectado'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'instagram',
      icon: Instagram,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      connected: true,
      connectionInfo: {
        username: '@ch.estancia',
        status: 'Conectado'
      },
      description: 'Conectado'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      type: 'google-calendar',
      icon: Calendar,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      connected: false,
      description: 'Sincroniza automáticamente tus citas con Google Calendar'
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isExpandedChannel, setIsExpandedChannel] = useState<string | null>(null);
  const [connectionData, setConnectionData] = useState({
    phoneNumber: '',
    apiKey: '',
    username: '',
    email: '',
    password: ''
  });

  const handleConnectChannel = () => {
    if (!selectedChannel) return;

    // Aquí iría la lógica de conexión real con el backend
    console.log('Connecting channel:', selectedChannel.type, connectionData);

    setChannels(channels.map(channel => 
      channel.id === selectedChannel.id 
        ? { 
            ...channel, 
            connected: true,
            connectionInfo: {
              phoneNumber: connectionData.phoneNumber || undefined,
              username: connectionData.username || undefined,
              email: connectionData.email || undefined,
              status: 'Conectado'
            }
          }
        : channel
    ));

    setIsConnectDialogOpen(false);
    setConnectionData({
      phoneNumber: '',
      apiKey: '',
      username: '',
      email: '',
      password: ''
    });
  };

  const handleDisconnectChannel = () => {
    if (!selectedChannel) return;

    setChannels(channels.map(channel => 
      channel.id === selectedChannel.id 
        ? { 
            ...channel, 
            connected: false,
            connectionInfo: undefined,
            badges: undefined
          }
        : channel
    ));

    setIsDisconnectDialogOpen(false);
  };

  const openConnectDialog = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsConnectDialogOpen(true);
  };

  const openDisconnectDialog = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsDisconnectDialogOpen(true);
  };

  const toggleExpandChannel = (channelId: string) => {
    setIsExpandedChannel(isExpandedChannel === channelId ? null : channelId);
  };

  const renderConnectionForm = () => {
    if (!selectedChannel) return null;

    switch (selectedChannel.type) {
      case 'whatsapp-api':
      case 'whatsapp-qr':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de teléfono</Label>
              <Input
                id="phoneNumber"
                placeholder="+54 9 11 1234-5678"
                value={connectionData.phoneNumber}
                onChange={(e) => setConnectionData({ ...connectionData, phoneNumber: e.target.value })}
              />
            </div>
            {selectedChannel.type === 'whatsapp-api' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key de WhatsApp Business</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Ingresa tu API Key"
                  value={connectionData.apiKey}
                  onChange={(e) => setConnectionData({ ...connectionData, apiKey: e.target.value })}
                />
              </div>
            )}
            {selectedChannel.type === 'whatsapp-qr' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <p className="text-sm text-gray-400">QR Code aparecerá aquí</p>
                </div>
                <p className="text-sm text-gray-600">Escanea el código QR con WhatsApp</p>
              </div>
            )}
          </div>
        );

      case 'facebook':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fbUsername">Nombre de usuario o ID de página</Label>
              <Input
                id="fbUsername"
                placeholder="@tupagina"
                value={connectionData.username}
                onChange={(e) => setConnectionData({ ...connectionData, username: e.target.value })}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Autorización requerida</p>
                  <p>Serás redirigido a Facebook para autorizar el acceso a tu página.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="igUsername">Nombre de usuario de Instagram</Label>
              <Input
                id="igUsername"
                placeholder="@tuusuario"
                value={connectionData.username}
                onChange={(e) => setConnectionData({ ...connectionData, username: e.target.value })}
              />
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-pink-800">
                  <p className="font-medium mb-1">Cuenta empresarial requerida</p>
                  <p>Asegúrate de tener una cuenta de Instagram Business vinculada a Facebook.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'google-calendar':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Google</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@gmail.com"
                value={connectionData.email}
                onChange={(e) => setConnectionData({ ...connectionData, email: e.target.value })}
              />
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Permisos de calendario</p>
                  <p>Serás redirigido a Google para autorizar el acceso a tu calendario.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-1">Canales disponibles</h1>
          <p className="text-sm text-gray-600">
            Aquí te presentamos todos los canales disponibles, los cuales podrás conectar fácilmente apretando el botón de conectar.
          </p>
        </div>
        <BusinessSelector />
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isExpanded = isExpandedChannel === channel.id;

            return (
              <Card key={channel.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg ${channel.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${channel.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-medium">{channel.name}</h3>
                            {channel.connected && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          
                          {/* Connection Info */}
                          {channel.connectionInfo && (
                            <div className="text-sm text-gray-600 mb-2">
                              {channel.connectionInfo.phoneNumber && (
                                <p>{channel.connectionInfo.phoneNumber}</p>
                              )}
                              {channel.connectionInfo.username && (
                                <p>{channel.connectionInfo.username}</p>
                              )}
                              {channel.connectionInfo.email && (
                                <p>{channel.connectionInfo.email}</p>
                              )}
                            </div>
                          )}

                          {/* Badges */}
                          {channel.badges && channel.badges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {channel.badges.map((badge, index) => (
                                <Badge 
                                  key={index} 
                                  variant={badge.variant}
                                  className="text-xs"
                                >
                                  {badge.text}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Description */}
                          <p className={`text-sm ${channel.connected ? 'text-green-600' : 'text-gray-500'}`}>
                            {channel.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {channel.connected ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDisconnectDialog(channel)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                              {(channel.type === 'whatsapp-api' || channel.type === 'whatsapp-qr') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpandChannel(channel.id)}
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openConnectDialog(channel)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Conectar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && channel.type === 'whatsapp-api' && (
                    <>
                      <Separator className="my-4" />
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-3">Generador de botón flotante de WhatsApp</h4>
                        <p className="text-sm text-gray-600">
                          Crea un botón personalizado para tu sitio web en segundos
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog: Conectar Canal */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Conectar {selectedChannel?.name}</DialogTitle>
            <DialogDescription>
              Configura la conexión con {selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderConnectionForm()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConnectChannel}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Desconectar Canal */}
      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desconectar {selectedChannel?.name}</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas desconectar {selectedChannel?.name}? 
              Dejarás de recibir mensajes de este canal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDisconnectChannel}
              variant="destructive"
            >
              Desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
