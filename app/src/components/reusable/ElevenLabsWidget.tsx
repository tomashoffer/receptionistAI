"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ElevenLabsWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string;
  businessName?: string;
}

export default function ElevenLabsWidget({ 
  isOpen, 
  onClose, 
  assistantId,
  businessName = "Asistente" 
}: ElevenLabsWidgetProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Cargar el script del widget de ElevenLabs
  useEffect(() => {
    if (isOpen && assistantId && !scriptLoaded) {
      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="convai-widget-embed"]');
      
      if (existingScript) {
        setScriptLoaded(true);
        return;
      }

      // Crear y cargar el script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        setScriptLoaded(true);
      };

      document.body.appendChild(script);
      scriptRef.current = script;
    }

    return () => {
      // Limpiar el script cuando el componente se desmonta
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [isOpen, assistantId, scriptLoaded]);

  if (!isOpen) return null;

  // Validación de credenciales
  if (!assistantId) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              ⚠️ Configuración Faltante
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-300 mb-4">
            No se encontró el Assistant ID. Asegúrate de haber creado un assistant primero.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <h2 className="text-gray-900 text-xl font-semibold">{businessName}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Widget Container */}
        <div className="flex-1 p-6 overflow-hidden bg-gray-50">
          {scriptLoaded && (
            <div 
              ref={widgetRef}
              className="w-full h-full flex items-center justify-center"
              style={{ minHeight: '500px' }}
            >
              {/* Widget de ElevenLabs - el web component se renderizará aquí */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <elevenlabs-convai
                agent-id={assistantId}
                action-text="Probar tu asistente"
                variant="full"
                placement="center"
                transcript-enabled="true"
              />
            </div>
          )}
          
          {!scriptLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando widget...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-3xl">
          <p className="text-xs text-gray-500 text-center">
            Powered by <span className="font-semibold">ElevenLabs</span> - Conversational AI
          </p>
        </div>
      </div>
    </div>
  );
}

