import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Phone, Globe, Copy, Plus, Settings, CheckCircle } from 'lucide-react';

export function ChannelsView() {
  const channels = [
    {
      id: '1',
      type: 'widget',
      name: 'Widget Web',
      description: 'Widget de voz embebido en tu sitio web',
      status: 'active',
      endpoint: 'https://api.vapi.ai/widget/abc123xyz',
      stats: {
        calls: 450,
        successful: 312,
        avgDuration: '3:45',
      },
    },
    {
      id: '2',
      type: 'phone',
      name: 'Línea Telefónica',
      description: 'Número de teléfono dedicado con AI',
      status: 'active',
      endpoint: '+52 55 1234 5678',
      stats: {
        calls: 784,
        successful: 544,
        avgDuration: '4:12',
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Canales</h1>
          <p className="text-slate-600 mt-1">
            Gestión de endpoints del Widget de Vapi y números de teléfono
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Canal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {channels.map((channel) => {
          const Icon = channel.type === 'widget' ? Globe : Phone;
          const isActive = channel.status === 'active';

          return (
            <Card key={channel.id} className={isActive ? 'border-green-200' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-indigo-100">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle>{channel.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {channel.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Endpoint */}
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">
                      {channel.type === 'widget' ? 'Endpoint URL' : 'Número'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => navigator.clipboard.writeText(channel.endpoint)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm break-all">{channel.endpoint}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-slate-600 mb-1">Llamadas</p>
                    <p className="text-xl">{channel.stats.calls}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-slate-600 mb-1">Exitosas</p>
                    <p className="text-xl text-green-600">{channel.stats.successful}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-slate-600 mb-1">Promedio</p>
                    <p className="text-xl">{channel.stats.avgDuration}</p>
                  </div>
                </div>

                {/* Widget Embed Code */}
                {channel.type === 'widget' && (
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <p className="text-xs text-slate-400 mb-2">Código de Integración:</p>
                    <code className="text-xs text-green-400 font-mono block whitespace-pre-wrap">
{`<script src="https://cdn.vapi.ai/widget.js"></script>
<script>
  VapiWidget.init({
    apiKey: "abc123xyz",
    assistantId: "your-assistant-id"
  });
</script>`}
                    </code>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Desactivar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Sobre los Canales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              <strong>Widget Web</strong>: Integra fácilmente la AI de voz en tu sitio web. Los visitantes pueden
              hablar directamente con tu recepcionista.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              <strong>Línea Telefónica</strong>: Número dedicado con tecnología Vapi para recibir llamadas directas.
              Se integra con tu sistema de agendamiento.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              Todos los canales comparten la misma configuración de asistente, prompts y tools para una experiencia
              consistente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
