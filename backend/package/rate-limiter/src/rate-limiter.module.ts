import { DynamicModule, Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({})
export class RateLimiterModule implements NestModule {
  static forRoot(options?: { windowMs?: number; max?: number }) {
    return {
      module: RateLimiterModule,
      providers: [{ provide: 'RATE_LIMIT_OPTIONS', useValue: options ?? {} }],
      exports: ['RATE_LIMIT_OPTIONS'],
    } as DynamicModule;
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
