'use client';

import { Play } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function DemoSection() {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
            Ve ReceptionistAI{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              en acción
            </span>
          </h2>
          <p className="text-xl text-gray-700">
            Observa cómo el agente contesta llamadas reales, entiende la intención y agenda en segundos
          </p>
        </div>

        {/* Laptop mockup */}
        <div className="relative">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 blur-3xl"></div>
          
          <div className="relative bg-white rounded-3xl p-3 border border-gray-200 shadow-2xl">
            {/* Laptop frame */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-800">
              <div className="aspect-video relative group cursor-pointer">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1694375073673-fc3f0b706d8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMGFzc2lzdGFudCUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NjMxMzE5NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="ReceptionistAI Dashboard"
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-emerald-900/60 flex items-center justify-center group-hover:bg-indigo-900/70 transition-all">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-8 h-8 text-indigo-600 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop base */}
          <div className="w-full h-4 bg-gradient-to-b from-gray-200 to-gray-300 rounded-b-3xl mx-auto mt-1"></div>
          <div className="w-1/2 h-1 bg-gray-300 rounded-full mx-auto"></div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Ver demostración
          </Button>
        </div>
      </div>
    </section>
  );
}