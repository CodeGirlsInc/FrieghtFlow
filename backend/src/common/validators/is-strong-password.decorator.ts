import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom class-validator decorator that enforces a strong password policy:
 *
 *  - Minimum 8 characters
 *  - At least one upper-case letter  (A-Z)
 *  - At least one lower-case letter  (a-z)
 *  - At least one digit              (0-9)
 *  - At least one special character  (non-alphanumeric)
 *
 * This mirrors the criteria scored by the frontend `PasswordStrengthBar`
 * component so that weak passwords are rejected server-side, not just
 * discouraged client-side.
 *
 * Usage:
 * ```ts
 * @IsStrongPassword()
 * password: string;
 * ```
 */
export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a digit, and a special character',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments): boolean {
          if (typeof value !== 'string') return false;
          if (value.length < 8) return false;
          if (!/[A-Z]/.test(value)) return false;
          if (!/[a-z]/.test(value)) return false;
          if (!/[0-9]/.test(value)) return false;
          if (!/[^A-Za-z0-9]/.test(value)) return false;
          return true;
        },
      },
    });
  };
}
