'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceCallModal } from '@/components/reusable/VoiceCallModal';
import VapiCallModal from '@/components/reusable/VapiCallModal';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Calendar, Clock, User, LogOut } from 'lucide-react';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [showCallModal, setShowCallModal] = useState(false);
  const [showVapiModal, setShowVapiModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Recepcionista AI
              </h1>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.first_name} {user.last_name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Agenda tu cita con IA
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Conversa directamente con nuestra recepcionista inteligente. 
            Programa tu cita de forma natural y rápida.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowVapiModal(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-5 h-5 mr-2" />
              Iniciar llamada (VAPI)
            </Button>
            <Button
              onClick={() => setShowCallModal(true)}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-5 h-5 mr-2" />
              Llamada local
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conversación natural
            </h3>
            <p className="text-gray-600">
              Habla como lo harías con una recepcionista humana. 
              Nuestra IA entiende tu lenguaje natural.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Agendamiento instantáneo
            </h3>
            <p className="text-gray-600">
              Tu cita se programa automáticamente en nuestro sistema. 
              Recibirás confirmación inmediata.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Disponible 24/7
            </h3>
            <p className="text-gray-600">
              Agenda tu cita en cualquier momento del día. 
              Nuestra recepcionista nunca duerme.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            ¿Cómo funciona?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Inicia la llamada</h4>
              <p className="text-gray-600 text-sm">
                Haz clic en &quot;Iniciar llamada&quot; y permite el acceso al micrófono
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Habla naturalmente</h4>
              <p className="text-gray-600 text-sm">
                Di algo como &quot;Hola, quiero agendar una cita para mañana a las 3pm&quot;
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Recibe confirmación</h4>
              <p className="text-gray-600 text-sm">
                La IA procesará tu solicitud y confirmará los detalles de tu cita
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />

      {/* VAPI Call Modal */}
      <VapiCallModal
        isOpen={showVapiModal}
        onClose={() => setShowVapiModal(false)}
      />
    </div>
  );
}
