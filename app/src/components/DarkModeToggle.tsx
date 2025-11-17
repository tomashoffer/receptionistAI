'use client';

import { useEffect } from 'react';
import { useDarkModeStore } from '@/stores/darkModeStore';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkModeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      aria-pressed={isDarkMode}
      className="gap-2"
    >
      {isDarkMode ? (
        <>
          <SunIcon className="h-4 w-4" />
          Light Mode
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4" />
          Dark Mode
        </>
      )}
    </Button>
  );
}
