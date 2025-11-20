'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Filter,
  MessageSquare,
  Users,
  Bell,
  Settings,
  Book,
  Dumbbell,
  FlaskConical,
  Building2,
  Radio,
  User,
  CreditCard,
  Bot,
  Layers,
  X,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { LogoutButton } from '../LogoutButton';
import { Badge } from '../ui/badge';
import { BusinessSelector } from '../BusinessSelector';
import DarkModeToggle from '../DarkModeToggle';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: string;
  locked?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserStore();

  const navSections: NavSection[] = [
    {
      title: 'Navegación',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Filter, label: 'Proceso comercial', path: '/dashboard/proceso-comercial' },
        { icon: MessageSquare, label: 'Conversaciones', path: '/dashboard/conversaciones' },
        { icon: Users, label: 'Contactos', path: '/dashboard/contactos' },
        { icon: Bell, label: 'Campañas', path: '/dashboard/campanas' },
        { icon: Layers, label: 'Integraciones', path: '/dashboard/integraciones', badge: 'NUEVO', locked: true }
      ]
    },
    {
      title: 'Asistente',
      items: [
        { icon: Settings, label: 'Configuración', path: '/dashboard/configuracion' },
        { icon: Book, label: 'Conocimiento', path: '/dashboard/conocimiento' },
        { icon: Dumbbell, label: 'Entrenamiento', path: '/dashboard/entrenamiento' },
        { icon: FlaskConical, label: 'Pruebas', path: '/dashboard/pruebas' }
      ]
    },
    {
      title: 'Configuración',
      items: [
        { icon: Building2, label: 'Mis Negocios', path: '/dashboard/mis-negocios' },
        { icon: Radio, label: 'Canales', path: '/dashboard/canales' },
        { icon: User, label: 'Mi Cuenta', path: '/dashboard/mi-cuenta' },
        { icon: CreditCard, label: 'Planes y Pagos', path: '/dashboard/planes' }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.locked) return;
    router.push(item.path);
    // Cerrar el menú mobile después de navegar
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <style jsx>{`
        .sidebar {
          position: fixed;
          inset-block-start: 0;
          inset-block-end: 0;
          inset-inline-start: 0;
          z-index: 50;
          transform: translateX(${isOpen ? '0' : '-100%'});
          transition: transform 300ms ease-in-out;
        }
        
        .business-selector-mobile {
          display: block;
        }
        
        .business-selector-wrapper :global(button) {
          min-width: 100%;
          width: 100%;
        }
        
        @media (width >= 768px) {
          .sidebar {
            position: static;
            transform: translateX(0) !important;
          }
          
          .close-button {
            display: none;
          }
          
          .business-selector-mobile {
            display: none;
          }
        }
      `}</style>
      
      <aside className="sidebar w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: '#4338ca' }}>
                <Bot className="h-5 w-5" style={{ color: '#ffffff' }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ReceptionistAI</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Business Dashboard</p>
              </div>
            </div>
            {/* Botón X - solo visible en mobile */}
            <button
              onClick={onClose}
              className="close-button p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* BusinessSelector - solo visible en mobile */}
          <div className="business-selector-mobile mt-3">
            <div className="business-selector-wrapper">
              <BusinessSelector />
            </div>
          </div>
        </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {navSections.map((section) => (
          <div key={section.title} className="mb-6 px-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item)}
                    disabled={item.locked}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${active 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      ${item.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                    {item.locked && (
                      <span className="text-xs text-gray-400">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="px-3 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
            Preferencias
          </h3>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2.5 flex justify-center">
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
          </div>
          <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
      </aside>
    </>
  );
}
