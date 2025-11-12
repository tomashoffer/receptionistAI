'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Menu } from 'lucide-react';
import { LayoutProvider } from '@/contexts/LayoutContext';

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
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

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
    </>
  );
}

