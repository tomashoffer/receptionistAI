import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, CreditCard, Download, Zap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const plans = [
  {
    name: 'Starter',
    price: '$99',
    period: '/mes',
    description: 'Perfecto para emprendedores',
    features: [
      '500 llamadas/mes',
      '1 negocio',
      '2 usuarios',
      'Google Calendar',
      'Soporte por email',
    ],
    current: false,
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/mes',
    description: 'Para negocios en crecimiento',
    features: [
      '2,000 llamadas/mes',
      '3 negocios',
      '5 usuarios',
      'Todas las integraciones',
      'Soporte prioritario',
      'Auditoría conversacional',
    ],
    current: true,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$799',
    period: '/mes',
    description: 'Solución empresarial completa',
    features: [
      'Llamadas ilimitadas',
      'Negocios ilimitados',
      'Usuarios ilimitados',
      'Todas las integraciones',
      'Soporte 24/7',
      'Auditoría avanzada',
      'API personalizada',
      'Onboarding dedicado',
    ],
    current: false,
  },
];

const invoices = [
  {
    id: 'INV-2025-011',
    date: '2025-11-01',
    amount: '$299.00',
    status: 'paid',
    plan: 'Professional',
  },
  {
    id: 'INV-2025-010',
    date: '2025-10-01',
    amount: '$299.00',
    status: 'paid',
    plan: 'Professional',
  },
  {
    id: 'INV-2025-009',
    date: '2025-09-01',
    amount: '$299.00',
    status: 'paid',
    plan: 'Professional',
  },
  {
    id: 'INV-2025-008',
    date: '2025-08-01',
    amount: '$99.00',
    status: 'paid',
    plan: 'Starter',
  },
];

export function PlansPaymentsView() {
  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl">Planes y Pagos</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Gestión de suscripciones y facturación
        </p>
      </div>

      {/* Current Plan Overview */}
      <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-900/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
                <h3 className="text-lg text-indigo-900 dark:text-indigo-100">
                  Plan Actual: Professional
                </h3>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-200">
                Próxima renovación: 1 de Diciembre, 2025 • $299.00
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white dark:bg-transparent dark:text-indigo-100 dark:border-indigo-400 dark:hover:bg-indigo-500/20"
            >
              Gestionar Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div>
        <h2 className="text-2xl mb-4">Planes Disponibles</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.current
                  ? 'border-indigo-300 shadow-lg'
                  : plan.popular
                  ? 'border-indigo-200'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.current && (
                    <Badge className="bg-indigo-600">Plan Actual</Badge>
                  )}
                  {plan.popular && !plan.current && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl">{plan.price}</span>
                  <span className="text-slate-600 dark:text-slate-300">{plan.period}</span>
                </div>
                <CardDescription className="mt-2 text-slate-600 dark:text-slate-300">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.current ? 'dark:border-slate-600 dark:text-slate-100' : ''
                  }`}
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Plan Actual' : 'Cambiar a ' + plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="dark:bg-slate-900/40 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Método de Pago</CardTitle>
          <CardDescription>
            Gestiona tu método de pago para la facturación automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/40 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm">Visa •••• 4242</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vence 12/2026</p>
              </div>
            </div>
            <Button variant="outline" className="dark:border-slate-700 dark:text-slate-100">
              Actualizar
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full dark:border-slate-700 dark:text-slate-100 dark:hover:bg-white/10"
          >
            + Agregar Método de Pago
          </Button>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="dark:bg-slate-900/40 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Historial de Facturación</CardTitle>
          <CardDescription>
            Descarga tus facturas y revisa el historial de pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/40 dark:[&_tr]:border-slate-700">
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Fecha</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Plan</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Monto</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-300">Estado</TableHead>
                <TableHead className="text-right text-slate-600 dark:text-slate-300">
                  Acción
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {invoice.date}
                  </TableCell>
                  <TableCell>{invoice.plan}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                    >
                      Pagado
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="dark:text-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
