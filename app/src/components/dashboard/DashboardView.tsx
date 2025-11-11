import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AITab } from './AITab';
import { BITab } from './BITab';

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Vista completa del rendimiento de tu Recepcionista AI
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList>
          <TabsTrigger value="ai">Inteligencia Artificial</TabsTrigger>
          <TabsTrigger value="bi">Business Intelligence</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="mt-6">
          <AITab />
        </TabsContent>
        <TabsContent value="bi" className="mt-6">
          <BITab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
