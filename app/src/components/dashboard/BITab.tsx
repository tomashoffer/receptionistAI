import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, Calendar, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

export function BITab() {
  const kpis = [
    {
      label: 'Llamadas Totales',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Citas Agendadas',
      value: '856',
      change: '+18%',
      trend: 'up',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Tasa de Conversión',
      value: '69.4%',
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Tiempo Promedio',
      value: '3:42',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'success',
      caller: 'María García',
      action: 'Cita agendada para Corte de Cabello',
      date: '15 Nov, 14:30',
      duration: '4:12',
    },
    {
      id: 2,
      type: 'success',
      caller: 'Carlos Rodríguez',
      action: 'Cita agendada para Consulta Médica',
      date: '18 Nov, 10:00',
      duration: '3:45',
    },
    {
      id: 3,
      type: 'failed',
      caller: 'Ana Martínez',
      action: 'No disponible - horario solicitado ocupado',
      date: '20 Nov, 16:00',
      duration: '2:30',
    },
    {
      id: 4,
      type: 'success',
      caller: 'Luis Fernández',
      action: 'Cita agendada para Mantenimiento',
      date: '22 Nov, 09:15',
      duration: '5:20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      kpi.trend === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }
                  >
                    {kpi.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">{kpi.label}</p>
                  <p className="text-3xl">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas interacciones procesadas por tu Recepcionista AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'success'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {activity.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{activity.caller}</p>
                    <p className="text-sm text-slate-600">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900">{activity.date}</p>
                  <p className="text-xs text-slate-500">Duración: {activity.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rendimiento Semanal</CardTitle>
              <CardDescription>Comparativa de citas agendadas vs. llamadas totales</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Gráfico de tendencias</p>
              <p className="text-xs text-slate-400 mt-1">Conecta con tu backend para datos en tiempo real</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
