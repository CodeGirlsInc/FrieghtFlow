import { Module } from '@nestjs/common';
import { CurrencyConversionModule } from './currency-conversion.module';

@Module({
  imports: [CurrencyConversionModule],
})
export class AppModule {}
