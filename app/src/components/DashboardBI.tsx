import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Clock, MessageSquare, Percent, Target } from 'lucide-react';
import { Badge } from './ui/badge';

const mensajesData = [
  { day: 'Lunes 04', value: 45 },
  { day: 'Martes 05', value: 52 },
  { day: 'Miércoles 06', value: 48 },
  { day: 'Jueves 07', value: 61 },
  { day: 'Viernes 08', value: 58 },
  { day: 'Sábado 09', value: 35 },
  { day: 'Domingo 10', value: 28 }
];

const tiempoRespuestaData = [
  { hour: '9-10', value: 2.5 },
  { hour: '10-11', value: 1.8 },
  { hour: '11-12', value: 2.2 },
  { hour: '12-13', value: 3.5 },
  { hour: '13-14', value: 2.8 },
  { hour: '14-15', value: 1.5 },
  { hour: '15-16', value: 1.2 }
];

const duracionLlamadaData = [
  { time: '1min', value: 15 },
  { time: '2min', value: 28 },
  { time: '3min', value: 35 },
  { time: '4min', value: 22 },
  { time: '5min', value: 12 },
  { time: '6min+', value: 8 }
];

const canalData = [
  { name: 'WhatsApp', value: 45, color: '#10b981' },
  { name: 'Voice AI', value: 30, color: '#8b5cf6' },
  { name: 'Web Chat', value: 15, color: '#3b82f6' },
  { name: 'Instagram', value: 10, color: '#ec4899' }
];

const categoriaData = [
  { name: 'Servicios de Salud', value: 40, color: '#3b82f6' },
  { name: 'Belleza & Estética', value: 30, color: '#f97316' },
  { name: 'Gastronomía', value: 20, color: '#10b981' },
  { name: 'Otros servicios', value: 10, color: '#8b5cf6' }
];

function MetricCardBI({ 
  title, 
  value, 
  subtitle, 
  badge,
  icon: Icon,
  trend
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  badge?: { label: string; variant: string };
  icon?: any;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          {badge && (
            <Badge className={`${badge.variant === 'purple' ? 'bg-purple-500' : 'bg-purple-400'} text-white`}>
              {badge.label}
            </Badge>
          )}
        </div>
        <div className="text-2xl mt-2">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardBI() {
  return (
    <div className="space-y-6 pb-8">
      {/* Metrics Grid Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardBI
          title="Consultas atendidas"
          value="324"
          badge={{ label: '23.51%', variant: 'purple' }}
          icon={MessageSquare}
        />
        <MetricCardBI
          title="Turnos agendados"
          value="105"
          badge={{ label: '32.41%', variant: 'purple' }}
          icon={Calendar}
          subtitle="Tasa de conversión"
        />
        <MetricCardBI
          title="Tiempo ahorrado"
          value="18h 45m"
          icon={Clock}
          subtitle="En atención al cliente"
        />
        <MetricCardBI
          title="Tasa de confirmación"
          value="84.8%"
          icon={Target}
          trend="+5.2% vs periodo anterior"
        />
      </div>

      {/* Metrics Grid Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardBI
          title="Mensajes respondidos"
          value="842"
          icon={MessageSquare}
        />
        <MetricCardBI
          title="Automatización"
          value="94%"
          icon={Percent}
          subtitle="Consultas resueltas sin intervención"
        />
        <MetricCardBI
          title="Recordatorios enviados"
          value="89"
          icon={Target}
        />
        <MetricCardBI
          title="Reducción no-shows"
          value="67%"
          icon={TrendingUp}
          subtitle="Comparado con atención manual"
        />
      </div>

      {/* Charts Row 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Interacciones en los últimos 7 días</CardTitle>
          <CardDescription>Volumen de consultas por día</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mensajesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiempo promedio de respuesta (minutos)</CardTitle>
            <CardDescription>Por hora del día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tiempoRespuestaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duración promedio de llamadas</CardTitle>
            <CardDescription>Distribución Voice AI</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={duracionLlamadaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Horarios section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Horarios más solicitados</CardTitle>
            <CardDescription>Preferencias de los clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">🕐 10:00 - 12:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '85%' }} />
                </div>
                <span>85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">🕓 15:00 - 17:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '72%' }} />
                </div>
                <span>72%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">🕘 09:00 - 10:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '68%' }} />
                </div>
                <span>68%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">🕕 18:00 - 20:00</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '45%' }} />
                </div>
                <span>45%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Días de la semana más concurridos</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">📅 Lunes</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '78%' }} />
                </div>
                <span>78%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">📅 Miércoles</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '82%' }} />
                </div>
                <span>82%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">📅 Viernes</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '90%' }} />
                </div>
                <span>90%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">📅 Sábado</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '65%' }} />
                </div>
                <span>65%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel and Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por canal</CardTitle>
            <CardDescription>Preferencias de contacto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={canalData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {canalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {canalData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por categoría de negocio</CardTitle>
            <CardDescription>Tipos de comercios conectados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoriaData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Motivos de consulta más frecuentes</CardTitle>
            <CardDescription>Top 5 de intenciones detectadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Agendar turno</span>
              </div>
              <span>45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Consultar disponibilidad</span>
              </div>
              <span>28%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Modificar turno</span>
              </div>
              <span>12%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">Cancelar turno</span>
              </div>
              <span>8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Consultar precios</span>
              </div>
              <span>7%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento del asistente</CardTitle>
            <CardDescription>Métricas de calidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Tasa de resolución</span>
                <span className="text-sm">94%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Satisfacción del cliente</span>
                <span className="text-sm">4.7/5.0</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Precisión Voice AI</span>
                <span className="text-sm">91%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '91%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}