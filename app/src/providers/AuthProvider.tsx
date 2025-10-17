'use client';

import { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User } from '@/types/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const checkAuth = async () => {
    try {
      // Verificar si hay token en localStorage
      const storedToken = localStorage.getItem('accessToken');
      
      // Verificar autenticación con cookies (para Google OAuth)
      const response = await fetch(`${apiUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Incluir cookies
        headers: storedToken ? {
          'Authorization': `Bearer ${storedToken}`,
        } : {},
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Si no hay token en localStorage pero la autenticación fue exitosa,
        // significa que el usuario se autenticó con Google OAuth
        if (!storedToken) {
          // Intentar obtener el token de la respuesta o de las cookies
          const tokenFromResponse = response.headers.get('Authorization');
          if (tokenFromResponse) {
            const token = tokenFromResponse.replace('Bearer ', '');
            localStorage.setItem('accessToken', token);
            setAccessToken(token);
          }
        } else {
          setAccessToken(storedToken);
        }
      } else {
        // Token inválido, limpiar
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const loginData = await response.json();
        
        // Guardar token y datos del usuario
        localStorage.setItem('accessToken', loginData.token.accessToken);
        setAccessToken(loginData.token.accessToken);
        setUser(loginData.user);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setAccessToken(null);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar autenticación cuando se carga la página (útil después del login con Google)
  useEffect(() => {
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const refreshAuth = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    accessToken,
    login,
    logout,
    checkAuth,
    getAuthHeaders,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
