'use client';

import { Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Ideal para hasta 500 llamadas/mes",
      features: [
        "Hasta 500 conversaciones/mes",
        "Voice AI + Chat bot",
        "Integración con calendario",
        "Reportes mensuales",
        "Soporte por email",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "149",
      description: "Para equipos que necesitan más",
      features: [
        "Conversaciones ilimitadas",
        "Voice AI + Chat omnicanal",
        "Transferencia en caliente",
        "Integración WhatsApp",
        "Integración CRM completa",
        "Reportes avanzados semanales",
        "Soporte prioritario 24/7",
        "Analytics en tiempo real",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      description: "Volúmenes ilimitados e integración dedicada",
      features: [
        "Todo de Pro incluido",
        "IA personalizada a tu marca",
        "Múltiples agentes virtuales",
        "API dedicada",
        "Onboarding personalizado",
        "Account manager dedicado",
        "SLA garantizado",
        "Hosting dedicado",
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
            Planes diseñados para{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              cada negocio
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6">
            Todos incluyen agente de voz y chatbot sincronizado
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 bg-white ${
                plan.highlighted
                  ? "border-indigo-600 shadow-xl shadow-indigo-500/20 scale-105"
                  : "border-gray-200"
              } transition-all duration-300 hover:border-indigo-600`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-full px-4 py-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white">Más popular</span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-700">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.price === "Personalizado" ? (
                  <div className="text-3xl text-gray-900">{plan.price}</div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl text-gray-900">${plan.price}</span>
                    <span className="text-gray-700">/mes</span>
                  </div>
                )}
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-white hover:bg-indigo-50 text-indigo-600 border-gray-200"
                }`}
                size="lg"
              >
                Comenzar
              </Button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="border-gray-200 text-indigo-600 hover:bg-indigo-50">
            Comparar planes
          </Button>
        </div>
      </div>
    </section>
  );
}