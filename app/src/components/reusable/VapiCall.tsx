"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2 } from "lucide-react";

interface VapiCallProps {
  assistantId: string; // ID de tu asistente en VAPI
  publicKey: string; // Tu VAPI Public Key
}

export default function VapiCall({ assistantId, publicKey }: VapiCallProps) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("Listo para llamar");
  const [transcript, setTranscript] = useState<string[]>([]);

  // Inicializar VAPI
  useEffect(() => {
    const vapiInstance = new Vapi(publicKey);
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
      
      if (message.type === "transcript" && message.transcriptType === "final") {
        const text = message.transcript;
        const speaker = message.role === "user" ? "Tú" : "María";
        setTranscript((prev) => [...prev, `${speaker}: ${text}`]);
      }

      if (message.type === "function-call") {
        console.log("🔧 Tool ejecutada:", message.functionCall);
        setCallStatus("Agendando cita... ✅");
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("❌ Error:", error);
      const errorMessage = error?.message || error?.toString() || "Error desconocido";
      setCallStatus(`Error: ${errorMessage}`);
      setIsLoading(false);
      setIsCallActive(false);
    });

    return () => {
      vapiInstance.stop();
    };
  }, [publicKey]);

  // Iniciar llamada
  const startCall = async () => {
    if (!vapi) return;

    setIsLoading(true);
    setCallStatus("Conectando...");
    setTranscript([]);

    try {
      await vapi.start(assistantId);
    } catch (error: any) {
      console.error("❌ Error al iniciar llamada:", error);
      const errorMessage = error?.message || error?.toString() || "Error al conectar";
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

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Recepcionista AI
        </h2>
        <p className="text-gray-600">
          Presiona el botón para hablar con María
        </p>
      </div>

      {/* Estado de la llamada */}
      <div className="flex items-center justify-center space-x-2 text-lg font-medium text-gray-700">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        <span>{callStatus}</span>
      </div>

      {/* Botón de llamada */}
      <div className="flex flex-col items-center space-y-4">
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
  );
}


