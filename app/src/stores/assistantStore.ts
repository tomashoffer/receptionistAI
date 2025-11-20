'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

// Interface para Assistant Configuration
export interface AssistantConfig {
  id: string;
  business_id: string;
  industry: string;
  prompt: string;
  config_data: {
    configuracionAsistente?: any;
    precioDisponibilidad?: any;
    informacionEstablecimiento?: any;
    informacionExtra?: any;
    integracionFotos?: any;
  };
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Interface para Assistant de VAPI
export interface VapiAssistant {
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

// Interface para Chatbot (futuro)
export interface ChatbotConfig {
  id?: string;
  business_id?: string;
  name?: string;
  // Agregar más campos según se necesiten
}

interface AssistantStore {
  // Assistant Config
  assistantConfig: AssistantConfig | null;
  assistantConfigId: string | null;
  isLoadingConfig: boolean;
  
  // VAPI Assistant
  vapiAssistant: VapiAssistant | null;
  isLoadingVapi: boolean;
  
  // Chatbot (futuro)
  chatbotConfig: ChatbotConfig | null;
  isLoadingChatbot: boolean;
  
  // Actions - Assistant Config
  setAssistantConfig: (config: AssistantConfig | null) => void;
  setAssistantConfigId: (id: string | null) => void;
  updateAssistantConfig: (updates: Partial<AssistantConfig['config_data']>) => void;
  setLoadingConfig: (loading: boolean) => void;
  
  // Actions - VAPI Assistant
  setVapiAssistant: (assistant: VapiAssistant | null) => void;
  setLoadingVapi: (loading: boolean) => void;
  
  // Actions - Chatbot
  setChatbotConfig: (config: ChatbotConfig | null) => void;
  setLoadingChatbot: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  assistantConfig: null,
  assistantConfigId: null,
  isLoadingConfig: false,
  vapiAssistant: null,
  isLoadingVapi: false,
  chatbotConfig: null,
  isLoadingChatbot: false,
};

export const useAssistantStore = create<AssistantStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Assistant Config Actions
        setAssistantConfig: (config) => set({ assistantConfig: config, assistantConfigId: config?.id || null }),
        setAssistantConfigId: (id) => set({ assistantConfigId: id }),
        updateAssistantConfig: (updates) =>
          set((state) => {
            if (!state.assistantConfig) return state;
            return {
              assistantConfig: {
                ...state.assistantConfig,
                config_data: {
                  ...state.assistantConfig.config_data,
                  ...updates,
                },
              },
            };
          }),
        setLoadingConfig: (loading) => set({ isLoadingConfig: loading }),

        // VAPI Assistant Actions
        setVapiAssistant: (assistant) => set({ vapiAssistant: assistant }),
        setLoadingVapi: (loading) => set({ isLoadingVapi: loading }),

        // Chatbot Actions
        setChatbotConfig: (config) => set({ chatbotConfig: config }),
        setLoadingChatbot: (loading) => set({ isLoadingChatbot: loading }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'assistant-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Solo persistir datos importantes, no estados de loading
          // NO persistir assistantConfig porque siempre debe cargarse del backend
          assistantConfigId: state.assistantConfigId,
          vapiAssistant: state.vapiAssistant,
          chatbotConfig: state.chatbotConfig,
        }),
      }
    ),
    { name: 'AssistantStore' }
  )
);

