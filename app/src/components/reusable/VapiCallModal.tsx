"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface VapiCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string;
}

export default function VapiCallModal({ isOpen, onClose, assistantId }: VapiCallModalProps) {
  // 🔑 Valores directos para prueba (temporal)
  const VAPI_PUBLIC_KEY = "2b117adf-4797-497e-8a25-73d5c449e313";
  const ASSISTANT_ID = assistantId; // ✅ Usar el assistant ID del business

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState("Listo para llamar");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  // Inicializar VAPI
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY || !ASSISTANT_ID) return;

    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on("call-start", () => {
      console.log("📞 Llamada iniciada");
      setIsCallActive(true);
      setIsLoading(false);
      setCallStatus("Llamada activa");
    });

    vapiInstance.on("call-end", () => {
      console.log("📞 Llamada terminada");
      setIsCallActive(false);
      setIsLoading(false);
      setCallStatus("Llamada terminada");
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
        const speaker = message.role === "user" ? "Tú" : "Asistente";
        setTranscript((prev) => [...prev, `${speaker}: ${text}`]);
        console.log("💬 Transcripción:", `${speaker}: ${text}`);
      }

      if (message.type === "function-call") {
        console.log("🔧 Tool ejecutada:", message.functionCall);
        setCallStatus("Agendando cita... ✅");
      }

      if (message.type === "function-call-result") {
        console.log("✅ Resultado de tool:", message.functionCallResult);
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("❌ Error VAPI:", error);
      setCallStatus("Error en la llamada");
      setIsCallActive(false);
      setIsLoading(false);
    });

    return () => {
      if (vapiInstance) {
        // vapiInstance.destroy(); // Método no disponible en esta versión
      }
    };
  }, [VAPI_PUBLIC_KEY, ASSISTANT_ID]);

  const startCall = async () => {
    if (!vapi || !ASSISTANT_ID) return;

    setIsLoading(true);
    setCallStatus("Iniciando llamada...");
    setTranscript([]);

    try {
      await vapi.start(ASSISTANT_ID);
    } catch (error) {
      console.error("Error iniciando llamada:", error);
      setCallStatus("Error al iniciar llamada");
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
    setTranscript([]);
    setCallStatus("Listo para llamar");
    setIsCallActive(false);
    setIsLoading(false);
  };

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

  const toggleMute = () => {
    // Funcionalidad de mute no disponible en esta versión de VAPI
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
  };

  if (!isOpen) return null;

  // Validación de credenciales
  if (!VAPI_PUBLIC_KEY || !ASSISTANT_ID) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">
              ⚠️ Configuración Faltante
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose} className="hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-700 mb-4">
            No se encontró el Assistant ID. Asegúrate de haber creado un assistant primero.
          </p>
          <div className="flex justify-end">
            <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700 text-white">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-white text-xl font-semibold">Test Assistant</h2>
            <span className="text-gray-400 text-sm bg-gray-700 px-3 py-1 rounded-full">
              {callStatus}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Transcript Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-white text-lg font-medium mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Transcripción en Tiempo Real
            </h3>
            
            {/* Transcript Messages */}
            <div className="flex-1 bg-gray-800/50 rounded-2xl p-4 overflow-y-auto space-y-3">
              {transcript.length === 0 && !isCallActive ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-300 text-lg mb-6">Listo para probar tu asistente</p>
                  <Button
                    onClick={startCall}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        Iniciar Llamada
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transcript.map((line, index) => {
                    const isUser = line.startsWith("Tú:");
                    return (
                      <div
                        key={index}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            isUser
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {isUser ? 'Tú' : 'Asistente'}
                          </div>
                          <div className="text-sm leading-relaxed">
                            {line.split(': ').slice(1).join(': ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Indicador de que está escuchando */}
                  {isCallActive && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-300 p-4 rounded-2xl flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm">Escuchando...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons - Solo cuando hay una llamada activa */}
          {isCallActive && (
            <div className="flex justify-center items-center space-x-4 mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={toggleMute}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={toggleSpeaker}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isSpeakerMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={endCall}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  Terminar Llamada
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}