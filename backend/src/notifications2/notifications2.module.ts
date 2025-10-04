import { Module } from '@nestjs/common';
import { Notifications2Controller } from './notifications2.controller';
import { Notifications2Service } from './notifications2.service';

@Module({
  controllers: [Notifications2Controller],
  providers: [Notifications2Service]
})
export class Notifications2Module {}
