import { BaseIndustryValidator } from './base-industry.validator';

export class DefaultConfigValidator extends BaseIndustryValidator {
  validate(configData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar secciones base mínimas
    errors.push(...this.validateRequiredSections(configData, [
      'configuracionAsistente',
      'precioDisponibilidad',
      'informacionEstablecimiento',
      'integracionFotos'
    ]));

    // Validar estructura básica
    errors.push(...this.validateConfiguracionAsistente(configData));
    errors.push(...this.validatePrecioDisponibilidad(configData));
    errors.push(...this.validateIntegracionFotos(configData));

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

