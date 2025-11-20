import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ConfigValidatorFactory } from '../validators/validator-factory';
import { Industry } from '../../business/entities/business.entity';

@ValidatorConstraint({ name: 'validateByIndustry', async: false })
export class ValidateByIndustryConstraint implements ValidatorConstraintInterface {
  validate(configData: any, args: ValidationArguments): boolean {
    // Obtener el industry del objeto padre
    const industry = (args.object as any).industry;

    if (!industry) {
      return false;
    }

    // Obtener el validador específico para este industry
    const validator = ConfigValidatorFactory.getValidator(industry as Industry);
    const result = validator.validate(configData);

    // Si hay errores, guardarlos en el contexto para el mensaje
    (args.object as any).__validationErrors = result.errors;

    return result.isValid;
  }

  defaultMessage(args: ValidationArguments): string {
    const industry = (args.object as any).industry;
    const errors = (args.object as any).__validationErrors || [];

    if (errors.length > 0) {
      return `Validation failed for ${industry}: ${errors.join(', ')}`;
    }

    return `Config data does not match the expected structure for industry: ${industry}`;
  }
}

export function ValidateByIndustry(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'validateByIndustry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidateByIndustryConstraint,
    });
  };
}

