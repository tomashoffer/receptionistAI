import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain, Mic, Volume2, Zap, TrendingDown, Activity } from 'lucide-react';
import { Progress } from '../ui/progress';

export function AITab() {
  const stackConfig = [
    { label: 'Modelo LLM', value: 'GPT-4o Cluster', icon: Brain, color: 'text-purple-600' },
    { label: 'Temperatura', value: '0.0 (Determinista)', icon: Activity, color: 'text-blue-600' },
    { label: 'Text-to-Speech', value: 'OpenAI TTS', icon: Volume2, color: 'text-green-600' },
    { label: 'Speech-to-Text', value: 'Deepgram Nova 2', icon: Mic, color: 'text-orange-600' },
  ];

  const consumptionMetrics = [
    {
      service: 'LLM (GPT-4o)',
      consumed: 245000,
      total: 500000,
      unit: 'tokens',
      cost: '$12.40',
      latency: '450ms',
      icon: Brain,
      color: 'bg-purple-600',
    },
    {
      service: 'TTS (OpenAI)',
      consumed: 18500,
      total: 50000,
      unit: 'caracteres',
      cost: '$5.80',
      latency: '280ms',
      icon: Volume2,
      color: 'bg-green-600',
    },
    {
      service: 'STT (Deepgram)',
      consumed: 340,
      total: 1000,
      unit: 'minutos',
      cost: '$8.20',
      latency: '120ms',
      icon: Mic,
      color: 'bg-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stack de Alta Fiabilidad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stack Tecnológico</CardTitle>
              <CardDescription>Configuración de alta fiabilidad para rendimiento óptimo</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Operacional
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stackConfig.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </div>
                  <p className="text-sm">{item.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Consumo */}
      <div>
        <h2 className="text-xl mb-4">Métricas de Consumo</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {consumptionMetrics.map((metric) => {
            const Icon = metric.icon;
            const percentage = (metric.consumed / metric.total) * 100;
            
            return (
              <Card key={metric.service}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                        <Icon className={`h-5 w-5 ${metric.color.replace('bg-', 'text-')}`} />
                      </div>
                      <CardTitle className="text-base">{metric.service}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl">{metric.consumed.toLocaleString()}</span>
                      <span className="text-sm text-slate-600">
                        de {metric.total.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}% utilizado</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600">Costo</span>
                    </div>
                    <span className="text-sm">{metric.cost}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600">Latencia Promedio</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{metric.latency}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Alertas y Recomendaciones */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Recomendaciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              La temperatura 0.0 garantiza respuestas deterministas, ideal para el flujo de agendamiento.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              El uso de Deepgram Nova 2 proporciona la menor latencia en transcripción (120ms promedio).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
