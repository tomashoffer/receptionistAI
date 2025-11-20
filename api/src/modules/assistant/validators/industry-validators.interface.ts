export interface IndustryConfigValidator {
  validate(configData: any): { isValid: boolean; errors: string[] };
}

