'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowUpRight, Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { HelpCircle, Map } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';
import { useUserStore } from '../stores/userStore';
import { DashboardIA } from './DashboardIA';
import { DashboardBI } from './DashboardBI';

export function Dashboard() {
  const { activeBusiness } = useUserStore();

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">
            Hola <span className="text-purple-600">Timothy</span>, bienvenido de nuevo 👋
          </h1>
          <div className="flex items-center gap-2">
            <BusinessSelector />
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

        {activeBusiness && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              📊 Viendo estadísticas de: <span className="font-semibold">{activeBusiness.name}</span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="ia" className="w-full">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Hoy</Button>
              <Button variant="outline" size="sm">Semana</Button>
              <Button variant="outline" size="sm">Mes</Button>
              <Button variant="outline" size="sm">Año</Button>
              <Button variant="outline" size="sm" className="text-gray-400">
                📅 Seleccionar rango de fechas
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
  );
}