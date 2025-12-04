'use client';

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Plus, X, Eye } from 'lucide-react';
import { Contact, Tag } from '@/types/contact.types';
import { TagSelector } from './TagSelector';

const TAG_COLORS: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  orange: 'bg-orange-500 text-white hover:bg-orange-600',
  blue: 'bg-blue-500 text-white hover:bg-blue-600',
  gray: 'bg-gray-600 text-white hover:bg-gray-700',
  green: 'bg-green-500 text-white hover:bg-green-600',
  purple: 'bg-purple-500 text-white hover:bg-purple-600',
  red: 'bg-red-500 text-white hover:bg-red-600',
  yellow: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500',
  indigo: 'bg-indigo-500 text-white hover:bg-indigo-600',
  teal: 'bg-teal-500 text-white hover:bg-teal-600',
};

interface TagCellProps {
  contact: Contact;
  businessTags: Tag[];
  onAddTag: (contactId: string, tagId: string) => Promise<void>;
  onRemoveTag: (contactId: string, tagId: string) => Promise<void>;
  onRefreshTags?: () => void;
}

export function TagCell({ contact, businessTags, onAddTag, onRemoveTag, onRefreshTags }: TagCellProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  
  const contactTags = contact.contactTags || [];
  const visibleTags = contactTags.slice(0, 2);
  const hiddenCount = contactTags.length - 2;

  const availableTags = businessTags.filter(
    (bt) => !contactTags.find((ct) => ct.tag.id === bt.id)
  );

  const handleRemoveTag = async (tagId: string) => {
    await onRemoveTag(contact.id, tagId);
  };

  const handleAddTag = async (tagId: string) => {
    await onAddTag(contact.id, tagId);
    setIsAddingTag(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Tags visibles */}
      {visibleTags.map((ct) => (
        <Badge
          key={ct.id}
          className={`${TAG_COLORS[ct.tag.color] || TAG_COLORS.gray} flex items-center gap-1 pr-1 text-xs`}
        >
          {ct.tag.icon && <span className="text-sm">{ct.tag.icon}</span>}
          <span>{ct.tag.label}</span>
          <button
            onClick={() => handleRemoveTag(ct.tag.id)}
            className="ml-1 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
            title="Quitar etiqueta"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Indicador de tags ocultos */}
      {hiddenCount > 0 && (
        <Popover open={showAllTags} onOpenChange={setShowAllTags}>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              +{hiddenCount}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <p className="text-sm font-medium">Todas las etiquetas</p>
              <div className="flex flex-wrap gap-1">
                {contactTags.map((ct) => (
                  <Badge
                    key={ct.id}
                    className={`${TAG_COLORS[ct.tag.color] || TAG_COLORS.gray} flex items-center gap-1 pr-1`}
                  >
                    {ct.tag.icon && <span>{ct.tag.icon}</span>}
                    <span>{ct.tag.label}</span>
                    <button
                      onClick={() => handleRemoveTag(ct.tag.id)}
                      className="ml-1 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Botón agregar tag */}
      {availableTags.length > 0 && (
        <Popover open={isAddingTag} onOpenChange={setIsAddingTag}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              title="Agregar etiqueta"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <TagSelector 
              availableTags={availableTags} 
              onSelect={handleAddTag}
              businessId={contact.business_id}
              onTagCreated={() => {
                // Refrescar la lista de tags disponibles
                if (onRefreshTags) {
                  onRefreshTags();
                }
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

