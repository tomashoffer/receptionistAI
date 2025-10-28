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
        setAnimationPhase(prev => (prev + 0.05) % (Math.PI * 2));
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

  // Generar líneas radiales para el efecto ElevenLabs
  const radialLines = 12;
  const getLineOpacity = (index: number) => {
    const rotation = (index * (360 / radialLines) + animationPhase * 180 / Math.PI) % 360;
    const intensity = Math.sin(animationPhase * 2 + (index * 0.3)) * 0.5 + 0.5;
    return intensity;
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Efecto radial tipo ElevenLabs */}
      <div className="absolute w-64 h-64">
        <svg width="256" height="256" viewBox="0 0 256 256" className="absolute inset-0">
          {[...Array(radialLines)].map((_, i) => {
            const angle = (i * 360) / radialLines;
            const radians = (angle * Math.PI) / 180;
            const x1 = 128;
            const y1 = 128;
            const x2 = 128 + Math.cos(radians) * 100;
            const y2 = 128 + Math.sin(radians) * 100;
            const opacity = getLineOpacity(i);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isSpeaking 
                    ? `rgba(99, 102, 241, ${opacity * 0.6})` // Indigo para speaking
                    : isListening 
                    ? `rgba(16, 185, 129, ${opacity * 0.6})` // Green para listening
                    : `rgba(107, 114, 128, ${opacity * 0.3})` // Gray para inactive
                }
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Círculo interior con gradiente */}
      <div 
        className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 relative"
        style={{
          background: isSpeaking
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : isListening
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          transform: `scale(${pulseEffect.scale})`,
          opacity: pulseEffect.opacity,
        }}
      >
        {/* Icono de micrófono */}
        <div className="text-white">
          {isSpeaking ? (
            // Ondas de sonido cuando habla
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-7 bg-white rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="w-1.5 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          ) : isListening ? (
            // Micrófono activo
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ) : (
            // Micrófono inactivo
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
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
