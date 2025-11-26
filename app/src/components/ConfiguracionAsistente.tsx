'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Info, AlertCircle, Loader2, Save, Check } from 'lucide-react';
import { PageHeaderResponsive } from './layout/PageHeaderResponsive';
import { useAssistantStore } from '../stores/assistantStore';
import { useUserStore } from '../stores/userStore';
import { apiService } from '../services/api.service';
import { toast } from 'sonner';

// Valores por defecto
const defaultConfig = {
  estado: 'activado' as const,
  horarios: 'Mostrar horarios' as const,
  reactivar: '1' as const,
  zonaHoraria: 'uruguay' as const,
  email: '',
  telefono: '',
  latitud: '',
  longitud: '',
  mensajePausa: '',
  segundoMensaje: false,
  segundoMensajePausa: '',
  seguimientos: [
    { tiempo: 'No definido', primero: false, segundo: false, primerValor: 'en-24-horas', segundoValor: 'no-enviar' },
    { tiempo: 'El mismo día', primero: true, segundo: true, primerValor: 'en-1-hora', segundoValor: 'en-30-min' },
    { tiempo: 'Entre 1 y 3 días', primero: true, segundo: true, primerValor: 'en-8-horas', segundoValor: 'en-4-horas' },
    { tiempo: 'Entre 3 días y 1 semana', primero: true, segundo: true, primerValor: 'en-12-horas', segundoValor: 'en-6-horas' },
    { tiempo: 'Más de una semana', primero: true, segundo: true, primerValor: 'en-18-horas', segundoValor: 'en-6-horas' }
  ]
};

