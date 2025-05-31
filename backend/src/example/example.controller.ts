import { Controller, Get, Req } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller('example')
export class ExampleController {
  constructor(private readonly logger: PinoLogger) {}

  @Get()
  handle(@Req() req) {
    this.logger.info({ user: req.user }, 'Handling request');
    return 'Hello';
  }
}
