import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyConversionService } from '../src/currency-conversion.service';
import { BadRequestException } from '@nestjs/common';

describe('CurrencyConversionService', () => {
  let service: CurrencyConversionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyConversionService],
    }).compile();

    service = module.get<CurrencyConversionService>(CurrencyConversionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert correctly', () => {
    expect(service.convert(100, 'USD', 'EUR')).toBe(93);
  });

  it('should handle same currency conversion', () => {
    expect(service.convert(100, 'USD', 'USD')).toBe(100);
  });

  it('should throw an error for unsupported fromCurrency', () => {
    expect(() => service.convert(100, 'ABC', 'USD')).toThrow(
      new BadRequestException('Unsupported currency: ABC'),
    );
  });

  it('should throw an error for unsupported toCurrency', () => {
    expect(() => service.convert(100, 'USD', 'XYZ')).toThrow(
      new BadRequestException('Unsupported currency: XYZ'),
    );
  });

  it('should return the correct rates', () => {
    const rates = service.getRates();
    expect(rates).toEqual({
      USD: 1,
      EUR: 0.93,
      GBP: 0.79,
      NGN: 1481.58,
      KES: 128.5,
      ZAR: 18.24,
    });
  });
});
