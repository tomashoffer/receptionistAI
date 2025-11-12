'use client';

import { useState } from 'react';
import { Building2, Plus, ChevronDown, Edit, Trash2, Check, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useUserStore, type Business } from '../stores/userStore';

const businessTypeLabels: Record<string, string> = {
  'hair_salon': 'Peluquería',
  'restaurant': 'Restaurante',
  'medical_clinic': 'Clínica Médica',
  'dental_clinic': 'Clínica Dental',
  'fitness_center': 'Gimnasio',
  'beauty_salon': 'Salón de Belleza',
  'law_firm': 'Estudio Jurídico',
  'consulting': 'Consultoría',
  'real_estate': 'Inmobiliaria',
  'automotive': 'Taller Automotriz',
  'hotel': 'Hotel',
  'other': 'Otro'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  'active': { label: 'Activo', color: 'text-green-600' },
  'paused': { label: 'Pausado', color: 'text-yellow-600' },
  'inactive': { label: 'Inactivo', color: 'text-gray-400' }
};

const industries = [
  'Salud',
  'Belleza',
  'Gastronomía',
  'Fitness',
  'Educación',
  'Legal',
  'Automotriz',
  'Inmobiliaria',
  'Veterinaria',
  'Spa & Wellness',
  'Consultoría',
  'Otro'
];

export function CreateBusinessDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    description: '',
    industry: '',
    startHour: '09:00',
    endHour: '18:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating business:', formData);
    setOpen(false);
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      description: '',
      industry: '',
      startHour: '09:00',
      endHour: '18:00'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Crear nuevo negocio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Crear nuevo negocio</DialogTitle>
          <DialogDescription>
            Completa la información de tu negocio para configurar tu Recepcionista AI
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] pr-2">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase text-gray-500 tracking-wider">Información Básica</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del Negocio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Clínica Dental Dr. García"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Número de Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+54 9 11 2345-6789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contacto@tunegocio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="www.tunegocio.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industria / Rubro <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Selecciona un rubro" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Av. Corrientes 1234, CABA"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente tu negocio y los servicios que ofreces..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Rango Horario */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase text-gray-500 tracking-wider">Rango Horario</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startHour">Horario de Apertura</Label>
                <Input
                  id="startHour"
                  type="time"
                  value={formData.startHour}
                  onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endHour">Horario de Cierre</Label>
                <Input
                  id="endHour"
                  type="time"
                  value={formData.endHour}
                  onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Crear negocio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BusinessSelector() {
  const { activeBusiness, setActiveBusiness, businesses } = useUserStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2.5 min-w-[240px] justify-between hover:bg-gray-50 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <p className="text-sm truncate">
                  {activeBusiness?.name || 'Seleccionar negocio'}
                </p>
                {activeBusiness && (
                  <p className="text-xs text-gray-500">
                    {businessTypeLabels[activeBusiness.type] || activeBusiness.industry}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[360px] z-[100]">
          <DropdownMenuLabel className="flex items-center justify-between py-2.5 px-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Mis Negocios</span>
            <span className="text-xs text-gray-400">
              {businesses.length} {businesses.length === 1 ? 'negocio' : 'negocios'}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {businesses.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No hay negocios creados</p>
              <p className="text-xs text-gray-400">Crea tu primer negocio para comenzar</p>
            </div>
          ) : (
            <div className="max-h-[450px] overflow-y-auto py-1.5">
              {businesses.map((business) => {
                const isActive = activeBusiness?.id === business.id;
                const statusInfo = statusLabels[business.status] || { label: 'Activo', color: 'text-green-600' };
                const stats = business.stats || { conversations: 0, appointments: 0, automation: 0 };
                
                return (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() => {
                      setActiveBusiness(business);
                    }}
                    className={`flex items-start gap-3 cursor-pointer px-3.5 py-3 my-1 mx-1.5 rounded-md focus:bg-purple-50 ${
                      isActive ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-purple-600' : 'bg-purple-100'
                    }`}>
                      <span className={`text-sm ${
                        isActive ? 'text-white' : 'text-purple-700'
                      }`}>
                        {business.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center">
                      <div className="flex items-center justify-center gap-2 mb-0.5">
                        <p className="text-sm truncate">{business.name}</p>
                        {isActive && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-1.5">
                        <span>{businessTypeLabels[business.industry] || business.industry}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Circle className={`w-1.5 h-1.5 fill-current ${statusInfo.color}`} />
                          <span className={statusInfo.color}>{statusInfo.label}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                        <span>{stats.conversations} conv.</span>
                        <span>{stats.appointments} citas</span>
                        <span className="text-purple-600">{stats.automation}% auto.</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-purple-600 cursor-pointer px-3.5 py-3 mx-1.5 my-1 rounded-md focus:text-purple-600"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Crear nuevo negocio</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Business Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Crear nuevo negocio</DialogTitle>
            <DialogDescription>
              Completa la información de tu negocio para configurar tu Recepcionista AI
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Creating business from selector');
            setDialogOpen(false);
          }} className="space-y-6">{/* Removed overflow-y-auto */}
            {/* Same form content as before */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase text-gray-500 tracking-wider">Información Básica</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name-dialog">
                  Nombre del Negocio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name-dialog"
                  placeholder="Ej: Clínica Dental Dr. García"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-dialog">
                    Número de Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone-dialog"
                    type="tel"
                    placeholder="+54 9 11 2345-6789"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-dialog">Email</Label>
                  <Input
                    id="email-dialog"
                    type="email"
                    placeholder="contacto@tunegocio.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website-dialog">Sitio Web</Label>
                  <Input
                    id="website-dialog"
                    type="url"
                    placeholder="www.tunegocio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry-dialog">
                    Industria / Rubro <span className="text-red-500">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="industry-dialog">
                      <SelectValue placeholder="Selecciona un rubro" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-dialog">Dirección</Label>
                <Input
                  id="address-dialog"
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-dialog">Descripción</Label>
                <Textarea
                  id="description-dialog"
                  placeholder="Describe brevemente tu negocio y los servicios que ofreces..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm uppercase text-gray-500 tracking-wider">Rango Horario</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startHour-dialog">Horario de Apertura</Label>
                  <Input
                    id="startHour-dialog"
                    type="time"
                    defaultValue="09:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endHour-dialog">Horario de Cierre</Label>
                  <Input
                    id="endHour-dialog"
                    type="time"
                    defaultValue="18:00"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Crear negocio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}