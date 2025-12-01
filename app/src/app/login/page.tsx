'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../landing.css';
import { Login } from '@/components/landing/Login';
import { useUserStore } from '@/stores/userStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Si hay query param ?logout=true, NO llamar a auth/me (evita regenerar sesión)
      const isLogout = searchParams.get('logout') === 'true';
      if (isLogout) {
        console.log('🔒 Login: Detectado logout, omitiendo verificación de auth/me');
        // Limpiar el flag de sessionStorage si existe
        sessionStorage.removeItem('isLoggingOut');
        setIsChecking(false);
        return;
      }

      // Si ya hay usuario en el store, redirigir inmediatamente
      if (user) {
        router.replace('/dashboard');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setUser(data);
            router.replace('/dashboard');
            return;
          }
        }
        // Si la respuesta no es ok o no hay datos, simplemente mostrar el formulario de login
      } catch (error) {
        console.warn('No authenticated user', error);
        // En caso de error, simplemente mostrar el formulario de login
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, user, setUser, searchParams]);

  const handleNavigate = (page: string) => {
    if (page === 'register') {
      router.push('/register');
      return;
    }

    router.push('/');
  };

  if (isChecking) {
    return (
      <div className="landing-theme min-h-screen flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="landing-theme min-h-screen">
      <Login onNavigate={handleNavigate} />
    </div>
  );
}

