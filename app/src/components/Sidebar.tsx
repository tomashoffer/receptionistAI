'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Filter, 
  MessageSquare, 
  Users, 
  Bell,
  Settings as SettingsIcon,
  Book,
  Layers,
  Dumbbell,
  User,
  Building2,
  CreditCard,
  ChevronRight,
  Plug
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useUserStore } from '../stores/userStore';

interface NavItem {
  icon: any;
  label: string;
  badge?: string;
  active?: boolean;
  locked?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ activeView, setActiveView }: { activeView: string; setActiveView: (view: string) => void }) {
  const { user } = useUserStore();
  
  const navSections: NavSection[] = [
    {
      title: 'Navegación',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: Filter, label: 'Proceso comercial' },
        { icon: MessageSquare, label: 'Conversaciones' },
        { icon: Users, label: 'Contactos' },
        { icon: Bell, label: 'Campañas' },
        { icon: Layers, label: 'Integraciones', badge: 'NUEVO', locked: true }
      ]
    },
    {
      title: 'Asistente',
      items: [
        { icon: SettingsIcon, label: 'Configuración' },
        { icon: Book, label: 'Conocimiento' },
        { icon: Dumbbell, label: 'Entrenamiento' },
        { icon: User, label: 'Pruebas' }
      ]
    },
    {
      title: 'Configuración',
      items: [
        { icon: Building2, label: 'Mis Negocios' },
        { icon: Plug, label: 'Canales' },
        { icon: User, label: 'Mi Cuenta' },
        { icon: CreditCard, label: 'Planes y Pagos' }
      ]
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg">we speak</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-hidden">
        <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .sidebar-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="sidebar-scroll">
            {navSections.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="px-4 mb-2 text-xs text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.label;
                    
                    return (
                      <button
                        key={item.label}
                        onClick={() => setActiveView(item.label)}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors relative ${
                          isActive 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r" />
                        )}
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.locked && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: '56%' }} />
          </div>
        </div>
        <p className="text-xs text-gray-600">563 / 1000</p>
      </div>

      {/* Notifications */}
      <div className="px-4 pb-3">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 relative">
          <div className="w-4 h-4 bg-red-500 rounded-full absolute -top-1 left-0" />
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="flex-1 text-left text-sm text-gray-700">Novedades</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-orange-500 text-white">
              {user?.first_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="text-sm">{user?.first_name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}