'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Plus } from 'lucide-react';
import { Tag } from '@/types/contact.types';
import { apiService } from '@/services/api.service';

const TAG_COLORS: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-700',
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  gray: 'bg-gray-600 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  yellow: 'bg-yellow-400 text-yellow-900',
  indigo: 'bg-indigo-500 text-white',
  teal: 'bg-teal-500 text-white',
};

interface TagSelectorProps {
  availableTags: Tag[];
  onSelect: (tagId: string) => void;
  businessId?: string;
  onTagCreated?: () => void;
}

export function TagSelector({ availableTags, onSelect, businessId, onTagCreated }: TagSelectorProps) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredTags = availableTags.filter((tag) =>
    tag.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNewTag = async () => {
    if (!search.trim() || !businessId) return;

    setIsCreating(true);
    try {
      const newTag = await apiService.createTag({
        business_id: businessId,
        label: search.trim(),
        color: 'blue',
        icon: '📌',
      }) as Tag;

      // Limpiar búsqueda
      setSearch('');
      
      // Notificar que se creó el tag (para refrescar la lista)
      if (onTagCreated) {
        onTagCreated();
      }

      // Seleccionar el tag recién creado
      onSelect(newTag.id);
    } catch (error: any) {
      console.error('Error al crear tag:', error);
      alert(error.message || 'Error al crear la etiqueta');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Buscar o crear etiqueta..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && search.trim() && filteredTags.length === 0 && businessId) {
            handleCreateNewTag();
          }
        }}
        className="h-8"
        autoFocus
      />
      
      <ScrollArea className="h-48">
        <div className="space-y-1">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onSelect(tag.id)}
                className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Badge
                  className={`${TAG_COLORS[tag.color] || TAG_COLORS.gray} flex items-center gap-1`}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  {tag.label}
                </Badge>
                {tag.contactCount !== undefined && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {tag.contactCount} contactos
                  </span>
                )}
              </button>
            ))
          ) : search.trim() && businessId ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-gray-500">
                No se encontró "{search}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNewTag}
                disabled={isCreating}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                {isCreating ? 'Creando...' : `Crear etiqueta "${search}"`}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Escribe para buscar o crear una etiqueta
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

