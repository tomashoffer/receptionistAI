'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setUser, setBusinesses, setActiveBusiness } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Login request
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Load businesses after successful login
      try {
        const businessResponse = await fetch(`${API_BASE_URL}/businesses`, {
          credentials: 'include',
        });
        
        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          const businessesList = Array.isArray(businessData) ? businessData : [businessData];
          setBusinesses(businessesList);
          
          if (businessesList.length > 0) {
            setActiveBusiness(businessesList[0]);
          }
        }
      } catch (error) {
        console.error('Error loading businesses:', error);
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error en login:', err);
      
      // Manejar errores específicos
      let errorMessage = 'Credenciales inválidas. Intenta nuevamente.';
      
      if (err.message) {
        if (err.message.includes('No autorizado') || err.message.includes('credenciales')) {
          errorMessage = 'Email o contraseña incorrectos. Verifica tus datos.';
        } else if (err.message.includes('servidor')) {
          errorMessage = 'Error del servidor. Inténtalo más tarde.';
        } else if (err.message.includes('No tienes permisos')) {
          errorMessage = 'Tu cuenta no tiene permisos para acceder.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ReceptionistAI
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Inicia sesión en tu cuenta
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          {/* Enlace de registro FUERA del formulario */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="font-medium text-indigo-600 hover:text-indigo-500 underline"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
  );
}