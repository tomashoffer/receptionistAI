'use client';

import { Phone, Zap, Calendar, Bot, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

interface HeroProps {
  onNavigate?: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600">IA de última generación</span>
            </div>

            <h1 className="text-5xl lg:text-7xl text-gray-900 leading-tight">
              La Recepción 24/7 que tu negocio{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                merece
              </span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed">
              Atendemos cada llamada y mensaje con Voice AI de baja latencia y Chatbot. Calificamos leads en segundos y agendamos citas instantáneamente. Sin esperas, sin pérdidas.
            </p>

            {/* Highlights */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-900">
                <Phone className="w-5 h-5 text-indigo-600" />
                <span>98% de llamadas atendidas</span>
              </div>
              <div className="flex items-center gap-3 text-gray-900">
                <Zap className="w-5 h-5 text-emerald-600" />
                <span>Respuesta en {"<"}300 ms</span>
              </div>
              <div className="flex items-center gap-3 text-gray-900">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Integración total con Calendario & CRM</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onNavigate?.("register")}
              >
                Probar demo de voz
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-200 text-indigo-600 hover:bg-indigo-50"
                onClick={() => onNavigate?.("login")}
              >
                Ver planes y precios
              </Button>
            </div>
          </div>

          {/* Right content - Floating widgets */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl shadow-indigo-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-900">ReceptionistAI</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-500">En línea</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Chat bubble */}
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-indigo-600 mt-1" />
                      <div>
                        <p className="text-gray-900">¡Hola! ¿En qué puedo ayudarte hoy?</p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar widget */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-900">Próximas citas</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                        <span>10:00 - Consulta inicial</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                        <span>14:30 - Seguimiento</span>
                      </div>
                    </div>
                  </div>

                  {/* Analytics widget */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900">Leads capturados</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl text-indigo-600">+127%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-full px-6 py-3 shadow-lg">
              <span className="text-white">24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}