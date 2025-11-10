import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface User {
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

interface Business {
  id: string;
  name: string;
  phone_number: string;
  industry: string;
  status: string;
  ai_prompt?: string;
  ai_voice_id?: string;
  ai_language?: string;
  vapi_assistant_id?: string;
  vapi_public_key?: string;
  business_hours?: any;
  services?: any[];
  google_calendar_config?: any;
  google_drive_config?: any;
  owner_id: string;
  created_at: string;
  updated_at: string;
  assistant_id?: string;
  assistant?: {
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
  };
}

interface UserStore {
  // Usuario autenticado
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  
  // Negocios del usuario
  businesses: Business[];
  activeBusiness: Business | null;
  _hasHydrated: boolean; // Flag interno para saber si ya se hidrato desde localStorage
  
  // Métodos de usuario
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsLoggingOut: (loggingOut: boolean) => void;
  
  // Métodos de negocios
  setBusinesses: (businesses: Business[]) => void;
  setActiveBusiness: (business: Business | null) => void;
  addBusiness: (business: Business) => void;
  updateBusiness: (businessId: string, updates: Partial<Business>) => void;
  setHasHydrated: (value: boolean) => void;
  
  // Método para limpiar todo
  reset: () => void;
  
  // Método para debugging
  getState: () => any;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
      // Estado inicial
      user: null,
      isLoading: true,
      isLoggingOut: false,
      businesses: [],
      activeBusiness: null,
      _hasHydrated: false,
      
      // Métodos de usuario
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsLoggingOut: (loggingOut) => set({ isLoggingOut: loggingOut }),
  
  // Métodos de negocios
  setBusinesses: (businesses) => set({ businesses }),
  setActiveBusiness: (business) => {
    console.log('🔄 STORE - setActiveBusiness called with:', business);
    console.log('🔄 STORE - Business assistant:', business?.assistant);
    console.log('🔄 STORE - Business assistant vapi_assistant_id:', business?.assistant?.vapi_assistant_id);
    set({ activeBusiness: business });
    console.log('🔄 STORE - setActiveBusiness completed');
  },
  addBusiness: (business) => set((state) => ({ 
    businesses: [...state.businesses, business] 
  })),
  updateBusiness: (businessId, updates) => {
    console.log('🔄 STORE - updateBusiness called with:', { businessId, updates });
    set((state) => {
      const newState = {
        businesses: state.businesses.map((b) => 
          b.id === businessId ? { ...b, ...updates } : b
        ),
        activeBusiness: state.activeBusiness?.id === businessId 
          ? { ...state.activeBusiness, ...updates } 
          : state.activeBusiness,
      };
      console.log('🔄 STORE - updateBusiness new state:', newState);
      return newState;
    });
  },
  setHasHydrated: (value) => set({ _hasHydrated: value }),
  
  // Limpiar todo
  reset: () => set({ 
    user: null, 
    isLoading: false, 
    businesses: [], 
    activeBusiness: null 
  }),
  
      // Método para debugging
      getState: () => {
        const state = useUserStore.getState() as any;
        console.log('🔍 Estado actual del store:', state);
        return state;
      },
    }),
    {
      name: 'user-store-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistir activeBusiness
      partialize: (state) => ({ 
        activeBusiness: state.activeBusiness 
      }),
      onRehydrateStorage: () => (state) => {
        console.log('💧 Store hydrated from localStorage:', state?.activeBusiness?.name);
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  ),
    {
      name: 'user-store', // Nombre para Redux DevTools
    }
  )
);
