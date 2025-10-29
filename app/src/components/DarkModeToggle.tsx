'use client';

import { useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useDarkModeStore } from '@/stores/darkModeStore';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkModeStore();

  // Inicializar el tema cuando se monta el componente
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 focus:ring-emerald-500"
      aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <span className="absolute inset-0 flex items-center justify-between px-1.5">
        <SunIcon className="h-4 w-4 text-yellow-500" />
        <MoonIcon className="h-4 w-4 text-emerald-400" />
      </span>
      <span
        className={`inline-block h-5 w-5 transform rounded-full transition-transform duration-300 ease-in-out shadow-md ${
          isDarkMode ? 'translate-x-7 bg-emerald-500' : 'translate-x-0.5 bg-yellow-400'
        }`}
      >
        <span className="flex h-full w-full items-center justify-center">
          {isDarkMode ? (
            <MoonIcon className="h-4 w-4 text-white" />
          ) : (
            <SunIcon className="h-4 w-4 text-white" />
          )}
        </span>
      </span>
    </button>
  );
}
