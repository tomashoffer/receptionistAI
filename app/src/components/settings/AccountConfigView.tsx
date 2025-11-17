import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Save, User, Mail, Lock, Shield } from 'lucide-react';
import { Separator } from '../ui/separator';
import { PageHeader } from '../layout/PageHeader';

export function AccountConfigView() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-slate-100">
      <PageHeader
        title="Mi Cuenta"
        subtitle="Gestión de perfil y configuración de seguridad"
        showBusinessSelector={false}
      />

      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-4 md:space-y-6">

        {/* Profile Info */}
        <Card className="dark:bg-slate-900/40 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Información del Perfil</CardTitle>
            <CardDescription className="text-sm">
              Actualiza tu información personal y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200 text-lg md:text-xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center sm:text-left">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Cambiar Foto
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG o GIF. Tamaño máximo 5MB.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">
                  <User className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                  Nombre
                </Label>
                <Input id="firstName" defaultValue="John" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Apellido</Label>
                <Input id="lastName" defaultValue="Doe" className="text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                <Mail className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                Email
              </Label>
              <Input id="email" type="email" defaultValue="john@business.com" className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Teléfono</Label>
              <Input id="phone" defaultValue="+52 55 9876 5432" className="text-sm" />
            </div>

            <div className="flex justify-center sm:justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="dark:bg-slate-900/40 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              Seguridad
            </CardTitle>
            <CardDescription className="text-sm">
              Actualiza tu contraseña y configuración de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm">
                <Lock className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                Contraseña Actual
              </Label>
              <Input id="currentPassword" type="password" className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm">Nueva Contraseña</Label>
              <Input id="newPassword" type="password" className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">Confirmar Nueva Contraseña</Label>
              <Input id="confirmPassword" type="password" className="text-sm" />
            </div>

            <div className="flex justify-center sm:justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                Actualizar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/80 shadow-sm dark:border-red-500/30 dark:bg-[#1b0b0c] dark:shadow-[0_0_0_1px_rgba(248,113,113,0.2)]">
          <CardHeader>
            <CardTitle className="text-red-600 text-lg md:text-xl">Zona Peligrosa</CardTitle>
            <CardDescription className="text-sm">
              Acciones irreversibles en tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-4 p-4 border border-red-100 rounded-lg bg-white shadow-inner dark:border-red-500/40 dark:bg-red-500/10 dark:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.35)]">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-red-50">Eliminar Cuenta</p>
                <p className="text-xs text-slate-600 dark:text-red-200 mt-1">
                  Una vez eliminada, no podrás recuperar tu cuenta ni tus datos.
                </p>
              </div>
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto dark:bg-red-600 dark:text-white dark:hover:bg-red-500"
              >
                Eliminar Cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
