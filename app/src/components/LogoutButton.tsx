'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useAssistantStore } from '@/stores/assistantStore';

export function LogoutButton() {
  const router = useRouter();
  const { clearUser, setIsLoggingOut, reset: resetUserStore } = useUserStore();
  const { reset: resetAssistantStore } = useAssistantStore();

  const handleLogout = async () => {
    try {
      // 1. Set logging out state
      setIsLoggingOut(true);
      
      // 2. Call the API route to securely destroy the server-side session cookies.
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // 3. Clear the user data from the client-side global store.
      clearUser();
      
      // 4. Reset all stores to clear their state
      resetUserStore();
      resetAssistantStore();
      
      // 5. Clear localStorage completely (including Zustand persisted stores)
      localStorage.removeItem('assistant-storage');
      localStorage.removeItem('user-store-storage');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // 6. Clear sessionStorage
      sessionStorage.clear();
      
      // 7. Redirect the user to the login page directly (no middleware, no StateSyncer).
      window.location.href = '/login'; 
    } catch (error) {
      console.error("Failed to logout:", error);
      // Provide user feedback in case of an error.
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-3 rounded-md font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
