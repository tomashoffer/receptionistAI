'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Tag, CreateTagDto } from '@/types/contact.types';
import { apiService } from '@/services/api.service';

const TAG_COLORS = [
  { value: 'pink', label: 'Rosa', preview: 'bg-pink-100 text-pink-700' },
  { value: 'orange', label: 'Naranja', preview: 'bg-orange-500 text-white' },
  { value: 'blue', label: 'Azul', preview: 'bg-blue-500 text-white' },
  { value: 'gray', label: 'Gris', preview: 'bg-gray-600 text-white' },
  { value: 'green', label: 'Verde', preview: 'bg-green-500 text-white' },
  { value: 'purple', label: 'Morado', preview: 'bg-purple-500 text-white' },
  { value: 'red', label: 'Rojo', preview: 'bg-red-500 text-white' },
  { value: 'yellow', label: 'Amarillo', preview: 'bg-yellow-400 text-yellow-900' },
  { value: 'indigo', label: 'Índigo', preview: 'bg-indigo-500 text-white' },
  { value: 'teal', label: 'Verde azulado', preview: 'bg-teal-500 text-white' },
];

const ICON_OPTIONS = [
  { value: '👤', label: 'Persona' },
  { value: '🛏️', label: 'Cama' },
  { value: '💬', label: 'Chat' },
  { value: '📅', label: 'Calendario' },
  { value: '🎁', label: 'Regalo' },
  { value: '⭐', label: 'Estrella' },
  { value: '🔥', label: 'Fuego' },
  { value: '✅', label: 'Check' },
  { value: '❌', label: 'X' },
  { value: '💰', label: 'Dinero' },
  { value: '☎️', label: 'Teléfono' },
  { value: '📷', label: 'Cámara' },
  { value: '❓', label: 'Pregunta' },
  { value: 'ℹ️', label: 'Info' },
  { value: '🌐', label: 'Web' },
];

interface TagManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  tags: Tag[];
  onRefresh: () => void;
}

export function TagManagerModal({
  open,
  onOpenChange,
  businessId,
  tags,
  onRefresh,
}: TagManagerModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState<CreateTagDto>({
    business_id: businessId,
    label: '',
    color: 'blue',
    icon: '📌',
  });
  const [error, setError] = useState<string | null>(null);

  const handleCreateTag = async () => {
    try {
      setError(null);
      if (!newTag.label.trim()) {
        setError('El nombre de la etiqueta es requerido');
        return;
      }

      await apiService.createTag(newTag);
      
      setNewTag({ business_id: businessId, label: '', color: 'blue', icon: '📌' });
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta etiqueta? Se quitará de todos los contactos.')) {
      return;
    }

    try {
      await apiService.deleteTag(tagId, businessId);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Etiquetas</DialogTitle>
        </DialogHeader>

        {/* Lista de tags existentes */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Etiquetas existentes ({tags.length})
          </p>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Badge
                    className={`${TAG_COLORS.find(c => c.value === tag.color)?.preview || TAG_COLORS[0].preview} flex items-center gap-1`}
                  >
                    {tag.icon && <span>{tag.icon}</span>}
                    {tag.label}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {tag.contactCount || 0} contactos
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay etiquetas creadas
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Crear nuevo tag */}
        {isCreating ? (
          <div className="space-y-3 border-t pt-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}
            
            <div>
              <Label htmlFor="tagLabel">Nombre de la etiqueta</Label>
              <Input
                id="tagLabel"
                placeholder="Ej: Cliente VIP"
                value={newTag.label}
                onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Selector de icono */}
              <div>
                <Label>Icono</Label>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon.value}
                      onClick={() => setNewTag({ ...newTag, icon: icon.value })}
                      className={`p-2 text-2xl rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        newTag.icon === icon.value
                          ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-600'
                          : ''
                      }`}
                      title={icon.label}
                    >
                      {icon.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de color */}
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewTag({ ...newTag, color: color.value })}
                      className={`w-8 h-8 rounded ${color.preview} ${
                        newTag.color === color.value
                          ? 'ring-2 ring-offset-2 ring-purple-600'
                          : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <Label>Vista previa</Label>
              <div className="mt-1">
                <Badge
                  className={`${TAG_COLORS.find(c => c.value === newTag.color)?.preview} flex items-center gap-1 w-fit`}
                >
                  {newTag.icon && <span>{newTag.icon}</span>}
                  {newTag.label || 'Nombre de la etiqueta'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTag}>Crear etiqueta</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setError(null);
                  setNewTag({ business_id: businessId, label: '', color: 'blue', icon: '📌' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsCreating(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nueva etiqueta
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

