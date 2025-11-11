'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Check, 
  Building2, 
  MessageSquare, 
  Phone, 
  Zap,
  CreditCard,
  Clock,
  Users,
  BarChart3,
  Shield,
  Headphones
} from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'month' | 'year';
  description: string;
  popular?: boolean;
  current?: boolean;
  features: PlanFeature[];
  limits: {
    businesses: number;
    chatbot: boolean;
    voiceAI: boolean;
    conversations: string;
    users: number;
  };
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    billingPeriod: 'month',
    description: 'Perfecto para pequeños negocios que recién empiezan',
    features: [
      { text: '1 negocio', included: true },
      { text: 'Chatbot AI para WhatsApp', included: true },
      { text: 'Instagram y Facebook integrados', included: true },
      { text: 'Hasta 500 conversaciones/mes', included: true },
      { text: '1 usuario', included: true },
      { text: 'Reportes básicos', included: true },
      { text: 'Voice AI Receptionist', included: false },
      { text: 'Soporte prioritario', included: false },
      { text: 'API Access', included: false }
    ],
    limits: {
      businesses: 1,
      chatbot: true,
      voiceAI: false,
      conversations: '500/mes',
      users: 1
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    billingPeriod: 'month',
    description: 'Ideal para negocios en crecimiento que necesitan más capacidad',
    popular: true,
    current: true,
    features: [
      { text: 'Hasta 3 negocios', included: true },
      { text: 'Chatbot AI para WhatsApp', included: true },
      { text: 'Instagram y Facebook integrados', included: true },
      { text: 'Voice AI Receptionist', included: true },
      { text: 'Hasta 2,000 conversaciones/mes', included: true },
      { text: 'Hasta 3 usuarios', included: true },
      { text: 'Reportes avanzados', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'API Access', included: false }
    ],
    limits: {
      businesses: 3,
      chatbot: true,
      voiceAI: true,
      conversations: '2,000/mes',
      users: 3
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    billingPeriod: 'month',
    description: 'Para empresas con múltiples locaciones y alto volumen',
    features: [
      { text: 'Hasta 10 negocios', included: true },
      { text: 'Chatbot AI para WhatsApp', included: true },
      { text: 'Instagram y Facebook integrados', included: true },
      { text: 'Voice AI Receptionist', included: true },
      { text: 'Conversaciones ilimitadas', included: true },
      { text: 'Usuarios ilimitados', included: true },
      { text: 'Reportes y analytics avanzados', included: true },
      { text: 'Soporte prioritario 24/7', included: true },
      { text: 'API Access completo', included: true }
    ],
    limits: {
      businesses: 10,
      chatbot: true,
      voiceAI: true,
      conversations: 'Ilimitadas',
      users: 999
    }
  }
];

