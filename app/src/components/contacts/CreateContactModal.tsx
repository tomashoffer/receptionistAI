'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiService } from '@/services/api.service';

interface CreateContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onSuccess: () => void;
}

export function CreateContactModal({
  open,
  onOpenChange,
  businessId,
  onSuccess,
}: CreateContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'manual' as string,
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.phone.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    // Validar formato de teléfono (debe tener código de país)
    if (!formData.phone.trim().startsWith('+')) {
      setError('El teléfono debe incluir código de país (ej: +54911...)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.createContact({
        business_id: businessId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        source: formData.source,
        notes: formData.notes.trim() || undefined,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      // Manejar errores de duplicados
      const errorMessage = err.message || 'Error al crear contacto';
      if (errorMessage.includes('Ya existe un contacto')) {
        setError(errorMessage);
      } else {
        setError('Error al crear contacto. Por favor intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      source: 'manual',
      notes: '',
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Contacto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="María González"
                required
                autoFocus
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+5491154686272"
                required
              />
              <p className="text-xs text-gray-500">
                Incluir código de país (ej: +54, +1, +34)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maria@example.com"
              />
            </div>

            {/* Canal */}
            <div className="space-y-2">
              <Label htmlFor="source">Canal de contacto</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">✏️ Manual</SelectItem>
                  <SelectItem value="call">☎️ Llamada</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="instagram">📷 Instagram</SelectItem>
                  <SelectItem value="facebook">👥 Facebook</SelectItem>
                  <SelectItem value="web">🌐 Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional sobre el contacto..."
              rows={3}
            />
          </div>

          {/* Acciones */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Creando...' : 'Crear contacto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

