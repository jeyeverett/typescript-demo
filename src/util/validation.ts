namespace App {
  /* VALIDATION */
  export interface Validatable {
    value: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function validate(input: Validatable) {
    const { value, required, minLength, maxLength, min, max } = input;
    let isValid = true;

    if (required) {
      isValid = isValid && value.trim().length !== 0;
    }

    if (minLength) {
      isValid = isValid && value.trim().length >= minLength;
    }

    if (maxLength) {
      isValid = isValid && value.trim().length <= maxLength;
    }

    if (min) {
      isValid = isValid && Number(value.trim()) >= min;
    }

    if (max) {
      isValid = isValid && Number(value.trim()) <= max;
    }

    return isValid;
  }
}
