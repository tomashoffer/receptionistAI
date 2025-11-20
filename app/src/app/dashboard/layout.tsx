'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Menu } from 'lucide-react';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Función para abrir el menú mobile
  const handleOpenMenu = () => setIsMobileMenuOpen(true);

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Si la respuesta no es ok, redirigir a login solo si no hay usuario en el store
          if (!user) {
            router.push('/login');
          }
          return;
        }
        
        // Si la respuesta es ok, obtener los datos del usuario
        const data = await response.json();
        if (data && !user) {
          // Solo actualizar si no hay usuario en el store
          const { setUser } = useUserStore.getState();
          setUser(data);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Solo redirigir si no hay usuario en el store
        if (!user) {
          router.push('/login');
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Si ya hay usuario en el store, no verificar
    if (user) {
      setIsChecking(false);
      return;
    }

    checkAuth();
  }, [router, user]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .mobile-overlay {
          display: ${isMobileMenuOpen ? 'block' : 'none'};
        }
        
        @media (width >= 1024px) {
          .mobile-overlay {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Overlay oscuro - solo visible en mobile cuando el menú está abierto */}
        <div
          className="mobile-overlay fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <AppSidebar 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Contenido principal */}
        <LayoutProvider value={{ openMobileMenu: handleOpenMenu }}>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </LayoutProvider>
      </div>
      <Toaster />
    </>
  );
}

