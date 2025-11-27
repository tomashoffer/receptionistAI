import { Injectable } from '@nestjs/common';
import { PromptTemplateService, PromptTemplateParams, BehaviorConfig } from './prompt-template.service';
import { BusinessData } from '../constants/industry-prompts';
import { AssistantConfiguration } from '../entities/assistant-configuration.entity';

@Injectable()
export class VoicePromptGeneratorService {
  constructor(private promptTemplateService: PromptTemplateService) {}

  /**
   * Genera un prompt optimizado específicamente para voz (Vapi)
   */
  generateVoicePrompt(
    businessData: BusinessData,
    config: AssistantConfiguration,
  ): string {
    // Extraer datos de la configuración
    const configData = config.config_data?.configuracionAsistente || {};
    const fields = configData.fields || [];
    
    // Obtener valores de campos
    const nombreField = fields.find((f: any) => f.key === 'nombre');
    const establecimientoField = fields.find((f: any) => f.key === 'establecimiento');
    const ubicacionField = fields.find((f: any) => f.key === 'ubicacion');
    const directricesField = configData.directrices;
    const situaciones = configData.situaciones || [];

    const assistantName = nombreField?.value || 'Recepcionista AI';
    const businessName = establecimientoField?.value || businessData.name || 'el negocio';
    const location = ubicacionField?.value || businessData.address || '';
    const directrices = directricesField?.value || '';

    // Obtener servicios desde config_data o businessData
    const servicios = this.extractServices(config, businessData);
    
    // Obtener horarios desde config_data o businessData
    const horarios = this.extractHorarios(config, businessData);

    // Obtener políticas desde config_data
    const policies = this.extractPolicies(config);

    // Extraer behavior_config con valores por defecto
    const behaviorConfig = this.extractBehaviorConfig(config);

    // Determinar idioma
    const language = this.determineLanguage(businessData);

    // Obtener voiceId desde configData
    const voiceId = configData.voiceId;
    const languageFromConfig = configData.language || language;
    
    // Mapear voiceId al nombre de la voz
    const voicePersona = this.getVoiceNameFromId(voiceId, languageFromConfig);

    // Construir parámetros del template
    const templateParams: PromptTemplateParams = {
      assistantName,
      businessName,
      industry: businessData.industry || 'other',
      location,
      voicePersona,
      services: servicios,
      horarios,
      policies,
      language: language as 'es-AR' | 'es' | 'en',
      channel: 'voice',
      directrices: directrices || undefined,
      situaciones: situaciones.length > 0 ? situaciones.map((s: any) => ({
        titulo: s.titulo || '',
        descripcion: s.descripcion || '',
      })) : undefined,
      behaviorConfig: behaviorConfig,
    };

    // Generar prompt usando el template
    return this.promptTemplateService.generatePrompt(templateParams);
  }

  /**
   * Extrae servicios desde config_data o businessData
   */
  private extractServices(config: AssistantConfiguration, businessData: BusinessData): string[] {
    // Intentar obtener desde config_data primero
    const precioDisponibilidad = config.config_data?.precioDisponibilidad;
    if (precioDisponibilidad?.secciones) {
      // Buscar servicios en las secciones
      const servicios: string[] = [];
      precioDisponibilidad.secciones.forEach((section: any) => {
        if (section.questions) {
          section.questions.forEach((q: any) => {
            if (q.pregunta?.toLowerCase().includes('servicio')) {
              // Extraer servicios de las respuestas
              const respuesta = q.respuesta || q.defaultValue || '';
              if (respuesta) {
                servicios.push(respuesta);
              }
            }
          });
        }
      });
      if (servicios.length > 0) return servicios;
    }

    // Fallback a businessData
    if (businessData.services && Array.isArray(businessData.services)) {
      return businessData.services.map((s: any) => 
        typeof s === 'string' ? s : s.name || s.title || ''
      ).filter(Boolean);
    }

    // Servicios por defecto según industria
    return this.getDefaultServices(config.industry);
  }

