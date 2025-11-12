'use client';

import { useState, useEffect } from 'react';
import { Conversaciones } from './Conversaciones';
import { ConversacionesMobile } from './ConversacionesMobile';

export function ConversacionesWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Función para detectar el tamaño de pantalla
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint de Tailwind
    };

    // Verificar al montar
    checkMobile();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mostrar loading inicial para evitar flash
  if (isMobile === null) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  // Renderizar el componente apropiado
  return isMobile ? <ConversacionesMobile /> : <Conversaciones />;
}

