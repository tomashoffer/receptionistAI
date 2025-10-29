'use client';

import { useEffect } from 'react';
import { useDarkModeStore } from '@/stores/darkModeStore';

export default function DarkModeInitializer() {
  const { isDarkMode, setDarkMode } = useDarkModeStore();

  useEffect(() => {
    // Aplicar el tema inicial basado en localStorage antes de rehidratar
    // Esto previene el flash de contenido sin tema
    const savedTheme = localStorage.getItem('dark-mode-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        const shouldBeDark = parsed.state?.isDarkMode || false;
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Error parsing dark mode storage:', e);
      }
    }
  }, []);

  // Sincronizar cuando cambia el estado
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return null;
}

