'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useDarkModeStore } from '@/stores/darkModeStore';

// Declaración de tipos para el web component de Vapi
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': any;
    }
  }
}

interface VapiWidgetProps {
  assistantId?: string;
  publicKey?: string;
}

/**
 * Componente VapiWidget - Web Component oficial de Vapi
 * Basado en el embed code de Vapi Dashboard
 */
export default function VapiWidget({ assistantId, publicKey }: VapiWidgetProps) {
  const { activeBusiness } = useUserStore();
  const { isDarkMode } = useDarkModeStore();
  const widgetRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  console.log('🎯 VapiWidget RENDER - Business:', activeBusiness?.name);
  console.log('🎯 VapiWidget - assistantId:', assistantId?.substring(0, 12));
  console.log('🎯 VapiWidget - publicKey:', publicKey?.substring(0, 12));
  console.log('🎯 VapiWidget - isDarkMode:', isDarkMode);

  // useEffect 1: Cargar script del web component (solo una vez)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scriptSrc = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    
    console.log('📦 Verificando script de Vapi...');
    
    if (!existingScript) {
      console.log('📦 Cargando script de Vapi...');
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('✅ Script de Vapi cargado');
        setTimeout(() => {
          setScriptLoaded(true);
        }, 500);
      };
      
      script.onerror = () => {
        console.error('❌ Error cargando script de Vapi');
      };
      
      document.body.appendChild(script);
    } else {
      console.log('✅ Script de Vapi ya existe');
      setScriptLoaded(true);
    }
  }, []);

  // useEffect 2: Configurar atributos del widget cuando esté listo
  useEffect(() => {
    console.log('🔧 useEffect configuración - scriptLoaded:', scriptLoaded);
    
    if (!widgetRef.current || !assistantId || !publicKey || !scriptLoaded) {
      console.log('⏸️ No se cumplen condiciones para configurar widget');
      return;
    }

    const widget = widgetRef.current as any;
    console.log('✅ Configurando atributos del widget para:', activeBusiness?.name);
    
    try {
      widget.setAttribute('public-key', publicKey);
      widget.setAttribute('assistant-id', assistantId);
      widget.setAttribute('mode', 'voice');
      widget.setAttribute('theme', isDarkMode ? 'dark' : 'light');
      widget.setAttribute('base-bg-color', isDarkMode ? '#000000' : '#ffffff');
      widget.setAttribute('accent-color', '#14B8A6');
      widget.setAttribute('cta-button-color', isDarkMode ? '#000000' : '#ffffff');
      widget.setAttribute('cta-button-text-color', isDarkMode ? '#ffffff' : '#000000');
      widget.setAttribute('border-radius', 'large');
      widget.setAttribute('size', 'full');
      widget.setAttribute('position', 'bottom-right');
      widget.setAttribute('title', 'Proba tu asistente');
      widget.setAttribute('start-button-text', 'Iniciar');
      widget.setAttribute('end-button-text', 'Finalizar');
      widget.setAttribute('chat-first-message', activeBusiness?.assistant?.first_message || '¡Hola! ¿En qué puedo ayudarte hoy?');
      widget.setAttribute('chat-placeholder', 'Escribe tu mensaje...');
      widget.setAttribute('voice-show-transcript', 'true');
      widget.setAttribute('consent-required', 'false');
      
      console.log('✅ Atributos configurados correctamente');
    } catch (error) {
      console.error('❌ Error configurando atributos:', error);
    }
  }, [assistantId, publicKey, scriptLoaded, activeBusiness?.id, isDarkMode]);

  if (!assistantId || !publicKey) {
    console.log('⏸️ No hay assistantId o publicKey, no renderizando widget');
    return null;
  }

  console.log('🎨 Renderizando <vapi-widget>');

  return (
    <div>
      {/* @ts-ignore - Web component de Vapi */}
      <vapi-widget ref={widgetRef} />
    </div>
  );
}
