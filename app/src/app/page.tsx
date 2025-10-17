'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from '@/pages/HomePage';
import { useAuth } from '@/contexts/AuthContext';

export default function ReceptionistAI() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Esperar a que termine la verificación de autenticación
    if (!isLoading) {
      setIsChecking(false);
      
      // Si no hay usuario autenticado, redirigir al login
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Si hay usuario autenticado, mostrar la página principal
  return <HomePage />;
}