function PlanCard({ plan, billingPeriod }: { plan: Plan; billingPeriod: 'monthly' | 'yearly' }) {
  const displayPrice = billingPeriod === 'yearly' 
    ? Math.round(plan.price * 12 * 0.8) // 20% descuento anual
    : plan.price;
  
  const monthlyEquivalent = billingPeriod === 'yearly'
    ? Math.round(plan.price * 0.8) // Precio mensual con descuento
    : null;

  return (
    <Card className={`relative ${plan.popular ? 'border-purple-500 border-2 shadow-lg' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white px-4 py-1">
            Más Popular
          </Badge>
        </div>
      )}
      
      {plan.current && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-600 text-white px-4 py-1">
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8 pt-8">
        <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
        <CardDescription className="text-sm mb-4">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl">${displayPrice}</span>
          <span className="text-gray-500 ml-2">/{billingPeriod === 'monthly' ? 'mes' : 'año'}</span>
          {monthlyEquivalent && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">(${monthlyEquivalent}/mes)</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Limits */}
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>{plan.limits.businesses} {plan.limits.businesses === 1 ? 'negocio' : 'negocios'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>{plan.limits.conversations}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-600" />
            <span>{plan.limits.users === 999 ? 'Ilimitados' : plan.limits.users} {plan.limits.users === 1 ? 'usuario' : 'usuarios'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-purple-600" />
            <span>{plan.limits.voiceAI ? 'Voice AI' : 'Solo Chat'}</span>
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.included ? 'text-green-600' : 'text-gray-300'}`} />
              <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        {plan.current ? (
          <Button variant="outline" className="w-full" disabled>
            Plan Actual
          </Button>
        ) : (
          <Button 
            className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            variant={plan.popular ? 'default' : 'outline'}
          >
            {plan.price > (plans.find(p => p.current)?.price || 0) ? 'Upgrade' : 'Downgrade'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function Planes() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const currentPlan = plans.find(p => p.current);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Planes y Pagos</h1>
            <p className="text-sm text-gray-500">
              Elige el plan que mejor se adapte a las necesidades de tu negocio
            </p>
          </div>
          <BusinessSelector />
        </div>
      </div>

      <div className="p-8">
        {/* Current Plan Info */}
        {currentPlan && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg">Tu plan actual: {currentPlan.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Estás disfrutando de {currentPlan.limits.chatbot && 'Chatbot AI'}
                    {currentPlan.limits.chatbot && currentPlan.limits.voiceAI && ' + '}
                    {currentPlan.limits.voiceAI && 'Voice AI Receptionist'} para hasta {currentPlan.limits.businesses} {currentPlan.limits.businesses === 1 ? 'negocio' : 'negocios'}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Próximo pago: 15 Dic 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>Visa •••• 4242</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl mb-1">${currentPlan.price}</p>
                  <p className="text-sm text-gray-500">por mes</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Gestionar pago
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <Badge className="ml-2 bg-green-600 text-white text-xs">
                Ahorra 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billingPeriod={billingPeriod} />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl text-center mb-8">Comparación de características</h2>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium">Características</th>
                      <th className="text-center p-4 font-medium">Starter</th>
                      <th className="text-center p-4 font-medium bg-purple-50">Professional</th>
                      <th className="text-center p-4 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          Cantidad de negocios
                        </div>
                      </td>
                      <td className="text-center p-4 text-sm">1</td>
                      <td className="text-center p-4 text-sm bg-purple-50">3</td>
                      <td className="text-center p-4 text-sm">10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          Chatbot AI
                        </div>
                      </td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          Voice AI Receptionist
                        </div>
                      </td>
                      <td className="text-center p-4 text-gray-300">-</td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-500" />
                          Conversaciones mensuales
                        </div>
                      </td>
                      <td className="text-center p-4 text-sm">500</td>
                      <td className="text-center p-4 text-sm bg-purple-50">2,000</td>
                      <td className="text-center p-4 text-sm">Ilimitadas</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          Usuarios
                        </div>
                      </td>
                      <td className="text-center p-4 text-sm">1</td>
                      <td className="text-center p-4 text-sm bg-purple-50">3</td>
                      <td className="text-center p-4 text-sm">Ilimitados</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-gray-500" />
                          Soporte
                        </div>
                      </td>
                      <td className="text-center p-4 text-sm">Email</td>
                      <td className="text-center p-4 text-sm bg-purple-50">Prioritario</td>
                      <td className="text-center p-4 text-sm">24/7 Dedicado</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          API Access
                        </div>
                      </td>
                      <td className="text-center p-4 text-gray-300">-</td>
                      <td className="text-center p-4 text-gray-300 bg-purple-50">-</td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-12">
          <h2 className="text-2xl text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo cambiar de plan en cualquier momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente y ajustaremos el precio de manera proporcional.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué sucede si supero mi límite de conversaciones?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Te notificaremos cuando estés cerca de tu límite. Puedes actualizar tu plan o las conversaciones adicionales se cobrarán a $0.10 por conversación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Ofrecen garantía de devolución de dinero?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sí, ofrecemos una garantía de devolución de dinero de 14 días. Si no estás satisfecho, te reembolsaremos el 100% sin preguntas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
