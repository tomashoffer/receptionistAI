'use client';

import React from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import DarkModeToggle from '@/components/DarkModeToggle';
import { CheckIcon, PhoneIcon, Cog6ToothIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function MainLandingPage() {
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/main" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">AI</div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Recepcionista AI</span>
          </Link>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/login" className="px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Login</Link>
                <Link href="/register" className="px-3 py-2 text-sm rounded-md text-white bg-emerald-600 hover:bg-emerald-700">Registrarse</Link>
              </>
            ) : (
              <Link href="/dashboard" className="px-3 py-2 text-sm rounded-md text-white bg-emerald-600 hover:bg-emerald-700">Ir al Dashboard</Link>
            )}
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Agenda y atiende llamadas con una <span className="text-emerald-500">Recepcionista AI</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Automatiza la toma de turnos, responde preguntas frecuentes y conecta con tus herramientas como Google Calendar. 24/7, en Español e Inglés.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={user ? '/dashboard' : '/login'} className="px-5 py-3 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
                  {user ? 'Abrir Dashboard' : 'Comenzar gratis'}
                </Link>
                <a href="#como-funciona" className="px-5 py-3 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Cómo funciona
                </a>
              </div>
              <div className="mt-6 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center"><CheckIcon className="w-4 h-4 text-emerald-500 mr-1"/>Sin tarjeta de crédito</div>
                <div className="flex items-center"><CheckIcon className="w-4 h-4 text-emerald-500 mr-1"/>Activación inmediata</div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-gray-800 border border-emerald-200 dark:border-gray-700">
                    <PhoneIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Atención telefónica</p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700">
                    <CalendarDaysIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Turnos automáticos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-700">
                    <Cog6ToothIcon className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Fácil configuración</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
                    <CheckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">24/7 en ES/EN</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-16 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cómo funciona</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">1. Configura</div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Define el comportamiento, idioma y voz. Conecta Google Calendar opcionalmente.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">2. Publica</div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Activa tu recepcionista para que atienda llamadas reales.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">3. Gestiona</div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Visualiza turnos y actividad desde tu dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Empieza en minutos</h3>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Crea tu cuenta gratis y configura tu recepcionista en menos de 5 minutos.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={user ? '/dashboard' : '/register'} className="px-5 py-3 rounded-md text-white bg-emerald-600 hover:bg-emerald-700">{user ? 'Ir al Dashboard' : 'Crear cuenta'}</Link>
            {!user && (
              <Link href="/login" className="px-5 py-3 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Ya tengo cuenta</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


