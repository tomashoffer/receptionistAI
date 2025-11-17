'use client';

import { Button } from "./ui/button";
import { Bot } from "lucide-react";

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900">ReceptionistAI</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Planes
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Testimonios
            </a>
            <a href="#faq" className="text-gray-700 hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => onNavigate?.('login')}
            >
              Login
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onNavigate?.('register')}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}