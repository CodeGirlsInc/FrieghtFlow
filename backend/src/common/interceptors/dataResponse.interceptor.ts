import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const resultsCount = Array.isArray(data)
          ? data.length
          : Array.isArray(data?.data)
            ? data.data.length
            : 0;

        return {
          apiVersion: this.configService.get('API_VERSION'),
          data: data,
          results: resultsCount,
        };
      }),
    );
  }
}
