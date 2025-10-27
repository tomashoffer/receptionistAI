'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export default function LogoutButton() {
  const router = useRouter();
  const { clearUser, setIsLoggingOut } = useUserStore();

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
      
      // 4. Redirect the user to the login page directly (no middleware, no StateSyncer).
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
