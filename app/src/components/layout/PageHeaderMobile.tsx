'use client';

import { Menu } from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { ReactNode } from 'react';

interface PageHeaderMobileProps {
  title: string | ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeaderMobile({ 
  title, 
  subtitle, 
  actions,
  children,
  className = ''
}: PageHeaderMobileProps) {
  const { openMobileMenu } = useLayout();

  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-4 ${className}`}>
      {/* Fila 1: Menú hamburguesa + Título */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={openMobileMenu}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <div className="flex-1">
          {typeof title === 'string' ? (
            <h1 className="text-xl">{title}</h1>
          ) : (
            title
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Fila 2: Actions (botones) */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
      
      {/* Contenido adicional */}
      {children}
    </div>
  );
}

