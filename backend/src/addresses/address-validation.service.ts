import { Injectable, BadRequestException } from '@nestjs/common';

const ISO_3166_ALPHA_2 = /^[A-Z]{2}$/;

const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  NG: /^\d{6}$/,
  US: /^\d{5}(-\d{4})?$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
};

@Injectable()
export class AddressValidationService {
  validate(street: string, city: string, country: string, postalCode?: string): void {
    const errors: Record<string, string> = {};

    if (!street?.trim()) errors.street = 'Street is required';
    if (!city?.trim()) errors.city = 'City is required';
    if (!country?.trim() || !ISO_3166_ALPHA_2.test(country)) {
      errors.country = 'Country must be a valid ISO 3166-1 alpha-2 code (e.g., NG, US, GB)';
    }

    if (postalCode && country && POSTAL_CODE_PATTERNS[country]) {
      if (!POSTAL_CODE_PATTERNS[country].test(postalCode)) {
        errors.postalCode = `Postal code does not match format for ${country}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: 'Address validation failed', errors });
    }
  }
}
