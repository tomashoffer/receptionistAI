'use client';

import { Menu } from 'lucide-react';
import { BusinessSelector } from '../BusinessSelector';
import { useLayout } from '../../contexts/LayoutContext';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  showBusinessSelector?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBusinessSelector = true,
  actions,
  children,
  className = ''
}: PageHeaderProps) {
  const { openMobileMenu } = useLayout();

  return (
    <>
      <style jsx>{`
        .mobile-menu-button {
          display: inline-flex;
        }
        
        .header-business-selector {
          display: none;
        }
        
        @media (width >= 768px) {
          .mobile-menu-button {
            display: none;
          }
          
          .header-business-selector {
            display: ${showBusinessSelector ? 'block' : 'none'};
          }
        }
      `}</style>
      
      <div className={`bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 ${className}`}>
        <div className="flex items-center justify-between">
          {/* Lado izquierdo: Menú + Título */}
          <div className="flex items-center gap-3">
            <button
              onClick={openMobileMenu}
              className="mobile-menu-button p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              {typeof title === 'string' ? (
                <h1 className="text-xl md:text-2xl">{title}</h1>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Lado derecho: BusinessSelector + Actions */}
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            {showBusinessSelector && (
              <div className="header-business-selector">
                <BusinessSelector />
              </div>
            )}
            {actions}
          </div>
        </div>
        
        {children}
      </div>
    </>
  );
}
