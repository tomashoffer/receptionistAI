'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "¿La voz suena realmente humana?",
      answer: "Sí, utilizamos la última tecnología en Voice AI con voces ultra realistas y latencia imperceptible (<300ms). La mayoría de las personas no pueden distinguir entre nuestra IA y una recepcionista humana.",
    },
    {
      question: "¿Puedo personalizar scripts y horarios?",
      answer: "Absolutamente. Puedes configurar scripts personalizados, horarios de atención específicos, y ajustar el tono de voz según tu marca. Tienes control total sobre cómo la IA interactúa con tus clientes.",
    },
    {
      question: "¿Cuánto tarda la implementación?",
      answer: "La mayoría de nuestros clientes tienen su recepcionista IA funcionando en menos de 48 horas. Nuestro equipo te guía en cada paso del proceso de configuración e integración.",
    },
    {
      question: "¿Qué idiomas soporta?",
      answer: "Actualmente soportamos español, inglés, portugués y francés. La IA puede incluso manejar conversaciones multilingües, detectando automáticamente el idioma del cliente.",
    },
    {
      question: "¿Qué pasa si necesito pasar a un humano?",
      answer: "ReceptionistAI puede transferir llamadas en caliente a tu equipo cuando detecta casos complejos o según las reglas que configures. La transición es fluida y el agente humano recibe el contexto completo de la conversación.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
            Preguntas{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              frecuentes
            </span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-gray-50 rounded-xl border border-gray-200 px-6 data-[state=open]:border-indigo-600 transition-all"
            >
              <AccordionTrigger className="text-gray-900 hover:text-indigo-600 text-left py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}