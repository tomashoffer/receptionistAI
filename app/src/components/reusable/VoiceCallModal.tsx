'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { VoiceVisualizer } from './VoiceVisualizer';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const {
    conversationState,
    conversation,
    currentMessage,
    error,
    startConversation,
    endConversation,
    sendTextMessage,
  } = useRealtimeVoice();

  const [textInput, setTextInput] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceDetectedRef = useRef<boolean>(false);
  const audioBufferRef = useRef<Blob[]>([]);

  // Iniciar conversación cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsCallActive(true);
      setCallDuration(0);
      
      // Iniciar timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Iniciar grabación con detección de silencio
      console.log('🚀 MODAL ABIERTO - LLAMANDO A startVoiceRecording');
      startVoiceRecording();
    } else {
      setIsCallActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopVoiceRecording();
      endConversation();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopVoiceRecording();
    };
  }, [isOpen, startConversation, endConversation]);

  // Iniciar grabación con detección de silencio robusta
  const startVoiceRecording = async () => {
    try {
      console.log('🎤 INICIANDO GRABACIÓN - FUNCIÓN LLAMADA');
      
      // Configuración de audio optimizada (16kHz mono)
      console.log('🎤 SOLICITANDO ACCESO AL MICRÓFONO...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      console.log('✅ MICRÓFONO OBTENIDO:', stream);
      setMediaStream(stream);
      setIsRecording(true);
      
      // Configurar AudioContext para análisis de energía
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configuración del analizador (20ms frames)
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      audioBufferRef.current = [];
      voiceDetectedRef.current = false;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          audioBufferRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0 && isCallActive) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processVoiceAudio(audioBlob);
        }
        
        // Reiniciar grabación después de procesar
        if (isCallActive) {
          setTimeout(() => {
            startVoiceRecording();
          }, 1000);
        }
      };
      
      // Iniciar grabación
      console.log('🎤 INICIANDO MEDIARECORDER...');
      mediaRecorder.start(100); // Chunks de 100ms para mejor detección
      console.log('✅ MEDIARECORDER INICIADO');
      
      // Función de detección de silencio robusta
      const detectSilence = () => {
        if (!analyserRef.current || !isCallActive) {
          console.log('❌ DETECCIÓN DETENIDA - analyser o call inactivo');
          return;
        }
        
        console.log('🔍 DETECTANDO SILENCIO - FRAME:', Date.now());
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calcular RMS (Root Mean Square) para detectar energía
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);
        const db = 20 * Math.log10(rms / 255); // Convertir a dB
        
        console.log('📊 RMS:', rms.toFixed(4), 'dB:', db.toFixed(1));
        
        // Umbral más bajo para detectar mejor (-30 dBFS)
        const threshold = -30;
        const isVoiceDetected = db > threshold;
        
        if (isVoiceDetected) {
          console.log('🔊 Voz detectada, dB:', db.toFixed(1));
          voiceDetectedRef.current = true;
          
          // Reiniciar timer de silencio (post-roll: 1.5s)
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (voiceDetectedRef.current) {
          // Solo empezar timer de silencio si ya detectamos voz
          if (!silenceTimerRef.current) {
            console.log('🔇 Iniciando timer de silencio...');
            silenceTimerRef.current = setTimeout(() => {
              console.log('🔇 Silencio confirmado, procesando audio...');
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
              voiceDetectedRef.current = false;
            }, 1500); // Post-roll: 1.5 segundos
          }
        }
        
        // Continuar detectando
        if (isCallActive) {
          setTimeout(detectSilence, 100); // Cada 100ms en lugar de requestAnimationFrame
        }
      };
      
      // Iniciar detección después de un pequeño delay
      console.log('🚀 INICIANDO DETECCIÓN DE SILENCIO...');
      setTimeout(detectSilence, 500);
      
    } catch (error) {
      console.error('❌ Error accediendo al micrófono:', error);
    }
  };

  // Detener grabación
  const stopVoiceRecording = () => {
    console.log('🛑 Deteniendo grabación...');
    setIsRecording(false);
    voiceDetectedRef.current = false;
    
    // Limpiar timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Detener grabación
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Cerrar AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Detener stream
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  // Procesar audio de voz
  const processVoiceAudio = async (audioBlob: Blob) => {
    try {
      console.log('🎤 Procesando audio de voz...');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Respuesta del AI:', result);
        
        // Generar audio con ElevenLabs
        console.log('🎵 Generando audio para:', result.response);
        const audioResponse = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: result.response }),
        });

        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            console.log('🎵 Audio terminado, reiniciando grabación...');
          };
          
          audio.play();
        }
      }
    } catch (error) {
      console.error('❌ Error procesando audio:', error);
    }
  };

  // Cerrar modal y terminar conversación
  const handleClose = () => {
    setIsCallActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopVoiceRecording();
    endConversation();
    onClose();
  };

  // Enviar mensaje de texto
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 INICIANDO ENVÍO DE MENSAJE:', textInput);
    console.log('🚀 EVENTO:', e);
    console.log('🚀 TEXTO INPUT:', textInput);
    
    if (textInput.trim()) {
      try {
        console.log('📤 Enviando a /api/voice/process-text');
        
        // Usar endpoint HTTP en lugar de WebSocket por ahora
        const response = await fetch('/api/voice/process-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: textInput }),
        });

        console.log('📥 Respuesta recibida, status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Respuesta del AI:', result);
          // No necesitamos setCurrentMessage porque viene del hook
          
          // Generar audio con ElevenLabs
          try {
            console.log('🎵 Generando audio para:', result.response);
            const audioResponse = await fetch('/api/voice/speak', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text: result.response }),
            });

            console.log('🎵 Audio response status:', audioResponse.status);
            
            if (audioResponse.ok) {
              const audioBlob = await audioResponse.blob();
              console.log('🎵 Audio blob size:', audioBlob.size);
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              audio.onloadeddata = () => {
                console.log('🎵 Audio cargado, reproduciendo...');
                audio.play();
              };
              
              audio.onerror = (error) => {
                console.error('🎵 Error reproduciendo audio:', error);
              };
            } else {
              console.error('🎵 Error generando audio:', audioResponse.status, audioResponse.statusText);
            }
          } catch (audioError) {
            console.error('💥 Error en generación de audio:', audioError);
          }
        } else {
          console.error('❌ Error en process-text:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('💥 Error enviando mensaje:', error);
      }
      setTextInput('');
    } else {
      console.log('⚠️ Texto vacío, no se envía');
    }
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calcular progreso de la conversación (simulado)
  const conversationProgress = Math.min((callDuration / 120) * 100, 100);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
        <div className="flex flex-col items-center space-y-6 p-8">
          {/* Título */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Llamada con Recepcionista AI
            </h2>
            <p className="text-gray-600 text-sm">
              Conversación directa para agendar tu cita
            </p>
          </div>

          {/* Visualizador de voz */}
          <div className="relative">
            <VoiceVisualizer 
              isActive={conversationState.isActive}
              isListening={conversationState.isListening}
              isSpeaking={conversationState.isSpeaking}
            />
          </div>

          {/* Estado actual */}
          <div className="text-center">
            <p className="text-gray-900 font-medium">
              {conversationState.isSpeaking 
                ? 'AI hablando...' 
                : isRecording 
                ? (voiceDetectedRef.current ? 'Escuchando... (habla)' : 'Esperando que hables...')
                : 'Conectado'
              }
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Duración: {formatTime(callDuration)}
            </p>
          </div>

          {/* Progreso de conversación */}
          <div className="w-full space-y-2">
            <Progress value={conversationProgress} className="h-2" />
            <p className="text-gray-500 text-xs text-center">
              Progreso de la conversación
            </p>
          </div>

          {/* Input de texto alternativo */}
          <form onSubmit={handleSendText} className="w-full space-y-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="O escribe tu mensaje..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={conversationState.isSpeaking}
            />
            <Button
              type="submit"
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!textInput.trim() || conversationState.isSpeaking}
            >
              Enviar mensaje
            </Button>
          </form>

          {/* Error */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg w-full">
              {error}
            </div>
          )}

          {/* Último mensaje del AI */}
          {currentMessage && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg w-full">
              <p className="text-blue-800 text-sm">{currentMessage}</p>
            </div>
          )}

          {/* Botón para terminar llamada */}
          <Button
            onClick={handleClose}
            variant="destructive"
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Terminar llamada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
