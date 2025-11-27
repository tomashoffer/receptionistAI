import { IndustryConfigValidator } from './industry-validators.interface';

export abstract class BaseIndustryValidator implements IndustryConfigValidator {
  abstract validate(configData: any): { isValid: boolean; errors: string[] };

  // Métodos helper comunes
  protected validateRequiredSections(
    configData: any,
    requiredSections: string[]
  ): string[] {
    const errors: string[] = [];

    for (const section of requiredSections) {
      if (!configData[section]) {
        errors.push(`Missing required section: ${section}`);
      }
    }

    return errors;
  }

  protected validateConfiguracionAsistente(
    configData: any
  ): string[] {
    const errors: string[] = [];

    if (!configData.configuracionAsistente) {
      errors.push('Missing configuracionAsistente section');
      return errors;
    }

    const config = configData.configuracionAsistente;

    if (!config.fields || !Array.isArray(config.fields)) {
      errors.push('configuracionAsistente.fields must be an array');
    }

    if (!config.directrices) {
      errors.push('configuracionAsistente.directrices is required');
    }

    if (!config.situaciones || !Array.isArray(config.situaciones)) {
      errors.push('configuracionAsistente.situaciones must be an array');
    }

    return errors;
  }

  protected validatePrecioDisponibilidad(
    configData: any
  ): string[] {
    const errors: string[] = [];

    if (!configData.precioDisponibilidad) {
      errors.push('Missing precioDisponibilidad section');
      return errors;
    }

    const precio = configData.precioDisponibilidad;

    if (!precio.secciones || !Array.isArray(precio.secciones)) {
      errors.push('precioDisponibilidad.secciones must be an array');
    }

    if (!precio.situaciones || !Array.isArray(precio.situaciones)) {
      errors.push('precioDisponibilidad.situaciones must be an array');
    }

    if (!precio.configAvanzada) {
      errors.push('precioDisponibilidad.configAvanzada is required');
    }

    return errors;
  }

  protected validateIntegracionFotos(
    configData: any
  ): string[] {
    const errors: string[] = [];

    if (!configData.integracionFotos) {
      errors.push('Missing integracionFotos section');
      return errors;
    }

    const fotos = configData.integracionFotos;

    if (!fotos.areasComunes || !Array.isArray(fotos.areasComunes)) {
      errors.push('integracionFotos.areasComunes must be an array');
    }

    if (!fotos.fotosGenerales || !Array.isArray(fotos.fotosGenerales)) {
      errors.push('integracionFotos.fotosGenerales must be an array');
    }

    return errors;
  }
}

