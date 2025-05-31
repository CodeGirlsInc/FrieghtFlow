import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ExampleService {
  constructor(private readonly logger: PinoLogger) {}

  doSomething() {
    this.logger.info('Something happened');
  }
}
