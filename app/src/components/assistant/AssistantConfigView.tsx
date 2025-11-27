import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Save, AlertCircle, Wrench, Zap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';

const defaultPrompt = `Eres un recepcionista profesional y amable para [NOMBRE DEL NEGOCIO]. Tu objetivo es agendar citas de manera eficiente siguiendo estas instrucciones:

INSTRUCCIONES CRÍTICAS:
1. **Deletreo de Apellidos**: Siempre pide que deletreen los apellidos para evitar errores.
2. **Teléfono Dígito por Dígito**: Solicita el número de teléfono dígito por dígito y repítelo para confirmar.
3. **Inicio Silencioso**: NO menciones la fecha actual al usuario. Usa la tool get_current_datetime internamente.

FLUJO DE AGENDAMIENTO:
1. Saluda y pregunta en qué puedes ayudar
2. Obtén el nombre completo (deletrea apellidos)
3. Obtén el teléfono (dígito por dígito)
4. Pregunta qué servicio necesita
5. Pregunta cuándo desea la cita
6. Usa check_availability para verificar horarios
7. Confirma el horario con el cliente
8. Usa create_appointment para crear la cita
9. Confirma todos los detalles y despídete

Mantén un tono profesional pero cercano. Si el cliente pregunta algo fuera de agendamiento, usa la información en Knowledge Base.`;

const toolsData = [
  {
    name: 'get_current_datetime',
    type: 'ApiRequestTool',
    description: 'Obtiene la fecha y hora actual del servidor',
    endpoint: '/api/datetime',
    latency: '45ms',
    reliability: '99.9%',
  },
  {
    name: 'resolve_date',
    type: 'ApiRequestTool',
    description: 'Resuelve referencias temporales ("próximo viernes", "en 3 días")',
    endpoint: '/api/resolve-date',
    latency: '52ms',
    reliability: '99.9%',
  },
  {
    name: 'check_availability',
    type: 'FunctionTool',
    description: 'Verifica disponibilidad en el calendario',
    endpoint: 'Webhook → NestJS',
    latency: '280ms',
    reliability: '99.5%',
  },
  {
    name: 'create_appointment',
    type: 'FunctionTool',
    description: 'Crea una nueva cita en Google Calendar',
    endpoint: 'Webhook → NestJS → Google Calendar API',
    latency: '420ms',
    reliability: '99.2%',
  },
];

export function AssistantConfigView() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [knowledgeBase, setKnowledgeBase] = useState(
    'Horario de atención: Lunes a Viernes 9:00 AM - 6:00 PM\nDirección: Av. Reforma 123, CDMX\nServicios: Corte de Cabello, Tinte, Manicure, Pedicure'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Configuración del Asistente</h1>
        <p className="text-slate-600 mt-1">
          Control del prompting y arquitectura híbrida de tools
        </p>
      </div>

      {/* Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          La temperatura está configurada en 0.0 para garantizar respuestas deterministas en el flujo de agendamiento.
          Esto es crítico para la fiabilidad del sistema.
        </AlertDescription>
      </Alert>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Prompt (Core)</CardTitle>
              <CardDescription>
                Instrucciones base para el 
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              GPT-4o Cluster
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Prompt del Sistema</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 min-h-[400px] font-mono text-sm"
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm">Instrucciones resaltadas incluidas:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">✓ Deletreo de apellidos</Badge>
                <Badge variant="secondary">✓ Teléfono dígito por dígito</Badge>
                <Badge variant="secondary">✓ Inicio Silencioso (no mencionar fecha)</Badge>
              </div>
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hybrid Architecture Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Arquitectura Híbrida de Tools
          </CardTitle>
          <CardDescription>
            Distribución estratégica entre ApiRequestTool (baja latencia) y FunctionTool (lógica compleja)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Latencia</TableHead>
                <TableHead>Fiabilidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toolsData.map((tool) => (
                <TableRow key={tool.name}>
                  <TableCell className="font-mono text-sm">{tool.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tool.type === 'ApiRequestTool' ? 'default' : 'secondary'}
                      className={
                        tool.type === 'ApiRequestTool'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }
                    >
                      {tool.type === 'ApiRequestTool' && <Zap className="h-3 w-3 mr-1" />}
                      {tool.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{tool.description}</TableCell>
                  <TableCell className="text-sm font-mono text-slate-500">{tool.endpoint}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        parseInt(tool.latency) < 100
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : parseInt(tool.latency) < 300
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }
                    >
                      {tool.latency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {tool.reliability}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
            <h4 className="text-sm mb-2">💡 Estrategia de Arquitectura Híbrida:</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>
                • <strong>ApiRequestTool</strong>: Para operaciones simples y rápidas que no requieren lógica compleja
                (fechas, resolución temporal)
              </li>
              <li>
                • <strong>FunctionTool</strong>: Para operaciones que requieren lógica de negocio, integraciones externas
                y validaciones complejas (disponibilidad, creación de citas)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge / Extra Information</CardTitle>
          <CardDescription>
            Información adicional que el LLM puede consultar para responder preguntas fuera del flujo de agendamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="knowledge">Base de Conocimiento</Label>
            <Textarea
              id="knowledge"
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              className="mt-2 min-h-[150px] font-mono text-sm"
              placeholder="Agrega información sobre horarios, ubicación, servicios, políticas, etc."
            />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar Knowledge Base
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
