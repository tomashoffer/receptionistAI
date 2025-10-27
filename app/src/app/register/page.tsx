'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api.service';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    businessName: '',
    businessPhone: '',
    industry: 'salon',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      // Crear usuario y negocio usando el endpoint multitenant
      const data = await apiService.register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        business_name: formData.businessName,
        business_phone: formData.businessPhone,
        industry: formData.industry,
      });
      
      // Debug: ver qué devuelve el backend
      console.log('Respuesta del backend:', data);
      
      // Guardar tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Mostrar mensaje de éxito de forma segura
      const businessName = data.user?.businesses?.[0]?.name;
      if (businessName) {
        alert(`¡Cuenta creada exitosamente! Bienvenido a ${businessName}`);
      } else {
        alert('¡Cuenta creada exitosamente! Redirigiendo al dashboard.');
      }
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      
      if (error.message) {
        if (error.message.includes('ya existe')) {
          errorMessage = 'Este email ya está registrado. Intenta con otro email o inicia sesión.';
        } else if (error.message.includes('inválidos')) {
          errorMessage = 'Los datos ingresados no son válidos. Verifica la información.';
        } else if (error.message.includes('servidor')) {
          errorMessage = 'Error del servidor. Inténtalo más tarde.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ReceptionistAI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crea tu cuenta y configura tu recepcionista AI
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="firstName" className="sr-only">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="businessName" className="sr-only">
                Nombre del Negocio
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre del Negocio"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="businessPhone" className="sr-only">
                Número de Teléfono
              </label>
              <input
                id="businessPhone"
                name="businessPhone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Número de Teléfono"
                value={formData.businessPhone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="industry" className="sr-only">
                Tipo de Negocio
              </label>
              <select
                id="industry"
                name="industry"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.industry}
                onChange={handleChange}
              >
                <option value="salon">Peluquería</option>
                <option value="restaurant">Restaurante</option>
                <option value="clinic">Clínica Médica</option>
                <option value="spa">Spa</option>
                <option value="gym">Gimnasio</option>
                <option value="office">Oficina</option>
                <option value="retail">Tienda</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}