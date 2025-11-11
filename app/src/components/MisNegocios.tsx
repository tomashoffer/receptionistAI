'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Pause,
  Play
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useUserStore, type Business } from '../stores/userStore';

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

interface BusinessCardProps {
  business: Business;
  onEdit: (business: Business) => void;
  onDelete: (business: Business) => void;
  onToggleStatus: (business: Business) => void;
  onViewDashboard: (business: Business) => void;
  onConfigure: (business: Business) => void;
}

function BusinessCard({ 
  business, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onViewDashboard, 
  onConfigure 
}: BusinessCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-700'
  };

  const statusLabels = {
    active: 'Activo',
    paused: 'Pausado',
    inactive: 'Inactivo'
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-purple-500 text-white">
                  {business.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg mb-1">{business.name}</CardTitle>
                <Badge className={statusColors[business.status]}>
                  {statusLabels[business.status]}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={() => onEdit(business)}>
                  <Edit className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => onToggleStatus(business)}>
                  {business.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Activar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-red-600" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{business.industry}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{business.phone}</span>
            </div>
            {business.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{business.email}</span>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{business.address}</span>
              </div>
            )}
            {business.workingHours && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{business.workingHours.start} - {business.workingHours.end}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Conversaciones</p>
              <p className="text-lg">{business.stats?.conversations || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Turnos</p>
              <p className="text-lg">{business.stats?.appointments || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Automatización</p>
              <p className="text-lg text-purple-600">{business.stats?.automation || 0}%</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onConfigure(business)}>
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => onViewDashboard(business)}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por eliminar <strong>{business.name}</strong>. Esta acción no se puede deshacer.
              Todos los datos del negocio, configuraciones del asistente y conversaciones se eliminarán permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(business);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar negocio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CreateBusinessDialog() {
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Crear nuevo negocio</DialogTitle>
          <DialogDescription>
            Completa la información de tu negocio para configurar tu Recepcionista AI
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-2">
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

export function MisNegocios({ setActiveView }: { setActiveView?: (view: string) => void }) {
  const { businesses, setBusinesses, activeBusiness, setActiveBusiness } = useUserStore();
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    // TODO: Open edit dialog
    console.log('Edit business:', business.name);
  };

  const handleDelete = (business: Business) => {
    setBusinesses(businesses.filter(b => b.id !== business.id));
    if (activeBusiness?.id === business.id) {
      setActiveBusiness(businesses.filter(b => b.id !== business.id)[0] || null);
    }
  };

  const handleToggleStatus = (business: Business) => {
    setBusinesses(businesses.map(b => 
      b.id === business.id 
        ? { ...b, status: b.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' | 'inactive' }
        : b
    ));
  };

  const handleViewDashboard = (business: Business) => {
    setActiveBusiness(business);
    if (setActiveView) {
      setActiveView('Dashboard');
    }
  };

  const handleConfigure = (business: Business) => {
    setActiveBusiness(business);
    if (setActiveView) {
      setActiveView('Configuración');
    }
  };

  return (
    <div className="bg-gray-50 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-2">Mis Negocios</h1>
            <p className="text-sm text-gray-500">
              Gestiona todos tus negocios y sus Recepcionistas AI desde un solo lugar
            </p>
          </div>
          <CreateBusinessDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Negocios</p>
                  <p className="text-2xl mt-1">{businesses.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Negocios Activos</p>
                  <p className="text-2xl mt-1">
                    {businesses.filter(b => b.status === 'active').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversaciones Totales</p>
                  <p className="text-2xl mt-1">
                    {businesses.reduce((acc, b) => acc + (b.stats?.conversations || 0), 0)}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Automatización Promedio</p>
                  <p className="text-2xl mt-1">
                    {businesses.length > 0 ? Math.round(businesses.reduce((acc, b) => acc + (b.stats?.automation || 0), 0) / businesses.length) : 0}%
                  </p>
                </div>
                <Settings className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Grid */}
      <div className="flex-1 p-8">
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg mb-2">No tienes negocios creados</h3>
            <p className="text-sm text-gray-500 mb-4">Crea tu primer negocio para comenzar</p>
            <CreateBusinessDialog />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-purple-600">{activeBusiness?.name}</span> está seleccionado como negocio activo
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard 
                  key={business.id} 
                  business={business}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onViewDashboard={handleViewDashboard}
                  onConfigure={handleConfigure}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}