import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CurrencyConversionService {
  private exchangeRates: { [key: string]: number };

  constructor() {
    const ratesPath = path.join(__dirname, '..', 'rates.json');
    this.exchangeRates = JSON.parse(fs.readFileSync(ratesPath, 'utf8')) as {
      [key: string]: number;
    };
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (!this.exchangeRates[fromCurrency]) {
      throw new BadRequestException(`Unsupported currency: ${fromCurrency}`);
    }
    if (!this.exchangeRates[toCurrency]) {
      throw new BadRequestException(`Unsupported currency: ${toCurrency}`);
    }

    if (fromCurrency === toCurrency) {
      return amount;
    }

    const amountInUSD = amount / this.exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * this.exchangeRates[toCurrency];

    return Math.round(convertedAmount * 100) / 100;
  }

  getRates() {
    return this.exchangeRates;
  }
}
