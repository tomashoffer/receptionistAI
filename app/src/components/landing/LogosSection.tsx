'use client';

export function LogosSection() {
  const logos = [
    "TechCorp",
    "InnovateLab",
    "CloudSync",
    "DataFlow",
    "NextGen",
    "SmartBiz",
  ];

  return (
    <section className="py-16 px-4 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto max-w-7xl">
        <p className="text-center text-gray-500 mb-8">
          Confían en ReceptionistAI más de 500+ empresas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              <div className="text-xl text-gray-700 hover:text-indigo-600 transition-colors">
                {logo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}