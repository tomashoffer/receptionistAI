'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

export function VoiceVisualizer({ isActive, isListening, isSpeaking }: VoiceVisualizerProps) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      const animate = () => {
        setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Efectos de pulso basados en el estado
  const getPulseEffect = () => {
    if (isSpeaking) {
      // Pulso rápido cuando el AI está hablando
      return {
        scale: 1 + Math.sin(animationPhase * 4) * 0.1,
        opacity: 0.8 + Math.sin(animationPhase * 6) * 0.2,
      };
    } else if (isListening) {
      // Pulso suave cuando está escuchando
      return {
        scale: 1 + Math.sin(animationPhase * 2) * 0.05,
        opacity: 0.9 + Math.sin(animationPhase * 3) * 0.1,
      };
    } else {
      // Estado inactivo
      return {
        scale: 1,
        opacity: 0.6,
      };
    }
  };

  const pulseEffect = getPulseEffect();

  return (
    <div className="relative flex items-center justify-center">
      {/* Círculo exterior */}
      <div 
        className="absolute w-32 h-32 rounded-full border-2 border-gray-200 transition-all duration-300"
        style={{
          transform: `scale(${pulseEffect.scale})`,
          opacity: pulseEffect.opacity,
        }}
      />
      
      {/* Círculo interior */}
      <div 
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          isSpeaking 
            ? 'bg-blue-500' 
            : isListening 
            ? 'bg-green-500' 
            : 'bg-gray-400'
        }`}
        style={{
          transform: `scale(${pulseEffect.scale * 0.8})`,
          opacity: pulseEffect.opacity,
        }}
      >
        {/* Icono de micrófono */}
        <div className="text-white">
          {isSpeaking ? (
            // Ondas de sonido cuando habla
            <div className="flex items-center space-x-1">
              <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          ) : isListening ? (
            // Micrófono activo
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ) : (
            // Micrófono inactivo
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Partículas de sonido (solo cuando está hablando) */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-40px)`,
                animation: `float ${2 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-40px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-60px) scale(1.2);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
