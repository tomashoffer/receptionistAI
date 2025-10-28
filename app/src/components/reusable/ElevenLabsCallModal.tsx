"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, X, MessageSquare, Eye } from "lucide-react";
import { Orb } from "@/components/ui/orb";
import { Transcription } from "@/components/ui/transcription";

interface ElevenLabsCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string;
  businessName?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp?: number;
}

export default function ElevenLabsCallModal({ 
  isOpen, 
  onClose, 
  assistantId,
  businessName = "Asistente" 
}: ElevenLabsCallModalProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<"disconnected" | "connecting" | "connected" | "disconnecting">("disconnected");
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  
  // Estados para el visualizador
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Toggle entre Orb y Transcript
  const [viewMode, setViewMode] = useState<"orb" | "transcript">("orb");
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar ElevenLabs Conversation Hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("📞 Llamada conectada");
      setIsCallActive(true);
      setIsLoading(false);
      setCallStatus("connected");
      setTranscript([]);
    },
    onDisconnect: () => {
      console.log("📞 Llamada desconectada");
      setIsCallActive(false);
      setIsLoading(false);
      setCallStatus("disconnected");
      setTranscript([]);
      
      // Volver a vista Orb automáticamente
      setViewMode("orb");
      
      // Limpiar media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    },
    onMessage: (message) => {
      console.log("📨 Mensaje recibido:", message);
      
      if (message.message) {
        // Limpiar y normalizar el texto
        const cleanText = message.message
          .replace(/\u200B/g, '') // Remove zero-width spaces
          .replace(/[\u200C-\u200F]/g, '') // Remove other zero-width chars
          .trim();
        
        const newMessage: ChatMessage = {
          role: message.source === "user" ? "user" : "assistant",
          text: cleanText,
          timestamp: Date.now()
        };
        setTranscript((prev) => [...prev, newMessage]);
      }
      
      // Actualizar estados visuales basados en el tipo de mensaje
      if (message.source === "user") {
        // Limpiar timeout anterior si existe
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        setIsListening(true);
        setIsSpeaking(false);
        // Mantener el estado de escucha por más tiempo para efecto visual
        timeoutRef.current = setTimeout(() => setIsListening(false), 2000);
      } else {
        // AI/assistant hablando
        // Limpiar timeout anterior si existe
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        setIsSpeaking(true);
        setIsListening(false);
        // Mantener el estado de habla por más tiempo para efecto visual
        timeoutRef.current = setTimeout(() => setIsSpeaking(false), 3000);
      }
    },
    onError: (error) => {
      console.error("❌ Error:", error);
      setCallStatus("disconnected");
      setIsCallActive(false);
      setIsLoading(false);
    },
    onDebug: (debug) => {
      console.log("🐛 Debug:", debug);
    }
  });

  // Obtener stream del micrófono
  const getMicStream = useCallback(async () => {
    if (mediaStreamRef.current) return mediaStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accediendo al micrófono:", error);
      throw error;
    }
  }, []);

  const startCall = useCallback(async () => {
    if (!assistantId) {
      console.error("❌ No assistant ID provided");
      return;
    }

    setIsLoading(true);
    setCallStatus("connecting");
    setTranscript([]);
    setCurrentTranscript("");

    try {
      await getMicStream();
      
      await conversation.startSession({
        agentId: assistantId,
        connectionType: "webrtc",
        onStatusChange: (status) => {
          console.log("📊 Estado:", status);
          setCallStatus(status.status);
        }
      });
    } catch (error) {
      console.error("Error iniciando llamada:", error);
      setCallStatus("disconnected");
      setIsLoading(false);
    }
  }, [assistantId, getMicStream, conversation]);

  const endCall = useCallback(() => {
    conversation.endSession();
    setTranscript([]);
    setCurrentTranscript("");
    setCallStatus("disconnected");
    setIsCallActive(false);
    setIsLoading(false);
    setIsListening(false);
    setIsSpeaking(false);
    
    // Volver a vista Orb automáticamente
    setViewMode("orb");
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, [conversation]);

  const handleClose = useCallback(() => {
    if (isCallActive) {
      conversation.endSession();
    }
    setTranscript([]);
    setCurrentTranscript("");
    setCallStatus("disconnected");
    setIsCallActive(false);
    setIsLoading(false);
    setIsListening(false);
    setIsSpeaking(false);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    onClose();
  }, [isCallActive, conversation, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-300 mb-4">
            No se encontró el Assistant ID. Asegúrate de haber creado un assistant primero.
          </p>
          <div className="flex justify-end">
            <Button onClick={handleClose} className="bg-gray-700 hover:bg-gray-600 text-white">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              callStatus === "connected" ? "bg-green-500 animate-pulse" : 
              callStatus === "connecting" ? "bg-yellow-500 animate-pulse" : 
              callStatus === "disconnecting" ? "bg-orange-500 animate-pulse" :
              "bg-gray-500"
            }`}></div>
            <h2 className="text-white text-xl font-semibold">{businessName}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Vista ORB */}
          {viewMode === "orb" && (
            <div className="flex-1 flex flex-col items-center py-6 px-8 overflow-y-auto">
              
              {/* Orb y estados */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <Orb 
                  state={
                    isSpeaking ? "talking" :
                    isListening ? "listening" :
                    "idle"
                  }
                  className="w-40 h-40"
                />
                
                {/* Botón central - antes de la llamada */}
                {!isCallActive && !isLoading && (
                  <Button
                    onClick={startCall}
                    className="mt-12 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-medium shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                  >
                    <Phone className="w-6 h-6" />
                    <span className="text-base">Llamar al agente de IA</span>
                  </Button>
                )}
                
                {isLoading && (
                  <div className="mt-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-base">Conectando...</p>
                  </div>
                )}

                {isCallActive && (
                  <div className="mt-6 text-center">
                    <p className="text-white text-lg font-medium mb-2">En llamada</p>
                    <p className="text-gray-400 text-sm mb-4">
                      {isListening && "Escuchando..."}
                      {isSpeaking && "El asistente está hablando..."}
                      {!isListening && !isSpeaking && "Conectado"}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Botón Ver Chat - Fijo en el fondo */}
              {isCallActive && (
                <div className="w-full pt-4 border-t border-gray-800">
                  <Button
                    onClick={() => setViewMode("transcript")}
                    className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Ver chat</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Vista TRANSCRIPT */}
          {viewMode === "transcript" && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-8 max-w-3xl mx-auto">
                <Transcription 
                  items={transcript}
                  currentPartial={currentTranscript}
                />
              </div>
              
              {/* Botón Ver Voz */}
              {isCallActive && (
                <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center">
                  <Button
                    onClick={() => setViewMode("orb")}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium flex items-center space-x-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Ver voz</span>
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Controls */}
        {isCallActive && (
          <div className="p-6 border-t border-gray-800 bg-gray-800/30">
            <div className="flex justify-center">
              <Button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium flex items-center space-x-2"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Terminar llamada</span>
              </Button>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Las llamadas en desarrollo tienen un <span className="underline">50% de descuento</span>. Más información.
          </p>
        </div>
      </div>
    </div>
  );
}

