'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Bot, Mail, Lock, User, Chrome, Building, Phone, Briefcase } from "lucide-react";
import { apiService } from "@/services/api.service";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

const industries = [
  { value: 'medical_clinic', label: 'Salud' },
  { value: 'beauty_salon', label: 'Belleza' },
  { value: 'restaurant', label: 'Gastronomía' },
  { value: 'fitness_center', label: 'Fitness' },
  { value: 'hair_salon', label: 'Peluquería' },
  { value: 'dental_clinic', label: 'Clínica Dental' },
  { value: 'law_firm', label: 'Legal' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'real_estate', label: 'Inmobiliaria' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'other', label: 'Otro' }
];

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
    industry: "",
  });
  const [industryPlaceholder, setIndustryPlaceholder] = useState("Selecciona el rubro de tu negocio");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIndustryChange = (value: string) => {
    setFormData({
      ...formData,
      industry: value,
    });
    // Actualizar placeholder cuando se selecciona un valor
    const selectedIndustry = industries.find(ind => ind.value === value);
    if (selectedIndustry) {
      setIndustryPlaceholder(selectedIndustry.label);
    }
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
        industry: formData.industry || "other",
      };

      await apiService.register(payload);
      const loginResponse = (await apiService.login(formData.email, formData.password)) as any;
      if (loginResponse?.user) {
        setUser(loginResponse.user);
      }
      await loadBusinesses();
      router.push("/dashboard");
    } catch (err: any) {
      // Mostrar mensaje de error más específico
      const errorMessage = err?.message || "Error al crear la cuenta. Intenta nuevamente.";
      setError(errorMessage);
      console.error('Error en registro:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
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
            onClick={() => (onNavigate ? onNavigate("home") : router.push("/"))}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl" style={{ color: 'black' }}>ReceptionistAI</span>
          </div>
          <h1 className="text-2xl" style={{ color: 'black' }}>Crea tu cuenta</h1>
          <p className="dark:text-gray-300" style={{ color: 'black' }}>Comienza tu prueba gratuita hoy</p>
        </div>

        {/* Register Card */}
        <div className="dark:bg-gray-800 rounded-2xl p-8 border dark:border-gray-700 shadow-xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-100"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            size="lg"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Registrarse con Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700" style={{ borderColor: 'var(--border)' }}></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 dark:bg-gray-800 dark:text-gray-400" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}>O regístrate con email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: 'var(--foreground)' }}>Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" style={{ color: 'var(--foreground)' }}>Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Tu Empresa S.A."
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" style={{ color: 'var(--foreground)' }}>Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+54 11 5555-5555"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" style={{ color: 'var(--foreground)' }}>Rubro / Industria <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 z-10 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
                <Select
                  value={formData.industry || undefined}
                  onValueChange={handleIndustryChange}
                  required
                >
                  <SelectTrigger className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 w-full" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'black' }}>
                    <SelectValue placeholder={industryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700" style={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }}>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value} className="dark:text-gray-100 dark:hover:bg-gray-700" style={{ color: 'var(--popover-foreground)' }}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'var(--foreground)' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: 'var(--foreground)' }}>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                  required
                />
              </div>
              <p className="dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }}>Mínimo 8 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" style={{ color: 'var(--foreground)' }}>Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
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
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="dark:text-gray-300" style={{ color: 'var(--foreground)' }}>
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => (onNavigate ? onNavigate("login") : router.push("/login"))}
                className="dark:text-indigo-400 dark:hover:text-indigo-300 underline hover:no-underline cursor-pointer font-medium transition-colors"
                style={{ color: 'var(--primary)' }}
                type="button"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>

        <p className="text-center dark:text-gray-400 mt-6" style={{ color: 'var(--muted-foreground)' }}>
          Al registrarte, aceptas nuestros{" "}
          <a href="#" className="dark:text-indigo-400 dark:hover:text-indigo-300" style={{ color: 'var(--primary)' }}>
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="dark:text-indigo-400 dark:hover:text-indigo-300" style={{ color: 'var(--primary)' }}>
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
