import { BaseIndustryValidator } from './base-industry.validator';

export class DentalClinicConfigValidator extends BaseIndustryValidator {
  validate(configData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar secciones base
    errors.push(...this.validateRequiredSections(configData, [
      'configuracionAsistente',
      'precioDisponibilidad',
      'informacionEstablecimiento',
      'integracionFotos'
    ]));

    // Validar configuracionAsistente
    errors.push(...this.validateConfiguracionAsistente(configData));

    // Validar campos específicos de clínica dental
    if (configData.configuracionAsistente?.fields) {
      const fields = configData.configuracionAsistente.fields;
      const fieldKeys = fields.map((f: any) => f.key);

      if (!fieldKeys.includes('establecimiento')) {
        errors.push('Dental clinic requires "establecimiento" field');
      }

      if (!fieldKeys.includes('ubicacion')) {
        errors.push('Dental clinic requires "ubicacion" field');
      }
    }

    // Validar secciones en informacionEstablecimiento
    if (configData.informacionEstablecimiento) {
      if (!configData.informacionEstablecimiento.general) {
        errors.push('Dental clinic requires "general" section in informacionEstablecimiento');
      }
    }

    // Validar precioDisponibilidad
    errors.push(...this.validatePrecioDisponibilidad(configData));

    // Validar integracionFotos
    errors.push(...this.validateIntegracionFotos(configData));

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

