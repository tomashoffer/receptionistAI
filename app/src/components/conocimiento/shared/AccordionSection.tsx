import { ChevronDown, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface AccordionSectionProps {
  id: string;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  borderColor?: string;
  completed?: number;
  total?: number;
  children: ReactNode;
  customCount?: string;
}

export function AccordionSection({
  id,
  title,
  isExpanded,
  onToggle,
  borderColor = 'border-l-green-500',
  completed,
  total,
  children,
  customCount
}: AccordionSectionProps) {
  const countText = customCount || (completed !== undefined && total !== undefined ? `${completed}/${total} preguntas` : '');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 ${borderColor}`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
          <span className="text-gray-900">{title}</span>
        </div>
        {countText && (
          <span className="text-sm text-gray-500">{countText}</span>
        )}
      </button>

      {isExpanded && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

