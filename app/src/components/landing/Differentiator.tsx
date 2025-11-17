'use client';

import { Phone, Zap, Users } from "lucide-react";

export function Differentiator() {
  const reasons = [
    {
      icon: Phone,
      title: "El teléfono es urgencia",
      description: "El 80% de las consultas críticas llegan por llamada; ningún chatbot las cubre.",
    },
    {
      icon: Zap,
      title: "Conversación natural",
      description: "Respondemos en <300 ms, sin silencios incómodos ni experiencias robóticas.",
    },
    {
      icon: Users,
      title: "Canal a elección del cliente",
      description: "Voz para urgencias, chat para comodidad, tú no pierdes ningún lead.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
            ¿Por qué elegir{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Voice AI + Chat
            </span>{" "}
            y no solo un chatbot?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center border border-indigo-100">
                <reason.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl text-gray-900">{reason.title}</h3>
              <p className="text-gray-700 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}