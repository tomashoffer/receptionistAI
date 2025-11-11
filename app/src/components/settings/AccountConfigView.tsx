import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Save, User, Mail, Lock, Shield } from 'lucide-react';
import { Separator } from '../ui/separator';

export function AccountConfigView() {
  return (
    <div className="space-y-6 pr-16">
      <div className="mt-6 p-4">
        <h1 className="text-3xl">Mi Cuenta</h1>
        <p className="text-slate-600 mt-1">
          Gestión de perfil y configuración de seguridad
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal y de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline">Cambiar Foto</Button>
              <p className="text-xs text-slate-500">
                JPG, PNG o GIF. Tamaño máximo 5MB.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="h-4 w-4 inline mr-1" />
                Nombre
              </Label>
              <Input id="firstName" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" defaultValue="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="h-4 w-4 inline mr-1" />
              Email
            </Label>
            <Input id="email" type="email" defaultValue="john@business.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" defaultValue="+52 55 9876 5432" />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña y configuración de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              <Lock className="h-4 w-4 inline mr-1" />
              Contraseña Actual
            </Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button>Actualizar Contraseña</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona Peligrosa</CardTitle>
          <CardDescription>
            Acciones irreversibles en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="text-sm">Eliminar Cuenta</p>
              <p className="text-xs text-slate-600 mt-1">
                Una vez eliminada, no podrás recuperar tu cuenta ni tus datos.
              </p>
            </div>
            <Button variant="destructive">Eliminar Cuenta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
