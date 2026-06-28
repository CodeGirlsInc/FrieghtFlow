import { Module } from '@nestjs/common';
import { CurrencyConversionController } from './currency-conversion.controller';
import { CurrencyConversionService } from './currency-conversion.service';

@Module({
  controllers: [CurrencyConversionController],
  providers: [CurrencyConversionService],
})
export class CurrencyConversionModule {}
