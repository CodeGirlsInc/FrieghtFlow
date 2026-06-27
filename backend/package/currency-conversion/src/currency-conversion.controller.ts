import { Controller, Get } from '@nestjs/common';
import { CurrencyConversionService } from './currency-conversion.service';

@Controller('api/currencies')
export class CurrencyConversionController {
  constructor(
    private readonly currencyConversionService: CurrencyConversionService,
  ) {}

  @Get()
  getRates() {
    return this.currencyConversionService.getRates();
  }
}
