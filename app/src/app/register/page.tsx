'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../landing.css';
import { Register } from '@/components/landing/Register';
import { useUserStore } from '@/stores/userStore';

export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        router.replace('/dashboard');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setUser(data);
            router.replace('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.warn('No authenticated user', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, user, setUser]);

  const handleNavigate = (page: string) => {
    if (page === 'login') {
      router.push('/login');
      return;
    }

    router.push('/');
  };

  if (isChecking) {
    return (
      <div className="landing-theme min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="landing-theme min-h-screen bg-white">
      <Register onNavigate={handleNavigate} />
    </div>
  );
}

