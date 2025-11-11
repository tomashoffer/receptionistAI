'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MessageSquare, Phone, Send, PhoneCall, Mic, PhoneOff } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';
import { useUserStore } from '../stores/userStore';

type TestMode = 'selection' | 'chatbot' | 'voice';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Pruebas() {
  const [mode, setMode] = useState<TestMode>('selection');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeBusiness } = useUserStore();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: 'Entiendo tu consulta. Déjame ayudarte con eso...',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Pruebas del Asistente</h1>
              <p className="text-sm text-gray-500">
                Selecciona el modo de prueba para comenzar a interactuar con tu asistente
              </p>
            </div>
            <BusinessSelector />
          </div>
        </div>

        {/* Selection Cards */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Chatbot Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-300"
              onClick={() => setMode('chatbot')}
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-xl mb-3">Chatbot</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Prueba el chatbot conversacional por texto. Perfecto para WhatsApp, Instagram y Facebook Messenger.
                </p>
                <Button className="mt-6 bg-purple-600 hover:bg-purple-700 w-full">
                  Probar Chatbot
                </Button>
              </div>
            </Card>

            {/* Voice AI Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
              onClick={() => setMode('voice')}
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl mb-3">Voice Receptionist</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Prueba el recepcionista por voz. Experimenta conversaciones naturales por llamada telefónica.
                </p>
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 w-full">
                  Probar Voice AI
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'chatbot') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setMode('selection')}
                className="gap-2"
              >
                ← Volver
              </Button>
              <div>
                <h1 className="text-2xl mb-1">Prueba de Chatbot</h1>
                <p className="text-sm text-gray-500">
                  Conversando con {activeBusiness?.name || 'tu asistente'}
                </p>
              </div>
            </div>
            <BusinessSelector />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div 
            className="w-full max-w-4xl h-full rounded-lg shadow-lg bg-white flex flex-col overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          >
            {/* Messages */}
            <div className="flex-1 p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700 px-4"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'voice') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMode('selection');
                  setIsCallActive(false);
                  setCallDuration(0);
                }}
                className="gap-2"
              >
                ← Volver
              </Button>
              <div>
                <h1 className="text-2xl mb-1">Prueba de Voice Receptionist</h1>
                <p className="text-sm text-gray-500">
                  Realiza una llamada de prueba con {activeBusiness?.name || 'tu asistente'}
                </p>
              </div>
            </div>
            <BusinessSelector />
          </div>
        </div>

        {/* Voice Interface */}
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Card className="w-full max-w-md">
            <div className="p-8 text-center">
              {!isCallActive ? (
                <>
                  {/* Not in call */}
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Phone className="w-16 h-16 text-white" />
                  </div>
                  <h2 className="text-2xl mb-3">Voice Receptionist</h2>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Haz clic en el botón para iniciar una llamada de prueba con tu recepcionista virtual AI.
                    Habla naturalmente como lo harías en una llamada telefónica real.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      <strong>Número de prueba:</strong><br />
                      {activeBusiness?.phone || '+54 9 11 1234-5678'}
                    </p>
                  </div>

                  <Button 
                    onClick={handleStartCall}
                    className="bg-blue-600 hover:bg-blue-700 w-full py-6 text-lg gap-3"
                  >
                    <PhoneCall className="w-6 h-6" />
                    Iniciar llamada de prueba
                  </Button>
                </>
              ) : (
                <>
                  {/* In call */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        En llamada
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl mb-2">Llamada activa</h2>
                  <p className="text-3xl mb-6 text-gray-700 tabular-nums">
                    {formatDuration(callDuration)}
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-900 mb-2">
                      <strong>🎙️ Hablando con tu asistente</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      El asistente está escuchando. Habla naturalmente para probar las capacidades de conversación.
                    </p>
                  </div>

                  <Button 
                    onClick={handleEndCall}
                    className="bg-red-600 hover:bg-red-700 w-full py-6 text-lg gap-3"
                  >
                    <PhoneOff className="w-6 h-6" />
                    Finalizar llamada
                  </Button>
                </>
              )}

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl text-blue-600 mb-1">4.8</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl text-blue-600 mb-1">98%</p>
                    <p className="text-xs text-gray-500">Precisión</p>
                  </div>
                  <div>
                    <p className="text-2xl text-blue-600 mb-1">2.3s</p>
                    <p className="text-xs text-gray-500">Respuesta</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}