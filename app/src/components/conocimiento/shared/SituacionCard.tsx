import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Trash2 } from 'lucide-react';

interface SituacionCardProps {
  id: number;
  index: number;
  titulo: string;
  descripcion: string;
  revisado: boolean;
  onUpdate: (id: number, field: 'titulo' | 'descripcion', value: string) => void;
  onToggleRevisado: (id: number) => void;
  onRemove: (id: number) => void;
  showRemove?: boolean;
}

export function SituacionCard({
  id,
  index,
  titulo,
  descripcion,
  revisado,
  onUpdate,
  onToggleRevisado,
  onRemove,
  showRemove = true
}: SituacionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Situación {index + 1}
        </Badge>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={revisado}
              onCheckedChange={() => onToggleRevisado(id)}
            />
            <span className="text-sm text-gray-600">Revisado</span>
          </div>
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Título de la situación</Label>
          <Input
            placeholder="Ej: Consultas complejas"
            value={titulo}
            onChange={(e) => onUpdate(id, 'titulo', e.target.value)}
            disabled={revisado}
            className={revisado ? 'bg-gray-50' : 'bg-white'}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Descripción</Label>
          <Textarea
            placeholder="Describe cuándo debe detenerse el asistente..."
            value={descripcion}
            onChange={(e) => onUpdate(id, 'descripcion', e.target.value)}
            rows={2}
            disabled={revisado}
            className={revisado ? 'bg-gray-50' : 'bg-white'}
          />
        </div>
      </div>
    </div>
  );
}

