import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, MessageSquare, Calendar, Phone, CheckCircle2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';

const conversacionesData = [
  { month: 'Mar', 'Chatbot': 45, 'Voice AI': 32 },
  { month: 'Abr', 'Chatbot': 52, 'Voice AI': 38 },
  { month: 'May', 'Chatbot': 61, 'Voice AI': 42 },
  { month: 'Jun', 'Chatbot': 58, 'Voice AI': 45 },
  { month: 'Jul', 'Chatbot': 48, 'Voice AI': 35 },
  { month: 'Ago', 'Chatbot': 67, 'Voice AI': 51 },
  { month: 'Sep', 'Chatbot': 72, 'Voice AI': 48 },
  { month: 'Oct', 'Chatbot': 78, 'Voice AI': 56 }
];

const estadoData = [
  { name: 'Confirmados', value: 68, color: '#10b981' },
  { name: 'Pendientes', value: 22, color: '#f59e0b' },
  { name: 'Cancelados', value: 10, color: '#ef4444' }
];

const negociosData = [
  { name: 'Clínica Dental Dr. Pérez', asignadas: 45, confirmadas: 38, canceladas: 7, noLeidas: 2, mensajes: 234 },
  { name: 'Peluquería Estilo', asignadas: 32, confirmadas: 28, canceladas: 4, noLeidas: 1, mensajes: 156 },
  { name: 'Restaurante La Esquina', asignadas: 28, confirmadas: 22, canceladas: 6, noLeidas: 0, mensajes: 189 }
];

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string;
  trend?: 'up' | 'down';
  icon?: any;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardIA() {
  return (
    <div className="space-y-6 pb-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Conversaciones activas"
          value="12"
          subtitle="+25% respecto al periodo anterior"
          icon={MessageSquare}
          trend="up"
        />
        <MetricCard
          title="Llamadas Voice AI"
          value="8"
          subtitle="+60% respecto al periodo anterior"
          icon={Phone}
          trend="up"
        />
        <MetricCard
          title="Turnos agendados"
          value="105"
          subtitle="+18% respecto al periodo anterior"
          icon={Calendar}
          trend="up"
        />
        <MetricCard
          title="Turnos confirmados"
          value="89"
          subtitle="+23% respecto al periodo anterior"
          icon={CheckCircle2}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interacciones por canal de atención</CardTitle>
            <CardDescription>Distribución entre Chatbot y Voice AI</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversacionesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Chatbot" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Voice AI" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de turnos</CardTitle>
            <CardDescription>Distribución actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {estadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">Confirmados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs">Pendientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">Cancelados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por negocio</CardTitle>
          <CardDescription>Rendimiento de cada comercio conectado</CardDescription>
          <div className="mt-4">
            <Input placeholder="Filtrar negocios..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Negocio ⬆️⬇️</TableHead>
                <TableHead>Consultas ⬇️</TableHead>
                <TableHead>Confirmadas ⬆️⬇️</TableHead>
                <TableHead>Canceladas ⬆️⬇️</TableHead>
                <TableHead>No Leídas ⬆️⬇️</TableHead>
                <TableHead className="text-right">Mensajes enviados ⬆️⬇️</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {negociosData.map((negocio) => (
                <TableRow key={negocio.name}>
                  <TableCell>{negocio.name}</TableCell>
                  <TableCell>{negocio.asignadas}</TableCell>
                  <TableCell>{negocio.confirmadas}</TableCell>
                  <TableCell>{negocio.canceladas}</TableCell>
                  <TableCell>{negocio.noLeidas}</TableCell>
                  <TableCell className="text-right">{negocio.mensajes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}