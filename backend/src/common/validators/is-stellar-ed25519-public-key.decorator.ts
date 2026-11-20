import { StrKey } from '@stellar/stellar-sdk';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validates a Stellar account (Ed25519) public key, including its StrKey
 * checksum. A regular expression cannot provide the checksum validation, so
 * this deliberately delegates to the Stellar SDK rather than only checking the
 * `G` prefix and length.
 */
export function IsStellarEd25519PublicKey(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStellarEd25519PublicKey',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'walletAddress must be a valid Stellar Ed25519 public key (G...)',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments): boolean {
          if (typeof value !== 'string') return false;

          try {
            return StrKey.isValidEd25519PublicKey(value);
          } catch {
            // The SDK throws for some malformed values. Validation should
            // report an invalid value rather than turn a bad request into a
            // server error.
            return false;
          }
        },
      },
    });
  };
}