export function ConfiguracionAsistente() {
  const { assistantConfig, setAssistantConfig } = useAssistantStore();
  const { activeBusiness } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [config, setConfig] = useState(defaultConfig);
  const [seguimientos, setSeguimientos] = useState(defaultConfig.seguimientos);

  // Cargar o crear configuración si no existe
  useEffect(() => {
    const loadOrCreateConfig = async () => {
      if (!activeBusiness?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Si no hay config en el store, intentar cargar desde el backend
        if (!assistantConfig?.id) {
          console.log('No hay config en store, intentando cargar desde backend...');
          const loadedConfig = await apiService.getAssistantConfig(activeBusiness.id) as any;
          
          if (loadedConfig) {
            // Config existe, normalizar behaviorConfig a behavior_config para el store
            const normalizedConfig = {
              ...loadedConfig,
              behavior_config: loadedConfig.behaviorConfig || loadedConfig.behavior_config || {},
            };
            // Eliminar behaviorConfig si existe para evitar duplicados
            if (normalizedConfig.behaviorConfig) {
              delete normalizedConfig.behaviorConfig;
            }
            setAssistantConfig(normalizedConfig);
          } else {
            // Config no existe, crear automáticamente
            console.log('No existe configuración, creando automáticamente...');
            const emptyConfigData = {
              configuracionAsistente: {},
              precioDisponibilidad: {},
              informacionEstablecimiento: {},
              informacionExtra: {},
              integracionFotos: {
                areasComunes: [],
                fotosGenerales: [],
              },
            };
            
            const defaultPrompt = `Eres un asistente virtual profesional. Tu trabajo es ayudar a los clientes con información sobre servicios y agendar citas de manera amable y eficiente.`;
            
            const newConfig = await apiService.createAssistantConfig({
              business_id: activeBusiness.id,
              industry: activeBusiness.industry,
              prompt: defaultPrompt,
              config_data: emptyConfigData,
            }) as any;
            
            console.log('Configuración creada automáticamente:', newConfig);
            // Normalizar behaviorConfig a behavior_config para el store
            const normalizedNewConfig = {
              ...newConfig,
              behavior_config: newConfig.behaviorConfig || newConfig.behavior_config || {},
            };
            // Eliminar behaviorConfig si existe para evitar duplicados
            if (normalizedNewConfig.behaviorConfig) {
              delete normalizedNewConfig.behaviorConfig;
            }
            setAssistantConfig(normalizedNewConfig);
            toast.success('Configuración de asistente creada automáticamente');
          }
        }
      } catch (error) {
        console.error('Error al cargar/crear configuración:', error);
        toast.error('No se pudo cargar o crear la configuración');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateConfig();
  }, [activeBusiness?.id]);

  // Cargar behavior_config desde el backend cuando existe assistantConfig
  useEffect(() => {
    const loadBehaviorConfig = async () => {
      if (!assistantConfig?.id) {
        return;
      }

      // No poner loading aquí porque ya se maneja en el useEffect anterior
      try {
        // Intentar usar el behavior_config/behaviorConfig del store primero, si no está disponible, cargar del backend
        let behaviorConfig: any = {};
        
        // El backend retorna behaviorConfig (camelCase), pero el store puede tener behavior_config (snake_case)
        const behaviorConfigFromStore = (assistantConfig as any)?.behaviorConfig || (assistantConfig as any)?.behavior_config;
        
        if (behaviorConfigFromStore) {
          behaviorConfig = behaviorConfigFromStore;
        } else {
          // Cargar desde el backend
          const loadedConfig = await apiService.getAssistantConfigById(assistantConfig.id);
          // El backend retorna behaviorConfig (camelCase)
          behaviorConfig = (loadedConfig as any)?.behaviorConfig || (loadedConfig as any)?.behavior_config || {};
          
          // Actualizar el store con la config completa si viene del backend
          if (loadedConfig) {
            setAssistantConfig(loadedConfig);
          }
        }
        
        // Cargar configuración desde backend o usar defaults
        setConfig({
          estado: behaviorConfig.estado || defaultConfig.estado,
          horarios: behaviorConfig.horarios || defaultConfig.horarios,
          reactivar: behaviorConfig.reactivar || defaultConfig.reactivar,
          zonaHoraria: behaviorConfig.zonaHoraria || defaultConfig.zonaHoraria,
          email: behaviorConfig.email || defaultConfig.email,
          telefono: behaviorConfig.telefono || defaultConfig.telefono,
          latitud: behaviorConfig.latitud || defaultConfig.latitud,
          longitud: behaviorConfig.longitud || defaultConfig.longitud,
          mensajePausa: behaviorConfig.mensajePausa || defaultConfig.mensajePausa,
          segundoMensaje: behaviorConfig.segundoMensaje ?? defaultConfig.segundoMensaje,
          segundoMensajePausa: behaviorConfig.segundoMensajePausa || defaultConfig.segundoMensajePausa,
          seguimientos: behaviorConfig.seguimientos || defaultConfig.seguimientos,
        });
        
        setSeguimientos(behaviorConfig.seguimientos || defaultConfig.seguimientos);
        setHasChanges(false);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error al cargar behavior_config:', error);
        toast.error('No se pudo cargar la configuración de comportamiento');
        setIsInitialLoad(false);
      }
    };

    loadBehaviorConfig();
  }, [assistantConfig?.id, setAssistantConfig]);

  // Guardar behavior_config en el backend
  const handleSave = async () => {
    if (!assistantConfig?.id) {
      toast.error('No hay configuración de asistente disponible');
      return;
    }

    setIsSaving(true);
    try {
      const behaviorConfig = {
        estado: config.estado,
        horarios: config.horarios,
        reactivar: config.reactivar,
        zonaHoraria: config.zonaHoraria,
        email: config.email || undefined,
        telefono: config.telefono || undefined,
        latitud: config.latitud || undefined,
        longitud: config.longitud || undefined,
        mensajePausa: config.mensajePausa || undefined,
        segundoMensaje: config.segundoMensaje,
        segundoMensajePausa: config.segundoMensajePausa || undefined,
        seguimientos: seguimientos,
      };

      const updatedConfig = await apiService.updateAssistantConfig(assistantConfig.id, {
        behavior_config: behaviorConfig,
      }) as any;

      // Actualizar el store con la respuesta del backend
      // Normalizar behaviorConfig a behavior_config para el store
      if (updatedConfig) {
        const normalizedConfig = {
          ...updatedConfig,
          behavior_config: updatedConfig.behaviorConfig || updatedConfig.behavior_config || behaviorConfig,
        };
        // Eliminar behaviorConfig si existe para evitar duplicados
        if (normalizedConfig.behaviorConfig) {
          delete normalizedConfig.behaviorConfig;
        }
        setAssistantConfig(normalizedConfig);
      }

      setHasChanges(false);
      toast.success('La configuración de comportamiento se guardó correctamente');
    } catch (error: any) {
      console.error('Error al guardar behavior_config:', error);
      toast.error(error.message || 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  // Detectar cambios (solo después de la carga inicial)
  useEffect(() => {
    if (!isInitialLoad) {
      setHasChanges(true);
    }
  }, [config, seguimientos, isInitialLoad]);

  // Mostrar loading mientras carga
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay configuración disponible
  if (!assistantConfig?.id) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configuración no disponible</h3>
            <p className="text-gray-600 mb-4">
              Primero debes crear una configuración de asistente en la sección "Conocimiento".
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const handleToggleSeguimiento = (index: number, tipo: 'primero' | 'segundo') => {
    const newSeguimientos = [...seguimientos];
    newSeguimientos[index][tipo] = !newSeguimientos[index][tipo];
    setSeguimientos(newSeguimientos);
  };

  const handleSeguimientoChange = (index: number, tipo: 'primerValor' | 'segundoValor', value: string) => {
    const newSeguimientos = [...seguimientos];
    newSeguimientos[index][tipo] = value;
    setSeguimientos(newSeguimientos);
  };

  return (
    <div className="bg-gray-50 bg-gray-50">
      <PageHeaderResponsive
        title="Comportamiento del asistente"
        subtitle={
          <>
            <span className="md:hidden">Aquí puedes configurar el comportamiento del asistente virtual.</span>
            <span className="hidden md:inline">Aquí puedes configurar el comportamiento del asistente virtual. Establece los horarios de funcionamiento y programa mensajes de seguimiento para tus usuarios.</span>
          </>
        }
        actions={
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 px-3 py-1">
              {config.estado === 'activado' ? 'Activado' : 'Pausado'}
            </Badge>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            )}
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <Label>Estado</Label>
            <div className="md:md:col-span-2">
              <Select value={config.estado} onValueChange={(value) => setConfig({ ...config, estado: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activado">Activado</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horarios de funcionamiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <Label>Horarios de funcionamiento</Label>
            <div className="md:md:col-span-2">
              <Select value={config.horarios} onValueChange={(value) => setConfig({ ...config, horarios: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mostrar horarios">Mostrar horarios</SelectItem>
                  <SelectItem value="24/7">24/7</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reactivar conversación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <Label>Reactivar la conversación después de</Label>
            <div className="md:col-span-2">
              <Select value={config.reactivar} onValueChange={(value) => setConfig({ ...config, reactivar: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 día</SelectItem>
                  <SelectItem value="2">2 días</SelectItem>
                  <SelectItem value="3">3 días</SelectItem>
                  <SelectItem value="7">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Zona horaria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <Label>Zona horaria</Label>
            <div className="md:col-span-2">
              <Select value={config.zonaHoraria} onValueChange={(value) => setConfig({ ...config, zonaHoraria: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uruguay">Hora de Uruguay (UTC-3)</SelectItem>
                  <SelectItem value="argentina">Hora de Argentina (UTC-3)</SelectItem>
                  <SelectItem value="brasil">Hora de Brasil (UTC-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email para notificaciones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <Label>Email para recibir notificaciones</Label>
            <div className="md:col-span-2">
              <Input 
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Números de teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <Label>Números de teléfono para notificaciones</Label>
            <div className="md:col-span-2">
              <Input 
                placeholder="Agregar número y presionar espacio"
                value={config.telefono}
                onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Latitud */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <div className="flex items-center gap-2">
              <Label>Latitud para el clima</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="md:col-span-2">
              <Input 
                value={config.latitud}
                onChange={(e) => setConfig({ ...config, latitud: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Longitud */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-center">
            <div className="flex items-center gap-2">
              <Label>Longitud para el clima</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="md:col-span-2">
              <Input 
                value={config.longitud}
                onChange={(e) => setConfig({ ...config, longitud: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {/* Mensaje de pausa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-start">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">Mensaje de pausa</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Textarea 
                placeholder="Escribe tu mensaje aquí..."
                value={config.mensajePausa}
                onChange={(e) => setConfig({ ...config, mensajePausa: e.target.value })}
                className="bg-white min-h-[120px] resize-none"
                maxLength={1000}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs text-gray-500">
                  Define el mensaje cuando el asistente exceda su conocimiento.
                </p>
                <span className="text-xs font-medium text-purple-600">
                  {config.mensajePausa.length} / 1000
                </span>
              </div>
            </div>
          </div>

          {/* Segundo mensaje de pausa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 md:items-start">
            <div className="flex items-center gap-2">
              <Label>Segundo mensaje de pausa</Label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={config.segundoMensaje}
                  onCheckedChange={(checked) => setConfig({ ...config, segundoMensaje: checked })}
                />
                <span className="text-sm text-gray-600">
                  Activar segundo mensaje
                </span>
              </div>
              
              {config.segundoMensaje && (
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Escribe tu segundo mensaje aquí..."
                    value={config.segundoMensajePausa}
                    onChange={(e) => setConfig({ ...config, segundoMensajePausa: e.target.value })}
                    className="bg-white min-h-[120px] resize-none"
                    maxLength={1000}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-xs text-gray-500">
                      Mensaje adicional cuando el asistente exceda su conocimiento.
                    </p>
                    <span className="text-xs font-medium text-purple-600">
                      {config.segundoMensajePausa.length} / 1000
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de horarios de seguimiento */}
          <div className="space-y-4 mt-8">
            <h2 className="text-lg">Tabla de horarios de seguimiento</h2>
            <p className="text-sm text-gray-600">
              Establece el tiempo de horas para enviar el mensaje de seguimiento después de que el usuario no haya respondido.
            </p>

            {/* Nota importante */}
            <div className="rounded-lg p-4 border bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 dark:from-purple-900/40 dark:to-blue-900/40 dark:border-purple-500/40 dark:text-white">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-purple-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm  dark:text-white">
                    <span className="font-semibold">Nota importante:</span> WhatsApp API tiene un límite de 24 horas para enviar mensajes después de la última interacción del usuario.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla Desktop / Cards Mobile */}
            <div className="space-y-3">
              {/* Tabla para Desktop */}
              <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="grid grid-cols-4 bg-purple-600 text-white border-b border-gray-200">
                  <div className="p-4 border-r border-purple-500">
                    <p className="text-sm font-medium">Tiempo para fecha consultada</p>
                  </div>
                  <div className="p-4 border-r border-purple-500 col-span-2">
                    <p className="text-sm font-medium">1° Seguimiento</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium">2° Seguimiento</p>
                  </div>
                </div>

                {seguimientos.map((seg, index) => (
                  <div key={index} className="grid grid-cols-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <div className="p-4 border-r border-gray-200 flex items-center">
                      <p className="text-sm font-medium">{seg.tiempo}</p>
                    </div>
                    <div className="p-4 border-r border-gray-200 flex items-center gap-3">
                      <Switch 
                        checked={seg.primero}
                        onCheckedChange={() => handleToggleSeguimiento(index, 'primero')}
                      />
                    </div>
                    <div className="p-4 border-r border-gray-200">
                      <Select 
                        value={seg.primerValor}
                        onValueChange={(value) => handleSeguimientoChange(index, 'primerValor', value)}
                        disabled={!seg.primero}
                      >
                        <SelectTrigger className={!seg.primero ? 'bg-gray-50' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-24-horas">Seguimiento en 24 horas</SelectItem>
                          <SelectItem value="en-1-hora">Seguimiento en 1 hora</SelectItem>
                          <SelectItem value="en-4-horas">Seguimiento en 4 horas</SelectItem>
                          <SelectItem value="en-6-horas">Seguimiento en 6 horas</SelectItem>
                          <SelectItem value="en-8-horas">Seguimiento en 8 horas</SelectItem>
                          <SelectItem value="en-12-horas">Seguimiento en 12 horas</SelectItem>
                          <SelectItem value="en-18-horas">Seguimiento en 18 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 flex items-center gap-3">
                      <Switch 
                        checked={seg.segundo}
                        onCheckedChange={() => handleToggleSeguimiento(index, 'segundo')}
                      />
                      <Select 
                        value={seg.segundoValor}
                        onValueChange={(value) => handleSeguimientoChange(index, 'segundoValor', value)}
                        disabled={!seg.segundo}
                      >
                        <SelectTrigger className={!seg.segundo ? 'bg-gray-50' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-enviar">No enviar seguimiento</SelectItem>
                          <SelectItem value="en-30-min">Seguimiento en 30 min</SelectItem>
                          <SelectItem value="en-1-hora">Seguimiento en 1 hora</SelectItem>
                          <SelectItem value="en-4-horas">Seguimiento en 4 horas</SelectItem>
                          <SelectItem value="en-6-horas">Seguimiento en 6 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cards para Mobile */}
              <div className="md:hidden space-y-3">
                {seguimientos.map((seg, index) => (
                  <Card key={index} className="p-4">
                    <h3 className="font-semibold text-sm mb-3">{seg.tiempo}</h3>
                    
                    {/* 1° Seguimiento */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">1° Seguimiento</Label>
                        <Switch 
                          checked={seg.primero}
                          onCheckedChange={() => handleToggleSeguimiento(index, 'primero')}
                        />
                      </div>
                      <Select 
                        value={seg.primerValor}
                        onValueChange={(value) => handleSeguimientoChange(index, 'primerValor', value)}
                        disabled={!seg.primero}
                      >
                        <SelectTrigger className={!seg.primero ? 'bg-gray-50' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-24-horas">En 24 horas</SelectItem>
                          <SelectItem value="en-1-hora">En 1 hora</SelectItem>
                          <SelectItem value="en-4-horas">En 4 horas</SelectItem>
                          <SelectItem value="en-6-horas">En 6 horas</SelectItem>
                          <SelectItem value="en-8-horas">En 8 horas</SelectItem>
                          <SelectItem value="en-12-horas">En 12 horas</SelectItem>
                          <SelectItem value="en-18-horas">En 18 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2° Seguimiento */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">2° Seguimiento</Label>
                        <Switch 
                          checked={seg.segundo}
                          onCheckedChange={() => handleToggleSeguimiento(index, 'segundo')}
                        />
                      </div>
                      <Select 
                        value={seg.segundoValor}
                        onValueChange={(value) => handleSeguimientoChange(index, 'segundoValor', value)}
                        disabled={!seg.segundo}
                      >
                        <SelectTrigger className={!seg.segundo ? 'bg-gray-50' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-enviar">No enviar</SelectItem>
                          <SelectItem value="en-30-min">En 30 min</SelectItem>
                          <SelectItem value="en-1-hora">En 1 hora</SelectItem>
                          <SelectItem value="en-4-horas">En 4 horas</SelectItem>
                          <SelectItem value="en-6-horas">En 6 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
