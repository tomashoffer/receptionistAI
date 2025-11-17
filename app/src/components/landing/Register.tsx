'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Bot, Mail, Lock, User, Chrome, Building, Phone } from "lucide-react";
import { apiService } from "@/services/api.service";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

interface RegisterProps {
  onNavigate?: (page: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function Register({ onNavigate }: RegisterProps) {
  const router = useRouter();
  const { setUser, setBusinesses, setActiveBusiness } = useUserStore();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const [firstName, ...rest] = formData.name.trim().split(" ");
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: firstName || formData.name,
        last_name: rest.join(" ") || " ",
        business_name: formData.company || "Mi Negocio",
        business_phone: formData.phone || "0000000000",
        industry: "other",
      };

      await apiService.register(payload);
      const loginResponse = (await apiService.login(formData.email, formData.password)) as any;
      if (loginResponse?.user) {
        setUser(loginResponse.user);
      }
      await loadBusinesses();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Error al crear la cuenta. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("oauth_redirect_to", "/dashboard");
      window.location.href = `${API_BASE_URL}/auth/google`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center px-4 py-12">
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
            onClick={() => (onNavigate ? onNavigate("home") : router.push("/"))}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl text-gray-900">ReceptionistAI</span>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">Crea tu cuenta</h1>
          <p className="text-gray-700">Comienza tu prueba gratuita hoy</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 border-gray-200 hover:bg-gray-50"
            size="lg"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Registrarse con Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500">O regístrate con email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Tu Empresa S.A."
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+54 11 5555-5555"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 border-gray-200"
                  required
                />
              </div>
              <p className="text-gray-500">Mínimo 8 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => (onNavigate ? onNavigate("login") : router.push("/login"))}
                className="text-indigo-600 hover:text-indigo-700"
                type="button"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Al registrarte, aceptas nuestros{" "}
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
