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
      setError(err?.message || "No pudimos iniciar sesión. Intenta nuevamente.");
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
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
            <span className="text-2xl text-gray-900">ReceptionistAI</span>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">Bienvenido de vuelta</h1>
          <p className="text-gray-700">Inicia sesión en tu cuenta</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 border-gray-200 hover:bg-gray-50"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continuar con Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500">O continúa con email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-200"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
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
            <p className="text-gray-700">
              ¿No tienes una cuenta?{" "}
              <button
                onClick={goRegister}
                className="text-indigo-600 hover:text-indigo-700"
                type="button"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
