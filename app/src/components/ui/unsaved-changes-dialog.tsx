'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  description?: string;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onCancel,
  title = '¿Tienes cambios sin guardar?',
  description = 'Tienes cambios sin guardar. Si navegas fuera de esta página, perderás los cambios que no hayas guardado.',
  saveLabel = 'Actualizar',
  cancelLabel = 'Cancelar',
  isLoading = false,
}: UnsavedChangesDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Error al guardar:', error);
      setIsSaving(false);
      // No cerrar el diálogo si hay error
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || isLoading}
            className="sm:min-w-[100px]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white sm:min-w-[100px]"
          >
            {isSaving || isLoading ? 'Guardando...' : saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

