'use client';

import { Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Testimonials() {
  const testimonials = [
    {
      name: "Ana",
      role: "Clínicas Nova",
      image: "https://images.unsplash.com/photo-1496180470114-6ef490f3ff22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc2MzEyODIzN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      quote: "Duplicamos los leads calificados fuera de horario.",
    },
    {
      name: "Luis",
      role: "Cowork Labs",
      image: "https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjB0ZWNofGVufDF8fHx8MTc2MzEwNDUwNXww&ixlib=rb-4.1.0&q=80&w=1080",
      quote: "La IA filtra y agenda, nuestro equipo solo atiende casos complejos.",
    },
    {
      name: "Sofía",
      role: "Grupo Odonto",
      image: "https://images.unsplash.com/photo-1758876204244-930299843f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBlcnNvbiUyMHNtaWxpbmd8ZW58MXx8fHwxNzYzMDU2MTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      quote: "Implementamos en una semana y el NPS subió 12 puntos.",
    },
  ];

  return (
    <section id="testimonials" className="py-24 px-4 relative bg-gray-900">
      {/* Subtle background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-white mb-4">
            Lo que dicen{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              nuestros clientes
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-indigo-500/30 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500/30">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900"></div>
                </div>
                <div>
                  <div className="text-white">{testimonial.name}</div>
                  <div className="text-gray-300">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}