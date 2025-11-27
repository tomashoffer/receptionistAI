import { BaseIndustryValidator } from './base-industry.validator';

export class RestaurantConfigValidator extends BaseIndustryValidator {
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

    // Validar campos específicos de restaurant
    if (configData.configuracionAsistente?.fields) {
      const fields = configData.configuracionAsistente.fields;
      const fieldKeys = fields.map((f: any) => f.key);

      if (!fieldKeys.includes('establecimiento')) {
        errors.push('Restaurant requires "establecimiento" field');
      }

      if (!fieldKeys.includes('ubicacion')) {
        errors.push('Restaurant requires "ubicacion" field');
      }
    }

    // Validar secciones en precioDisponibilidad
    if (configData.precioDisponibilidad?.secciones) {
      const secciones = configData.precioDisponibilidad.secciones;
      const hasMenu = secciones.some((s: any) => s.key === 'menu' || s.title?.toLowerCase().includes('menú'));
      
      if (!hasMenu) {
        errors.push('Restaurant should have a "menu" section in precioDisponibilidad');
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