  /**
   * Extrae horarios desde config_data o businessData
   */
  private extractHorarios(config: AssistantConfiguration, businessData: BusinessData): string {
    // Intentar obtener desde config_data
    const informacionEstablecimiento = config.config_data?.informacionEstablecimiento;
    if (informacionEstablecimiento?.horarios?.questions) {
      const horarioQuestion = informacionEstablecimiento.horarios.questions.find(
        (q: any) => q.pregunta?.toLowerCase().includes('horario')
      );
      if (horarioQuestion) {
        return horarioQuestion.respuesta || horarioQuestion.defaultValue || '';
      }
    }

    // Fallback a businessData
    if (businessData.business_hours) {
      return JSON.stringify(businessData.business_hours);
    }

    return 'Lunes a Viernes: 9:00 AM - 6:00 PM';
  }

  /**
   * Extrae políticas desde config_data
   */
  private extractPolicies(config: AssistantConfiguration): string {
    const precioDisponibilidad = config.config_data?.precioDisponibilidad;
    if (precioDisponibilidad?.configAvanzada) {
      const policies: string[] = [];
      const configAvanzada = precioDisponibilidad.configAvanzada;
      
      if (configAvanzada.mensajeFijo) {
        policies.push(`Mensaje fijo: ${configAvanzada.mensajeFijo}`);
      }
      if (configAvanzada.instruccionesCalculo) {
        policies.push(`Instrucciones de cálculo: ${configAvanzada.instruccionesCalculo}`);
      }
      if (configAvanzada.detenerseCotizacion) {
        policies.push('Detenerse en cotización: Sí');
      }
      
      return policies.join('\n');
    }

    return '';
  }

  /**
   * Obtiene servicios por defecto según industria
   */
  private getDefaultServices(industry: string): string[] {
    const defaultServices: Record<string, string[]> = {
      hair_salon: ['Corte de cabello', 'Tinte', 'Peinado', 'Tratamiento capilar'],
      restaurant: ['Reserva de mesa', 'Consulta de menú', 'Eventos privados'],
      medical_clinic: ['Consulta médica general', 'Consulta especializada', 'Control de rutina'],
      dental: ['Consulta dental', 'Limpieza', 'Tratamiento', 'Ortodoncia'],
      fitness: ['Clase grupal', 'Entrenamiento personal', 'Evaluación física'],
      beauty: ['Manicure', 'Pedicure', 'Depilación', 'Tratamiento facial'],
    };

    return defaultServices[industry] || ['Consulta', 'Servicio general'];
  }

  /**
   * Extrae behavior_config con valores por defecto
   */
  private extractBehaviorConfig(config: AssistantConfiguration): BehaviorConfig {
    const behaviorConfig = config.behaviorConfig || {};
    
    // Valores por defecto
    const defaults = {
      estado: 'activado',
      horarios: 'Mostrar horarios',
      reactivar: '1',
      zonaHoraria: 'uruguay',
      email: undefined,
      telefono: undefined,
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

    // Mergear con valores por defecto
    return {
      ...defaults,
      ...behaviorConfig,
      // Asegurar que seguimientos tenga valores por defecto si no existe
      seguimientos: behaviorConfig.seguimientos || defaults.seguimientos,
    };
  }

  /**
   * Determina el idioma basado en businessData o configuración
   */
  private determineLanguage(businessData: BusinessData): string {
    // Por ahora, siempre español argentino para MVP
    return 'es-AR';
  }

  /**
   * Obtiene el nombre de la voz basado en voiceId y idioma
   */
  private getVoiceNameFromId(voiceId?: string, language?: string): string {
    if (!voiceId) {
      return 'seleccionada desde la configuración';
    }

    // Mapeo de voiceIds a nombres (basado en ConfiguracionAsistenteTab.tsx)
    const voicesES: Record<string, string> = {
      '1WXz8v08ntDcSTeVXMN2': 'Malena Tango',
      'PBi4M0xL4G7oVYxKgqww': 'Franco',
      'bN1bDXgDIGX5lw0rtY2B': 'Melanie',
    };

    const voicesEN: Record<string, string> = {
      '2qfp6zPuviqeCOZIE9RZ': 'Christina',
      'DHeSUVQvhhYeIxNUbtj3': 'Christopher',
      'D9Thk1W7FRMgiOhy3zVI': 'Aaron',
    };

    const isSpanish = !language || language.startsWith('es');
    const voices = isSpanish ? voicesES : voicesEN;
    
    const voiceName = voices[voiceId];
    
    if (voiceName) {
      return voiceName;
    }
    
    // Si es OpenAI TTS o no se encuentra, usar descripción genérica
    if (voiceId === 'tts-1') {
      return 'OpenAI TTS (sintética)';
    }
    
    return 'seleccionada desde la configuración';
  }
}


