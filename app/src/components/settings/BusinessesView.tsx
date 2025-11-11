import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, Plus, Settings, Users, Calendar } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'inactive';
  plan: 'starter' | 'professional' | 'enterprise';
  users: number;
  appointments: number;
  createdAt: string;
}

const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Salón de Belleza Elite',
    industry: 'Belleza y Estética',
    status: 'active',
    plan: 'professional',
    users: 3,
    appointments: 856,
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Clínica Dental Dr. Smith',
    industry: 'Salud',
    status: 'active',
    plan: 'enterprise',
    users: 5,
    appointments: 1234,
    createdAt: '2025-03-20',
  },
  {
    id: '3',
    name: 'Gym FitPro',
    industry: 'Fitness',
    status: 'inactive',
    plan: 'starter',
    users: 1,
    appointments: 234,
    createdAt: '2024-11-10',
  },
];

export function BusinessesView() {
  const getPlanBadge = (plan: string) => {
    const config = {
      starter: { color: 'bg-slate-100 text-slate-700', label: 'Starter' },
      professional: { color: 'bg-blue-100 text-blue-700', label: 'Professional' },
      enterprise: { color: 'bg-purple-100 text-purple-700', label: 'Enterprise' },
    };
    return config[plan as keyof typeof config] || config.starter;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Mis Negocios</h1>
          <p className="text-slate-600 mt-1">
            Administración multi-tenant de tus negocios
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Negocio
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Negocios</p>
                <p className="text-3xl mt-1">{mockBusinesses.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Negocios Activos</p>
                <p className="text-3xl mt-1 text-green-600">
                  {mockBusinesses.filter((b) => b.status === 'active').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Citas</p>
                <p className="text-3xl mt-1">
                  {mockBusinesses.reduce((sum, b) => sum + b.appointments, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockBusinesses.map((business) => {
          const planBadge = getPlanBadge(business.plan);

          return (
            <Card
              key={business.id}
              className={
                business.status === 'active' ? 'border-green-200' : 'border-slate-200'
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        business.status === 'active' ? 'bg-indigo-100' : 'bg-slate-100'
                      }`}
                    >
                      <Building2
                        className={`h-6 w-6 ${
                          business.status === 'active' ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle>{business.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {business.industry}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={business.status === 'active' ? 'default' : 'secondary'}
                    className={
                      business.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {business.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Badge */}
                <div>
                  <Badge variant="outline" className={planBadge.color}>
                    {planBadge.label} Plan
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-600">Usuarios</p>
                      <p className="text-sm">{business.users}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-600">Citas Totales</p>
                      <p className="text-sm">{business.appointments}</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-slate-500">
                  Creado el {new Date(business.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                  <Button className="flex-1">Acceder</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Arquitectura Multi-Tenant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              Cada negocio (business.entity.ts) tiene su propia configuración independiente de asistente, prompts,
              integraciones y canales.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              Los datos están completamente aislados entre negocios, garantizando privacidad y seguridad.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-sm text-blue-900">
              Puedes cambiar entre negocios fácilmente manteniendo una única cuenta de usuario.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
