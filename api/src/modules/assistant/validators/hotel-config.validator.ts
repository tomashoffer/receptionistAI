import { BaseIndustryValidator } from './base-industry.validator';

export class HotelConfigValidator extends BaseIndustryValidator {
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

    // Validar campos específicos de hotel
    if (configData.configuracionAsistente?.fields) {
      const fields = configData.configuracionAsistente.fields;
      const fieldKeys = fields.map((f: any) => f.key);

      if (!fieldKeys.includes('infoHotel')) {
        errors.push('Hotel requires "infoHotel" field in configuracionAsistente');
      }

      if (!fieldKeys.includes('propuesta')) {
        errors.push('Hotel requires "propuesta" field in configuracionAsistente');
      }

      if (!fieldKeys.includes('tipoEstablecimiento')) {
        errors.push('Hotel requires "tipoEstablecimiento" field in configuracionAsistente');
      }
    }

    // Validar secciones específicas de hotel en informacionEstablecimiento
    if (configData.informacionEstablecimiento) {
      if (!configData.informacionEstablecimiento.servicios) {
        errors.push('Hotel requires "servicios" section in informacionEstablecimiento');
      }

      if (!configData.informacionEstablecimiento.instalaciones) {
        errors.push('Hotel requires "instalaciones" section in informacionEstablecimiento');
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

