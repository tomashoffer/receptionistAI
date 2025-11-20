'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Business, useUserStore } from '../../stores/userStore';

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

interface BusinessDialogProps {
  business?: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BusinessDialog({ business, open, onOpenChange, onSuccess }: BusinessDialogProps) {
  const { updateBusiness: updateBusinessInStore } = useUserStore();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load business data when editing
  useEffect(() => {
    if (business && open) {
      // Map business data to form format
      const phone = business.phone_number || (business as any).phone || '';
      const workingHours = business.business_hours || (business as any).workingHours || {};
      
      setFormData({
        name: business.name || '',
        phone: phone,
        email: (business as any).email || '',
        website: (business as any).website || '',
        address: (business as any).address || '',
        description: (business as any).description || '',
        industry: business.industry || '',
        startHour: workingHours.start || '09:00',
        endHour: workingHours.end || '18:00'
      });
    } else if (!business && open) {
      // Reset form for new business
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
    }
  }, [business, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { apiService } = await import('../../services/api.service');
      
      // Normalize website URL (add protocol if missing)
      let websiteUrl = formData.website?.trim();
      if (websiteUrl && !websiteUrl.match(/^https?:\/\//i)) {
        websiteUrl = `https://${websiteUrl}`;
      }

      if (business) {
        // Update existing business
        const updateData: any = {
          name: formData.name,
          phone_number: formData.phone,
          description: formData.description || undefined,
          industry: formData.industry,
        };
        // Add optional fields
        if (formData.email) updateData.email = formData.email;
        if (formData.address) updateData.address = formData.address;
        if (websiteUrl) updateData.website = websiteUrl;
        
        const updatedBusiness = await apiService.updateBusiness(business.id, updateData);
        
        // Update the store with the updated business data
        // This will update both businesses array and activeBusiness if it's the active one
        updateBusinessInStore(business.id, updatedBusiness);
      } else {
        // Create new business - CreateBusinessDto expects phone_number
        const createData = {
          name: formData.name,
          phone_number: formData.phone,
          email: formData.email || undefined,
          website: websiteUrl || undefined,
          address: formData.address || undefined,
          description: formData.description || undefined,
          industry: formData.industry,
        };
        
        await apiService.createBusiness(createData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving business:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el negocio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>{business ? 'Editar negocio' : 'Crear nuevo negocio'}</DialogTitle>
          <DialogDescription>
            Completa la información de tu negocio para configurar tu Recepcionista AI
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-4">
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
                  type="text"
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
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
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
          </div>

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (business ? 'Guardar cambios' : 'Crear negocio')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

