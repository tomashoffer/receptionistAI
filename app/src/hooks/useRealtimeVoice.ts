import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { VoiceResponse, ConversationState } from '@/types/voice';

export const useRealtimeVoice = () => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    isActive: false,
    isListening: false,
    isSpeaking: false,
    duration: 0,
    sessionId: '',
  });
  
  const [conversation, setConversation] = useState<VoiceResponse[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar socket
  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔗 Socket ya existe, reconectando...');
      socketRef.current.disconnect();
    }
    
    console.log('🔗 Inicializando socket WebSocket...');
    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/voice`, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    socketRef.current.on('connect', () => {
      console.log('🔗 Conectado al servidor de voz');
      setError(null);
    });

    socketRef.current.on('connected', (data: { message: string; sessionId: string }) => {
      console.log('✅ Conectado al servicio de voz:', data);
    });

    socketRef.current.on('voice_response', (response: VoiceResponse) => {
      console.log('🎤 Respuesta recibida:', response);
      setConversation(prev => [...prev, response]);
      setCurrentMessage(response.response);
    });

    socketRef.current.on('voice_audio_response', (data: { audio: string; text: string; sessionId: string }) => {
      console.log('🔊 Audio recibido del AI');
      setConversationState(prev => ({ ...prev, isSpeaking: true }));
      
      // Reproducir audio
      const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setConversationState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
        
        // Reiniciar grabación si la conversación sigue activa
        if (conversationState.isActive) {
          setTimeout(() => startRecording(), 1000);
        }
      };
      
      audio.onerror = () => {
        setConversationState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
    });

    socketRef.current.on('voice_ended', () => {
      setConversationState(prev => ({ ...prev, isSpeaking: false }));
    });

    socketRef.current.on('error', (error: { message?: string }) => {
      console.error('❌ Error en socket:', error);
      setError(error.message || 'Error de conexión');
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor');
      setError('Conexión perdida');
    });
  }, [conversationState.isActive]);

  // Iniciar grabación de audio
  const startRecording = useCallback(async () => {
    try {
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        mediaStreamRef.current = stream;
      }

      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0 && socketRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convertir blob a buffer para enviar via WebSocket
          audioBlob.arrayBuffer().then(buffer => {
            socketRef.current?.emit('voice_audio', {
              audio: Array.from(new Uint8Array(buffer)),
              sessionId: conversationState.sessionId,
            });
          });
        }
      };

      // Grabar en chunks de 2 segundos para detección de silencio
      mediaRecorder.start(2000);
      setConversationState(prev => ({ ...prev, isListening: true }));
      
    } catch (error) {
      console.error('❌ Error iniciando grabación:', error);
      setError('No se puede acceder al micrófono');
    }
  }, [conversationState.sessionId]);

  // Detener grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setConversationState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Iniciar conversación
  const startConversation = useCallback(async () => {
    try {
      setError(null);
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setConversationState({
        isActive: true,
        isListening: false,
        isSpeaking: false,
        duration: 0,
        sessionId,
      });

      // Inicializar socket si no existe
      initializeSocket();

      // Iniciar timer de duración
      durationRef.current = setInterval(() => {
        setConversationState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      // Iniciar grabación
      await startRecording();

    } catch (error) {
      console.error('❌ Error iniciando conversación:', error);
      setError('Error iniciando conversación');
    }
  }, [initializeSocket, startRecording]);

  // Terminar conversación
  const endConversation = useCallback(() => {
    // Detener grabación
    stopRecording();
    
    // Detener timer
    if (durationRef.current) {
      clearInterval(durationRef.current);
      durationRef.current = null;
    }

    // Detener stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Desconectar socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Resetear estado
    setConversationState({
      isActive: false,
      isListening: false,
      isSpeaking: false,
      duration: 0,
      sessionId: '',
    });

    setCurrentMessage('');
    setError(null);
  }, [stopRecording]);

  // Enviar mensaje de texto
  const sendTextMessage = useCallback(async (text: string) => {
    if (!socketRef.current || !text.trim()) return;

    socketRef.current.emit('text_message', {
      text: text.trim(),
      sessionId: conversationState.sessionId,
    });
  }, [conversationState.sessionId]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      endConversation();
    };
  }, [endConversation]);

  return {
    conversationState,
    conversation,
    currentMessage,
    error,
    startConversation,
    endConversation,
    sendTextMessage,
  };
};
