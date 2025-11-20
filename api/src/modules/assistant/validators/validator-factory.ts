import { Industry } from '../../business/entities/business.entity';
import { IndustryConfigValidator } from './industry-validators.interface';
import { HotelConfigValidator } from './hotel-config.validator';
import { RestaurantConfigValidator } from './restaurant-config.validator';
import { MedicalClinicConfigValidator } from './medical-clinic-config.validator';
import { DentalClinicConfigValidator } from './dental-clinic-config.validator';
import { DefaultConfigValidator } from './default-config.validator';

// Lazy load validators para evitar imports circulares
const validatorsCache: Map<Industry, IndustryConfigValidator> = new Map();

export class ConfigValidatorFactory {
  static getValidator(industry: Industry): IndustryConfigValidator {
    // Si ya existe en cache, retornarlo
    if (validatorsCache.has(industry)) {
      return validatorsCache.get(industry)!;
    }

    let validator: IndustryConfigValidator;

    switch (industry) {
      case Industry.HOTEL:
        validator = new HotelConfigValidator();
        break;
      case Industry.RESTAURANT:
        validator = new RestaurantConfigValidator();
        break;
      case Industry.MEDICAL_CLINIC:
        validator = new MedicalClinicConfigValidator();
        break;
      case Industry.DENTAL_CLINIC:
        validator = new DentalClinicConfigValidator();
        break;
      // Agregar más industries aquí cuando se creen sus validadores
      default:
        validator = new DefaultConfigValidator();
    }

    // Guardar en cache
    validatorsCache.set(industry, validator);
    return validator;
  }

  static clearCache(): void {
    validatorsCache.clear();
  }
}

