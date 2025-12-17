'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface MultiSelectFilterProps {
  options: Option[];
  selectedValues: string[];
  onSelectedChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectFilter({
  options,
  selectedValues,
  onSelectedChange,
  placeholder = 'Seleccionar...',
  className = '',
}: MultiSelectFilterProps) {
  const [selectValue, setSelectValue] = useState('');

  const handleSelect = (value: string) => {
    if (value && !selectedValues.includes(value)) {
      onSelectedChange([...selectedValues, value]);
    }
    setSelectValue(''); // Reset select para poder agregar más
  };

  const handleRemove = (value: string) => {
    onSelectedChange(selectedValues.filter((v) => v !== value));
  };

  const availableOptions = options.filter((opt) => !selectedValues.includes(opt.value));

  return (
    <div className={`space-y-2 ${className}`}>
      <Select value={selectValue} onValueChange={handleSelect}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.length > 0 ? (
            availableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.icon && <span className="mr-1">{option.icon}</span>}
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500 text-center">
              Todas las opciones seleccionadas
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Badges de valores seleccionados */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((value) => {
            const option = options.find((opt) => opt.value === value);
            if (!option) return null;
            return (
              <Badge
                key={value}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {option.icon && <span>{option.icon}</span>}
                <span className="text-xs">{option.label}</span>
                <button
                  onClick={() => handleRemove(value)}
                  className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}



