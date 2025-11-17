'use client';

export function Metrics() {
  const metrics = [
    {
      value: "+20%",
      label: "de leads capturados fuera del horario comercial",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      value: "–75%",
      label: "de tareas repetitivas para tu equipo",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      value: "100%",
      label: "de disponibilidad 24/7 en voz y chat",
      color: "from-indigo-600 to-emerald-600",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-indigo-50 to-emerald-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
            Resultados que{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              impulsan tu negocio
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center hover:shadow-xl transition-shadow"
            >
              <div className={`text-5xl lg:text-6xl bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-4`}>
                {metric.value}
              </div>
              <p className="text-gray-700 leading-relaxed">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}