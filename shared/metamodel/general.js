//@flow

// Common types

export type Id = string;
export type Name = string;
export type Label = string;

// Validation

export type ValidationResult = {
  errors?: string
}

export const validationResultOK = {};

export function validateElement(ajv: any, elem: any, uri: string): ValidationResult {
  ajv.validate(uri, elem); 
  if (!ajv.errors) {
    return {};
  } else {
    return { errors: ajv.errorsText() };
  }
}

