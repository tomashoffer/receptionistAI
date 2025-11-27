'use client';

import { ArrowRight, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-white">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="bg-white rounded-3xl p-12 lg:p-16 border border-gray-200 shadow-2xl text-center">
          <h2 className="text-4xl lg:text-6xl text-gray-900 mb-6">
            ¿Listo para transformar tu{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              atención al cliente?
            </span>
          </h2>
          
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Agenda una llamada con nuestro propio agente AI y vive la experiencia en tiempo real
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white group">
              <Phone className="w-5 h-5 mr-2" />
              Agenda una llamada
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-gray-200 text-indigo-600 hover:bg-indigo-50">
              Ver demo en vivo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Configuración en 48h</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto max-w-7xl relative z-10 mt-16">
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900">ReceptionistAI</span>
            </div>

            <div className="flex gap-6 text-gray-700">
              <a href="#" className="hover:text-indigo-600 transition-colors">Términos</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contacto</a>
            </div>

            <div className="text-gray-700">
              © 2025 ReceptionistAI. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}