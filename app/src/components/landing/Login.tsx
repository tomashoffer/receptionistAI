'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Bot, Mail, Lock, Chrome } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { apiService } from "@/services/api.service";

interface LoginProps {
  onNavigate?: (page: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function Login({ onNavigate }: LoginProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("from") || "/dashboard";

  const { setUser, setBusinesses, setActiveBusiness } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goHome = () => {
    onNavigate ? onNavigate("home") : router.push("/");
  };

  const goRegister = () => {
    onNavigate ? onNavigate("register") : router.push("/register");
  };

  const loadBusinesses = async () => {
    try {
      const response = (await apiService.getBusinesses()) as any;
      const list = Array.isArray(response) ? response : response ? [response] : [];
      setBusinesses(list);
      if (list.length > 0) {
        setActiveBusiness(list[0]);
      }
    } catch (err) {
      console.warn("No se pudieron obtener los negocios del usuario", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = (await apiService.login(email, password)) as any;
      if (data?.user) {
        setUser(data.user);
      }
      await loadBusinesses();
      router.push(redirectTo);
    } catch (err: any) {
      // Mostrar mensaje de error más específico
      const errorMessage = err?.message || "No pudimos iniciar sesión. Intenta nuevamente.";
      setError(errorMessage);
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("oauth_redirect_to", redirectTo);
      window.location.href = `${API_BASE_URL}/auth/google`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center gap-2 mb-4 cursor-pointer"
            onClick={goHome}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl dark:text-gray-100">ReceptionistAI</span>
          </div>
          <h1 className="text-3xl dark:text-gray-100 mb-2">Bienvenido de vuelta</h1>
          <p className="dark:text-gray-300">Inicia sesión en tu cuenta</p>
        </div>

        {/* Login Card */}
        <div className="dark:bg-gray-800 rounded-2xl p-8 border dark:border-gray-700 shadow-xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-100"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continuar con Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700" style={{ borderColor: 'var(--border)' }}></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 dark:bg-gray-800 dark:text-gray-400" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}>O continúa con email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'var(--foreground)' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" style={{ color: 'var(--foreground)' }}>Contraseña</Label>
                <a href="#" className="dark:text-indigo-400 dark:hover:text-indigo-300" style={{ color: 'var(--primary)' }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)' }}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="dark:text-gray-300" style={{ color: 'var(--foreground)' }}>
              ¿No tienes una cuenta?{" "}
              <button
                onClick={goRegister}
                className="dark:text-indigo-400 dark:hover:text-indigo-300 underline hover:no-underline cursor-pointer font-medium transition-colors"
                style={{ color: 'var(--primary)' }}
                type="button"
              >
                Regístrate
              </button>
            </p>
        </div>
        </div>

        <p className="text-center mt-6" style={{ color: 'black' }}>
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="dark:text-indigo-400 dark:hover:text-indigo-300" style={{ color: 'grey' }}>
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="dark:text-indigo-400 dark:hover:text-indigo-300" style={{ color: 'grey' }}>
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
