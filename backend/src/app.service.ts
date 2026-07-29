import { Injectable } from '@nestjs/common';
// This service provides the main functionality for the application.
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
