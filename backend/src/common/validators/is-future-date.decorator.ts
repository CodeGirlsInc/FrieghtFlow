import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Requires a date value to be strictly in the future at validation time.
 * This is intentionally implemented as a validator rather than a module-load
 * `MinDate(new Date())`, since a long-running process must not freeze the
 * acceptable boundary when the application starts.
 */
export function IsFutureDate(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: {
        message: 'expiresAt must be a valid date in the future',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments): boolean {
          if (typeof value !== 'string' && !(value instanceof Date)) {
            return false;
          }

          const date = value instanceof Date ? value : new Date(value);
          return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
        },
      },
    });
  };
}
