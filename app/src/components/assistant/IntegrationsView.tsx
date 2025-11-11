import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, CreditCard, CheckCircle, AlertCircle, Settings } from 'lucide-react';

export function IntegrationsView() {
  const integrations = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincronización automática de citas con Google Calendar',
      icon: Calendar,
      status: 'connected',
      lastSync: '2025-11-10 14:30',
      details: {
        account: 'business@empresa.com',
        calendar: 'Citas - ReceptionistAI',
        permissions: 'Lectura y Escritura',
      },
    },
    {
      id: 'mercado-pago',
      name: 'Mercado Pago',
      description: 'Procesamiento de pagos y confirmaciones',
      icon: CreditCard,
      status: 'disconnected',
      lastSync: null,
      details: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Integraciones</h1>
        <p className="text-slate-600 mt-1">
          Gestiona las conexiones con servicios externos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integration.status === 'connected';

          return (
            <Card key={integration.id} className={isConnected ? 'border-green-200' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        isConnected ? 'bg-green-100' : 'bg-slate-100'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isConnected ? 'text-green-600' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={isConnected ? 'default' : 'secondary'}
                    className={
                      isConnected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Desconectado
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected && integration.details ? (
                  <>
                    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Cuenta:</span>
                        <span>{integration.details.account}</span>
                      </div>
                      {integration.details.calendar && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Calendario:</span>
                          <span>{integration.details.calendar}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Permisos:</span>
                        <span>{integration.details.permissions}</span>
                      </div>
                      {integration.lastSync && (
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-slate-600">Última Sincronización:</span>
                          <span className="text-green-600">{integration.lastSync}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        Desconectar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600">
                      Conecta {integration.name} para habilitar la funcionalidad completa de agendamiento.
                    </p>
                    <Button className="w-full">Conectar {integration.name}</Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* OAuth Flow Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Sobre las Integraciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              <strong>Google Calendar</strong>: Utiliza OAuth 2.0 para autorización segura. Todas las citas se sincronizan
              automáticamente en ambas direcciones.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              <strong>Mercado Pago</strong>: Integración opcional para procesar pagos anticipados y enviar
              confirmaciones automáticas.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              <strong>Seguridad</strong>: Todas las credenciales se almacenan de forma encriptada. Nunca compartimos
              tu información con terceros.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
