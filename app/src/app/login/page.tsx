'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../landing.css';
import { Login } from '@/components/landing/Login';
import { useUserStore } from '@/stores/userStore';

function LoginContent() {
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
        // Agregar timeout para evitar que se quede colgado si el backend está caído
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const response = await fetch('/api/auth/me', { 
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Timeout al verificar autenticación - backend no responde');
        } else {
          console.warn('No authenticated user', error);
        }
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
    <div className="landing-theme min-h-screen ">
      <Login onNavigate={handleNavigate} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="landing-theme min-h-screen flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

