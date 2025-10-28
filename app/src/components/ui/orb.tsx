"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type AgentState = "idle" | "listening" | "talking" | null;

interface OrbProps {
  state?: AgentState;
  className?: string;
}

export function Orb({ state = "idle", className }: OrbProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    let frame: number;
    
    const animate = () => {
      setAnimationPhase((prev) => (prev + 0.02) % (Math.PI * 2));
      frame = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const getColors = () => {
    switch (state) {
      case "listening":
        return {
          gradient: "from-green-400 via-emerald-500 to-green-600",
          glow: "shadow-green-500/60 shadow-2xl",
          pulse: "animate-pulse"
        };
      case "talking":
        return {
          gradient: "from-blue-400 via-blue-500 to-blue-600",
          glow: "shadow-blue-500/60 shadow-2xl",
          pulse: "animate-pulse"
        };
      default:
        return {
          gradient: "from-gray-400 via-gray-500 to-gray-600",
          glow: "shadow-gray-500/40 shadow-lg",
          pulse: ""
        };
    }
  };

  const colors = getColors();

  return (
    <div className={cn("relative flex items-center justify-center w-40 h-40", className)}>
      {/* Outer Ring Pulse */}
      <div 
        className={cn(
          "absolute w-48 h-48 rounded-full opacity-30 blur-xl transition-all duration-500",
          `bg-gradient-to-br ${colors.gradient}`,
          state !== "idle" && colors.pulse
        )}
        style={{
          transform: `scale(${1 + Math.sin(animationPhase * 2) * (state === "talking" ? 0.3 : state === "listening" ? 0.2 : 0.1)})`
        }}
      />

      {/* Middle Ring */}
      <div 
        className={cn(
          "absolute w-44 h-44 rounded-full transition-all duration-500",
          `bg-gradient-to-br ${colors.gradient}`,
          colors.glow
        )}
        style={{
          transform: `scale(${1 + Math.sin(animationPhase * 1.5) * (state === "talking" ? 0.25 : state === "listening" ? 0.15 : 0.05)})`
        }}
      />

      {/* Main Orb */}
      <div 
        className={cn(
          "w-40 h-40 rounded-full flex items-center justify-center relative transition-all duration-500",
          `bg-gradient-to-br ${colors.gradient}`,
          colors.glow
        )}
        style={{
          transform: `scale(${1 + Math.sin(animationPhase * 1) * (state === "talking" ? 0.2 : state === "listening" ? 0.1 : 0.05)})`
        }}
      >
        {/* Inner Glow */}
        <div 
          className={cn(
            "absolute w-32 h-32 rounded-full opacity-50 blur-2xl",
            `bg-gradient-to-br ${colors.gradient}`
          )}
        />
        
        {/* Center Dot */}
        <div 
          className={cn(
            "w-4 h-4 rounded-full transition-all duration-300",
            state === "listening" ? "bg-green-100" : 
            state === "talking" ? "bg-blue-100" : 
            "bg-gray-100"
          )}
        />
      </div>

      {/* Particles Effect (only when talking) */}
      {state === "talking" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-50px)`,
                animation: `float ${2 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
