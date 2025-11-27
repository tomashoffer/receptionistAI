import { Industry } from '../../business/entities/business.entity';

/**
 * Genera una configuración por defecto válida para un assistant
 * Esta estructura debe cumplir con los requisitos de validación según el industry
 */
export function generateDefaultAssistantConfig(
  industry: Industry,
  businessName: string
): {
  configuracionAsistente: any;
  precioDisponibilidad: any;
  informacionEstablecimiento: any;
  informacionExtra: any;
  integracionFotos: {
    areasComunes: any[];
    fotosGenerales: string[];
  };
} {
  // Estructura base común
  const baseConfig = {
    configuracionAsistente: {
      fields: [],
      directrices: {
        value: '',
        locked: false,
      },
      situaciones: [],
    },
    precioDisponibilidad: {
      secciones: [],
      situaciones: [],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: '',
        mensajeFijo: '',
      },
    },
    informacionEstablecimiento: {},
    informacionExtra: {},
    integracionFotos: {
      areasComunes: [],
      fotosGenerales: [],
    },
  };

  // Agregar campos requeridos según el industry
  if (industry === Industry.MEDICAL_CLINIC || industry === Industry.DENTAL_CLINIC) {
    // Campos requeridos para clínicas médicas y dentales
    baseConfig.configuracionAsistente.fields = [
      {
        key: 'establecimiento',
        label: 'Nombre del establecimiento',
        value: businessName,
        locked: false,
      },
      {
        key: 'ubicacion',
        label: 'Ubicación',
        value: '',
        locked: false,
      },
    ];

    // Sección general requerida en informacionEstablecimiento
    baseConfig.informacionEstablecimiento = {
      general: {
        title: industry === Industry.MEDICAL_CLINIC 
          ? 'Información general de la clínica médica'
          : 'Información general de la clínica dental',
        questions: [],
      },
    };
  }

  return baseConfig;
}

/**
 * Genera un prompt básico por defecto para el assistant
 */
export function generateDefaultPrompt(
  industry: Industry,
  businessName: string
): string {
  // Prompt básico que se puede mejorar después
  return `Eres un asistente virtual de ${businessName}. Tu trabajo es ayudar a los clientes con información sobre servicios, responder preguntas y agendar citas de manera profesional y amable.`;
}

