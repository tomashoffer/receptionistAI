'use client';

import { useState, useEffect } from 'react';
import { Contactos } from './Contactos';
import { ContactosMobile } from './ContactosMobile';

export function ContactosWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Loading inicial
  if (isMobile === null) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  return isMobile ? <ContactosMobile /> : <Contactos />;
}



