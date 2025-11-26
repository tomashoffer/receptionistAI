'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface BehaviorConfigWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToBehavior: () => void;
  onCancel: () => void;
}

export function BehaviorConfigWarningDialog({
  open,
  onOpenChange,
  onGoToBehavior,
  onCancel,
}: BehaviorConfigWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <DialogTitle className="text-xl">Configuración incompleta</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Para crear el asistente correctamente, primero debes configurar el comportamiento del asistente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600">
            El comportamiento del asistente incluye configuraciones importantes como:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>Estado del asistente (activado/pausado)</li>
            <li>Horarios de funcionamiento</li>
            <li>Zona horaria</li>
            <li>Mensajes de pausa</li>
            <li>Configuración de seguimientos</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onGoToBehavior();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            Ir a Configuración de Comportamiento
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

