'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Plus, 
  Building2, 
  Phone, 
  Mail,  
  MapPin, 
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  MessageSquare,
  TrendingUp,
  Pause,
  Play
} from 'lucide-react';
import { PageHeaderResponsive } from './layout/PageHeaderResponsive';
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
import { useUserStore, type Business, type BusinessStatus } from '../stores/userStore';
import { BusinessDialog } from './shared/BusinessDialog';

const industries = [
  { value: 'medical_clinic', label: 'Salud' },
  { value: 'beauty_salon', label: 'Belleza' },
  { value: 'restaurant', label: 'Gastronomía' },
  { value: 'fitness_center', label: 'Fitness' },
  { value: 'hair_salon', label: 'Peluquería' },
  { value: 'dental_clinic', label: 'Clínica Dental' },
  { value: 'law_firm', label: 'Legal' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'real_estate', label: 'Inmobiliaria' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'other', label: 'Otro' }
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

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700',
    trial: 'bg-blue-100 text-blue-700'
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    paused: 'Pausado',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
    trial: 'Prueba'
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
                <Badge className={statusColors[business.status] || statusColors.inactive}>
                  {statusLabels[business.status] || business.status}
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
              <span>{industries.find(i => i.value === business.industry)?.label || business.industry}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{business.phone_number || (business as any).phone}</span>
            </div>
            {(business as any).email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{(business as any).email}</span>
              </div>
            )}
            {(business as any).address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{(business as any).address}</span>
              </div>
            )}
            {(business.workingHours || business.business_hours) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {business.workingHours?.start || business.business_hours?.monday?.open || 'N/A'} - {business.workingHours?.end || business.business_hours?.monday?.close || 'N/A'}
                </span>
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
  const { setBusinesses, setActiveBusiness } = useUserStore();

  const loadBusinesses = async () => {
    try {
      const { apiService } = await import('../services/api.service');
      const response = (await apiService.getBusinesses()) as any;
      const list = Array.isArray(response) ? response : response ? [response] : [];
      setBusinesses(list);
      if (list.length > 0 && !useUserStore.getState().activeBusiness) {
        setActiveBusiness(list[0]);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
    }
  };

  const handleSuccess = () => {
    loadBusinesses();
  };

  return (
    <>
      <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Crear nuevo negocio
      </Button>
      <BusinessDialog 
        business={null} 
        open={open} 
        onOpenChange={setOpen} 
        onSuccess={handleSuccess}
      />
    </>
  );
}

export function MisNegocios({ setActiveView }: { setActiveView?: (view: string) => void }) {
  const { businesses, setBusinesses, activeBusiness, setActiveBusiness } = useUserStore();
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadBusinesses = async () => {
    try {
      const { apiService } = await import('../services/api.service');
      const response = (await apiService.getBusinesses()) as any;
      const list = Array.isArray(response) ? response : response ? [response] : [];
      setBusinesses(list);
      if (list.length > 0 && !activeBusiness) {
        setActiveBusiness(list[0]);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadBusinesses();
    setEditDialogOpen(false);
    setEditingBusiness(null);
  };

  const handleDelete = async (business: Business) => {
    try {
      const { apiService } = await import('../services/api.service');
      await apiService.deleteBusiness(business.id);
      
      // Update local state
      const updatedBusinesses = businesses.filter((b: Business) => b.id !== business.id);
      setBusinesses(updatedBusinesses);
      
      // If deleted business was active, set a new one
      if (activeBusiness?.id === business.id) {
        setActiveBusiness(updatedBusinesses[0] || null);
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el negocio');
    }
  };

  const handleToggleStatus = async (business: Business) => {
    try {
      const { apiService } = await import('../services/api.service');
      const newStatus = business.status === 'active' ? 'paused' : 'active';
      
      // TODO: Implementar endpoint para actualizar status en el backend
      // await apiService.updateBusinessStatus(business.id, newStatus);
      
      // Update local state
      setBusinesses(businesses.map((b: Business) => 
      b.id === business.id 
          ? { ...b, status: newStatus as Business['status'] }
        : b
    ));
      
      // Si es el business activo, actualizarlo también
      if (activeBusiness?.id === business.id) {
        setActiveBusiness({ ...activeBusiness, status: newStatus as Business['status'] });
      }
    } catch (error) {
      console.error('Error toggling business status:', error);
    }
  };

  const handleViewDashboard = (business: Business) => {
    setActiveBusiness(business);
    if (setActiveView) {
      setActiveView('Dashboard');
    }
  };

  const handleConfigure = (business: Business) => {
    setEditingBusiness(business);
    setEditDialogOpen(true);
  };

  return (
    <div className="bg-gray-50">
      <PageHeaderResponsive
        title="Mis Negocios"
        subtitle="Gestiona todos tus negocios y sus Recepcionistas AI desde un solo lugar"
        showBusinessSelector={false}
        actions={<CreateBusinessDialog />}
      >
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
                    {businesses.filter((b: Business) => b.status === 'active').length}
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
                    {businesses.reduce((acc: number, b: Business) => acc + (b.stats?.conversations || 0), 0)}
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
                    {businesses.length > 0 ? Math.round(businesses.reduce((acc: number, b: Business) => acc + (b.stats?.automation || 0), 0) / businesses.length) : 0}%
                  </p>
                </div>
                <Settings className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHeaderResponsive>

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
              {businesses.map((business: Business) => (
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

      {/* Edit Business Dialog */}
      <BusinessDialog 
        business={editingBusiness} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}