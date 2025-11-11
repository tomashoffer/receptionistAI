'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Info, AlertCircle } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';

export function ConfiguracionAsistente() {
  const [config, setConfig] = useState({
    estado: 'activado',
    horarios: 'Mostrar horarios',
    reactivar: '1',
    zonaHoraria: 'uruguay',
    email: 'ejemplo@gmail.com',
    telefono: '',
    latitud: '-34.8420106787080831',
    longitud: '-55.0193340658593654',
    mensajePausa: '',
    segundoMensaje: false
  });

  const [seguimientos, setSeguimientos] = useState([
    { tiempo: 'No definido', primero: false, segundo: false, primerValor: 'en-24-horas', segundoValor: 'no-enviar' },
    { tiempo: 'El mismo día', primero: true, segundo: true, primerValor: 'en-1-hora', segundoValor: 'en-30-min' },
    { tiempo: 'Entre 1 y 3 días', primero: true, segundo: true, primerValor: 'en-8-horas', segundoValor: 'en-4-horas' },
    { tiempo: 'Entre 3 días y 1 semana', primero: true, segundo: true, primerValor: 'en-12-horas', segundoValor: 'en-6-horas' },
    { tiempo: 'Más de una semana', primero: true, segundo: true, primerValor: 'en-18-horas', segundoValor: 'en-6-horas' }
  ]);

  const handleToggleSeguimiento = (index: number, tipo: 'primero' | 'segundo') => {
    const newSeguimientos = [...seguimientos];
    newSeguimientos[index][tipo] = !newSeguimientos[index][tipo];
    setSeguimientos(newSeguimientos);
  };

  const handleSeguimientoChange = (index: number, tipo: 'primerValor' | 'segundoValor', value: string) => {
    const newSeguimientos = [...seguimientos];
    newSeguimientos[index][tipo] = value;
    setSeguimientos(newSeguimientos);
  };

  return (
    <div className="bg-gray-50 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Comportamiento del asistente</h1>
            <p className="text-sm text-gray-500">
              Aquí puedes configurar el comportamiento del asistente virtual. Establece los horarios de funcionamiento y programa mensajes de seguimiento para tus usuarios.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 px-3 py-1">Activado</Badge>
            <BusinessSelector />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Estado */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Estado</Label>
            <div className="col-span-2">
              <Select value={config.estado} onValueChange={(value) => setConfig({ ...config, estado: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activado">Activado</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horarios de funcionamiento */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Horarios de funcionamiento</Label>
            <div className="col-span-2">
              <Select value={config.horarios} onValueChange={(value) => setConfig({ ...config, horarios: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mostrar horarios">Mostrar horarios</SelectItem>
                  <SelectItem value="24/7">24/7</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reactivar conversación */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Reactivar la conversación después de</Label>
            <div className="col-span-2">
              <Select value={config.reactivar} onValueChange={(value) => setConfig({ ...config, reactivar: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 día</SelectItem>
                  <SelectItem value="2">2 días</SelectItem>
                  <SelectItem value="3">3 días</SelectItem>
                  <SelectItem value="7">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Zona horaria */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Zona horaria</Label>
            <div className="col-span-2">
              <Select value={config.zonaHoraria} onValueChange={(value) => setConfig({ ...config, zonaHoraria: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uruguay">Hora de Uruguay (UTC-3)</SelectItem>
                  <SelectItem value="argentina">Hora de Argentina (UTC-3)</SelectItem>
                  <SelectItem value="brasil">Hora de Brasil (UTC-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email para notificaciones */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Email para recibir notificaciones</Label>
            <div className="col-span-2">
              <Input 
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Números de teléfono */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Números de teléfono para notificaciones</Label>
            <div className="col-span-2">
              <Input 
                placeholder="Agregar número y presionar espacio"
                value={config.telefono}
                onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Latitud */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Latitud para el clima</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="col-span-2">
              <Input 
                value={config.latitud}
                onChange={(e) => setConfig({ ...config, latitud: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Longitud */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Longitud para el clima</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="col-span-2">
              <Input 
                value={config.longitud}
                onChange={(e) => setConfig({ ...config, longitud: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Mensaje de pausa */}
          <div className="grid grid-cols-3 gap-4 items-start">
            <div className="flex items-center gap-2 pt-2">
              <Label>Mensaje de pausa</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="col-span-2 space-y-2">
              <Textarea 
                placeholder="Escribe tu mensaje aquí..."
                value={config.mensajePausa}
                onChange={(e) => setConfig({ ...config, mensajePausa: e.target.value })}
                className="bg-white min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Define aquí el mensaje que enviará el asistente virtual cuando le exceda el conocimiento.
                </p>
                <span className="text-xs text-gray-400">191 / 1000</span>
              </div>
            </div>
          </div>

          {/* Segundo mensaje de pausa */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Segundo mensaje de pausa</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch 
                checked={config.segundoMensaje}
                onCheckedChange={(checked) => setConfig({ ...config, segundoMensaje: checked })}
              />
              <span className="text-sm text-gray-600">
                {config.segundoMensaje ? 'Activar segundo mensaje' : 'Activar segundo mensaje'}
              </span>
            </div>
          </div>

          {/* Tabla de horarios de seguimiento */}
          <div className="space-y-4 mt-8">
            <h2 className="text-lg">Tabla de horarios de seguimiento</h2>
            <p className="text-sm text-gray-600">
              Establece el tiempo de horas para enviar el mensaje de seguimiento después de que el usuario no haya respondido.
            </p>

            {/* Nota importante */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-orange-900">
                    <span className="font-semibold">Nota importante:</span> WhatsApp API tiene un límite de 24 horas para enviar mensajes después de la última interacción del usuario.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
                <div className="p-4 border-r border-gray-200">
                  <p className="text-sm">Tiempo para fecha consultada</p>
                </div>
                <div className="p-4 border-r border-gray-200 col-span-2">
                  <p className="text-sm">1° Seguimiento</p>
                </div>
                <div className="p-4">
                  <p className="text-sm">2° Seguimiento</p>
                </div>
              </div>

              {seguimientos.map((seg, index) => (
                <div key={index} className="grid grid-cols-4 border-b border-gray-200 last:border-b-0">
                  <div className="p-4 border-r border-gray-200 flex items-center">
                    <p className="text-sm">{seg.tiempo}</p>
                  </div>
                  <div className="p-4 border-r border-gray-200 flex items-center gap-3">
                    <Switch 
                      checked={seg.primero}
                      onCheckedChange={() => handleToggleSeguimiento(index, 'primero')}
                    />
                  </div>
                  <div className="p-4 border-r border-gray-200">
                    <Select 
                      value={seg.primerValor}
                      onValueChange={(value) => handleSeguimientoChange(index, 'primerValor', value)}
                      disabled={!seg.primero}
                    >
                      <SelectTrigger className={!seg.primero ? 'bg-gray-50' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-24-horas">Seguimiento en 24 horas</SelectItem>
                        <SelectItem value="en-1-hora">Seguimiento en 1 hora</SelectItem>
                        <SelectItem value="en-4-horas">Seguimiento en 4 horas</SelectItem>
                        <SelectItem value="en-6-horas">Seguimiento en 6 horas</SelectItem>
                        <SelectItem value="en-8-horas">Seguimiento en 8 horas</SelectItem>
                        <SelectItem value="en-12-horas">Seguimiento en 12 horas</SelectItem>
                        <SelectItem value="en-18-horas">Seguimiento en 18 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <Switch 
                      checked={seg.segundo}
                      onCheckedChange={() => handleToggleSeguimiento(index, 'segundo')}
                    />
                    <Select 
                      value={seg.segundoValor}
                      onValueChange={(value) => handleSeguimientoChange(index, 'segundoValor', value)}
                      disabled={!seg.segundo}
                    >
                      <SelectTrigger className={!seg.segundo ? 'bg-gray-50' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-enviar">No enviar seguimiento</SelectItem>
                        <SelectItem value="en-30-min">Seguimiento en 30 min</SelectItem>
                        <SelectItem value="en-1-hora">Seguimiento en 1 hora</SelectItem>
                        <SelectItem value="en-4-horas">Seguimiento en 4 horas</SelectItem>
                        <SelectItem value="en-6-horas">Seguimiento en 6 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
