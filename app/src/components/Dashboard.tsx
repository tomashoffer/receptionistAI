'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowUpRight, Users, MessageSquare, Calendar, TrendingUp, Menu } from 'lucide-react';
import { HelpCircle, Map } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';
import { useUserStore } from '../stores/userStore';
import { DashboardIA } from './DashboardIA';
import { DashboardBI } from './DashboardBI';
import { useLayout } from '../contexts/LayoutContext';

export function Dashboard() {
  const { activeBusiness, user } = useUserStore();
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
        
        .header-title {
          font-size: 1.125rem;
        }
        
        .support-buttons {
          display: none;
        }
        
        .tabs-container {
          flex-direction: column;
          gap: 1rem;
        }
        
        .date-buttons {
          flex-wrap: wrap;
        }
        
        .date-button-text {
          display: inline;
        }
        
        .date-button-icon {
          display: none;
        }
        
        @media (width >= 640px) {
          .header-title {
            font-size: 1.5rem;
          }
        }
        
        @media (width >= 768px) {
          .support-buttons {
            display: flex;
          }
        }
        
        .welcome-text-full {
          display: none;
        }
        
        .welcome-text-short {
          display: inline;
        }
        
        @media (width >= 640px) {
          .welcome-text-full {
            display: inline;
          }
          
          .welcome-text-short {
            display: none;
          }
        }
        
        @media (width >= 768px) {
          .mobile-menu-button {
            display: none;
          }
          
          .header-business-selector {
            display: block;
          }
          
          .tabs-container {
            flex-direction: row;
            gap: 0;
          }
          
          .date-button-icon {
            display: none;
          }
        }
      `}</style>
      
      <div className="bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Botón hamburguesa - solo visible en mobile */}
              <button
                onClick={openMobileMenu}
                className="mobile-menu-button p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              
              <h1 className="header-title font-medium">
                <span className="welcome-text-short">
                  Hola <span className="text-purple-600">{user?.first_name || 'Usuario'}</span> 👋
                </span>
                <span className="welcome-text-full">
                  Hola <span className="text-purple-600">{user?.first_name || 'Usuario'}</span>, bienvenido de nuevo 👋
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="header-business-selector">
                <BusinessSelector />
              </div>
              <div className="support-buttons flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Soporte
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Map className="w-4 h-4" />
                  Roadmap
                </Button>
              </div>
            </div>
          </div>



        {/* Tabs */}
        <Tabs defaultValue="ia" className="w-full">
          <div className="tabs-container flex items-center justify-between">
            <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
              <TabsTrigger 
                value="ia" 
                className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                🤖 Asistente AI
              </TabsTrigger>
              <TabsTrigger 
                value="bi"
                className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                📊 Analíticas
              </TabsTrigger>
              <TabsTrigger 
                value="agentes"
                className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                💼 Negocios
              </TabsTrigger>
            </TabsList>
            
            <div className="date-buttons flex items-center gap-2">
              <Button variant="outline" size="sm">Hoy</Button>
              <Button variant="outline" size="sm">Semana</Button>
              <Button variant="outline" size="sm">Mes</Button>
              <Button variant="outline" size="sm">Año</Button>
              <Button variant="outline" size="sm" className="text-gray-400">
                <span className="date-button-text">📅 Seleccionar rango de fechas</span>
                <span className="date-button-icon">📅</span>
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <TabsContent value="ia" className="m-0">
              <DashboardIA />
            </TabsContent>
            <TabsContent value="bi" className="m-0">
              <DashboardBI />
            </TabsContent>
            <TabsContent value="agentes" className="m-0">
              <div className="text-center py-12 text-gray-500">
                Vista de Agentes - En desarrollo
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </header>
      </div>
    </>
  );
}