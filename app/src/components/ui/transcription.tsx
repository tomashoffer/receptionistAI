"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export interface TranscriptItem {
  role: "user" | "assistant";
  text: string;
  timestamp?: number;
}

export interface TranscriptionProps {
  items: TranscriptItem[];
  currentPartial?: string;
  className?: string;
}

export function Transcription({ items, currentPartial, className }: TranscriptionProps) {
  if (items.length === 0 && !currentPartial) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center space-x-2 py-8">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <h3 className="text-gray-400 text-sm font-medium">Sin transcripción aún</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Messages Container */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const isUser = item.role === "user";
          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-xl transition-all duration-200 shadow-sm",
                isUser
                  ? "bg-blue-500/20 text-left border border-blue-500/20"
                  : "bg-gray-700/50 text-left border border-gray-700/50"
              )}
            >
              <div className={cn(
                "text-xs font-semibold mb-2 uppercase tracking-wide",
                isUser ? "text-blue-400" : "text-gray-400"
              )}>
                {isUser ? "Tú" : "Asistente"}
              </div>
              <div className={cn(
                "text-sm leading-relaxed break-words",
                isUser ? "text-blue-50" : "text-gray-100"
              )}>
                {item.text}
              </div>
            </div>
          );
        })}

        {/* Current partial transcript */}
        {currentPartial && (
          <div className="p-4 rounded-xl bg-gray-700/30 text-gray-400 text-sm italic border border-gray-700/50">
            <span className="text-xs font-medium text-gray-400 mr-2">Transcribiendo:</span>
            {currentPartial}...
          </div>
        )}
      </div>
    </div>
  );
}


