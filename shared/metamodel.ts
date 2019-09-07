// Common types

export type Id = string;
export type Name = string;
export type Label = string;

export interface Graphics {
  [key: string]: { x: number, y: number}
}

// Validation
export interface ValidationResult {
  errors?: string;
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

// Helper
export function getLastIdNo(ids: Id[]): number {
  return ids.reduce((maxNum: number, id: Id) => {
    const idNumStr = id.match(/\d/g);
    if (!idNumStr) {
      console.error(new Error(`Something is wrong: id ${id} does not contain a number.`));
      return -1;
    } else {
      const idNum = parseInt(idNumStr.join(""), 10);
      return idNum > maxNum ? idNum : maxNum;
    }
  }, -1);
}
