'use client';

import { Phone, MessageCircle, Calendar, BarChart3 } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Phone,
      title: "Voice AI humana",
      description: "Voz natural y multilingüe que saluda, comprende y responde con latencia imperceptible.",
    },
    {
      icon: MessageCircle,
      title: "Chat inteligente omnicanal",
      description: "Tus visitantes viven el mismo flujo automatizado en web, WhatsApp o SMS sin perder contexto.",
    },
    {
      icon: Calendar,
      title: "Agenda y transferencia de leads",
      description: "Calificamos y transferimos en caliente o agendamos directo en Google Calendar / Outlook.",
    },
    {
      icon: BarChart3,
      title: "Analítica y optimización",
      description: "Mide tasa de atención, duración y motivos para optimizar la operación y entender a tus clientes.",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
            Todo lo que necesitas para{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              automatizar tu recepción
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Una solución completa de Voice AI y Chat que se adapta a las necesidades de tu negocio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-600 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-700 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}