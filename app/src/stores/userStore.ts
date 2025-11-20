'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

// INTERFACES OBLIGATORIAS
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  permissions?: string[];
  business_id?: string;
  business_name?: string;
}

export interface Assistant {
  id: string;
  business_id: string;
  name: string;
  prompt: string;
  first_message?: string;
  vapi_assistant_id?: string;
  vapi_public_key?: string;
  voice_id: string;
  voice_provider: string;
  language: string;
  model_provider: string;
  model_name: string;
  tools?: any[];
  required_fields?: any;
  server_url?: string;
  server_url_secret?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type IndustryType = 
  | 'hair_salon'
  | 'restaurant'
  | 'medical_clinic'
  | 'dental_clinic'
  | 'fitness_center'
  | 'beauty_salon'
  | 'law_firm'
  | 'consulting'
  | 'real_estate'
  | 'automotive'
  | 'hotel'
  | 'other';

export type BusinessStatus = 'active' | 'inactive' | 'suspended' | 'trial' | 'paused';

export interface Business {
  id: string;
  name: string;
  phone_number: string;
  industry: IndustryType;
  status: BusinessStatus;
  ai_prompt?: string;
  ai_voice_id?: string;
  ai_language?: string;
  vapi_assistant_id?: string;
  vapi_public_key?: string;
  business_hours?: any;
  workingHours?: any; // Alias para compatibilidad
  services?: any[];
  google_calendar_config?: any;
  google_drive_config?: any;
  owner_id: string;
  created_at: string;
  updated_at: string;
  assistant_id?: string;
  assistant?: Assistant;
  stats?: {
    conversations?: number;
    appointments?: number;
    automation?: number;
  };
}

// STORE INTERFACE
interface UserStore {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  businesses: Business[];
  activeBusiness: Business | null;
  _hasHydrated: boolean;
  
  // Métodos
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsLoggingOut: (loggingOut: boolean) => void;
  setBusinesses: (businesses: Business[]) => void;
  setActiveBusiness: (business: Business | null) => void;
  addBusiness: (business: Business) => void;
  updateBusiness: (businessId: string, updates: Partial<Business>) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
  getState: () => any;
}

// STORE IMPLEMENTATION
export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get): UserStore => ({
        // Estado inicial
        user: null as User | null,
        isLoading: true,
        isLoggingOut: false,
        businesses: [] as Business[],
        activeBusiness: null as Business | null,
        _hasHydrated: false,
        
        // Métodos de usuario
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsLoggingOut: (loggingOut) => set({ isLoggingOut: loggingOut }),
    
        // Métodos de negocios
        setBusinesses: (businesses) => set({ businesses }),
        setActiveBusiness: (business) => set({ activeBusiness: business }),
        addBusiness: (business) => set((state) => ({ 
          businesses: [...state.businesses, business] 
        })),
        updateBusiness: (businessId, updates) => {
          set((state) => ({
            businesses: state.businesses.map((b) => 
              b.id === businessId ? { ...b, ...updates } : b
            ),
            activeBusiness: state.activeBusiness?.id === businessId 
              ? { ...state.activeBusiness, ...updates } 
              : state.activeBusiness,
          }));
        },
        setHasHydrated: (value) => set({ _hasHydrated: value }),
        
        // Limpiar todo
        reset: () => set({ 
          user: null, 
          isLoading: false, 
          businesses: [], 
          activeBusiness: null 
        }),
        
        getState: () => get(),
      }),
      {
        name: 'user-store-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          activeBusiness: state.activeBusiness 
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state._hasHydrated = true;
          }
        },
      }
    ),
    {
      name: 'user-store',
    }
  )
);
