'use client';

import { createContext, useContext } from 'react';

interface LayoutContextType {
  openMobileMenu: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = LayoutContext.Provider;

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    return { openMobileMenu: () => {} }; // Valor por defecto si no hay provider
  }
  return context;
};








