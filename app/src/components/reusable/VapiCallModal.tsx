"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, X } from "lucide-react";

interface VapiCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VapiCallModal({ isOpen, onClose }: VapiCallModalProps) {
  // 🔑 Valores directos para prueba (temporal)
  const VAPI_PUBLIC_KEY = "2b117adf-4797-497e-8a25-73d5c449e313";
  const ASSISTANT_ID = "d4b41f08-9198-41d2-b935-d2d53d960921"; // ✅ UUID válido

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("Listo para llamar");
  const [transcript, setTranscript] = useState<string[]>([]);

  // Inicializar VAPI
  useEffect(() => {
    if (!isOpen || !VAPI_PUBLIC_KEY || !ASSISTANT_ID) return;

    console.log("🔑 Inicializando VAPI con:", { 
      VAPI_PUBLIC_KEY: VAPI_PUBLIC_KEY ? `${VAPI_PUBLIC_KEY.substring(0, 8)}...` : "VACÍO",
      ASSISTANT_ID: ASSISTANT_ID ? `${ASSISTANT_ID.substring(0, 8)}...` : "VACÍO"
    });
    
    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on("call-start", () => {
      setIsCallActive(true);
      setIsLoading(false);
      setCallStatus("Llamada activa 🎙️");
      console.log("✅ Llamada iniciada");
    });

    vapiInstance.on("call-end", () => {
      setIsCallActive(false);
      setIsLoading(false);
      setCallStatus("Llamada finalizada");
      console.log("📞 Llamada finalizada");
    });

    vapiInstance.on("speech-start", () => {
      setCallStatus("Escuchando... 👂");
    });

    vapiInstance.on("speech-end", () => {
      setCallStatus("Procesando... 🤔");
    });

    vapiInstance.on("message", (message: any) => {
      console.log("📨 Mensaje recibido:", message);
      console.log("📨 Tipo de mensaje:", message.type);
      
      if (message.type === "transcript" && message.transcriptType === "final") {
        const text = message.transcript;
        const speaker = message.role === "user" ? "Tú" : "María";
        setTranscript((prev) => [...prev, `${speaker}: ${text}`]);
        console.log("💬 Transcripción:", `${speaker}: ${text}`);
      }

      if (message.type === "function-call") {
        console.log("🔧 Tool ejecutada:", message.functionCall);
        console.log("🔧 Tool details:", JSON.stringify(message.functionCall, null, 2));
        setCallStatus("Agendando cita... ✅");
      }

      if (message.type === "function-call-result") {
        console.log("✅ Resultado de tool:", message.functionCallResult);
      }

      if (message.type === "conversation-updated") {
        console.log("🔄 Conversación actualizada:", message.conversation);
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("❌ Error VAPI:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      
      // Intentar obtener más información del error
      let errorMessage = "Error desconocido";
      if (error?.error?.data) {
        errorMessage = error.error.data;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }
      
      setCallStatus(`Error: ${errorMessage}`);
      setIsLoading(false);
      setIsCallActive(false);
    });

    return () => {
      vapiInstance.stop();
    };
  }, [isOpen, VAPI_PUBLIC_KEY, ASSISTANT_ID]);

  // Iniciar llamada
  const startCall = async () => {
    if (!vapi || !ASSISTANT_ID) return;

    setIsLoading(true);
    setCallStatus("Conectando...");
    setTranscript([]);

    try {
      console.log("🚀 Iniciando llamada con assistantId:", ASSISTANT_ID);
      console.log("🔑 Usando publicKey:", VAPI_PUBLIC_KEY.substring(0, 8) + "...");
      await vapi.start(ASSISTANT_ID);
    } catch (error: any) {
      console.error("❌ Error al iniciar llamada:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      
      // Intentar obtener más información del error
      let errorMessage = "Error al conectar";
      if (error?.response?.data) {
        errorMessage = error.response.data;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }
      
      setCallStatus(`Error: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  // Finalizar llamada
  const endCall = () => {
    if (!vapi) return;
    vapi.stop();
    setCallStatus("Listo para llamar");
  };

  // Cerrar modal
  const handleClose = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
    setTranscript([]);
    setCallStatus("Listo para llamar");
    setIsCallActive(false);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  // Validación de credenciales
  if (!VAPI_PUBLIC_KEY || !ASSISTANT_ID) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-600">
              ⚠️ Configuración Faltante
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-700 mb-4">
            Por favor, configura las credenciales de VAPI en el archivo <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`NEXT_PUBLIC_VAPI_PUBLIC_KEY=tu_public_key_aqui
NEXT_PUBLIC_VAPI_ASSISTANT_ID=tu_assistant_id_aqui`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Recepcionista AI - VAPI
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Estado de la llamada */}
        <div className="flex items-center justify-center space-x-2 text-lg font-medium text-gray-700 mb-6">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>{callStatus}</span>
        </div>

        {/* Botón de llamada */}
        <div className="flex flex-col items-center space-y-4 mb-6">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              disabled={isLoading}
              size="lg"
              className="w-32 h-32 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl transition-all duration-300 hover:scale-110"
            >
              {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <Phone className="w-12 h-12" />
              )}
            </Button>
          ) : (
            <Button
              onClick={endCall}
              size="lg"
              className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl transition-all duration-300 hover:scale-110"
            >
              <PhoneOff className="w-12 h-12" />
            </Button>
          )}
          <p className="text-sm text-gray-500">
            {isCallActive ? "Toca para colgar" : "Toca para llamar"}
          </p>
        </div>

        {/* Transcripción en vivo */}
        {transcript.length > 0 && (
          <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Transcripción:
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
              {transcript.map((line, index) => {
                const isUser = line.startsWith("Tú:");
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      isUser
                        ? "bg-blue-100 text-blue-900 ml-8"
                        : "bg-green-100 text-green-900 mr-8"
                    }`}
                  >
                    <p className="text-sm">{line}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
