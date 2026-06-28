import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthModule } from './health/health.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { DocumentsModule } from './documents/documents.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AddressesModule } from './addresses/addresses.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { BidsModule } from './bids/bids.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { AdminAuditInterceptor } from './audit-log/admin-audit.interceptor';
import { CarriersModule } from './carriers/carriers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RouteCalculatorModule } from './route-calculator/route-calculator.module';
import { AppMailerModule } from './mailer/mailer.module';
import { AvatarUploadModule } from './avatar-upload/avatar-upload.module';
import { EnvValidationModule } from '../../package/env-validation/env-validation.module';
import { DisputesModule } from './disputes/disputes.module';
import { CertificationReviewModule } from './certification-review/certification-review.module';
import { BulkShipmentsModule } from './bulk-shipments/bulk-shipments.module';
import { MarketplaceSearchModule } from './marketplace-search/marketplace-search.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { RequestLoggerModule } from './request-logger/request-logger.module';
import { DocumentPipelineModule } from './document-pipeline/document-pipeline.module';
import { StellarEscrowModule } from './stellar-escrow/stellar-escrow.module';
import { ReputationCalculatorModule } from './reputation-calculator/reputation-calculator.module';
import { LocationUpdatesModule } from './location-updates/location-updates.module';
import { ETAModule } from './eta/eta.module';
import { BidExpiryModule } from './bid-expiry/bid-expiry.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queue/queue.module';
import { TasksModule } from './tasks/tasks.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

const shipmentCreateTracker = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    ip?: string;
    user?: { id?: string };
  }>();

  return request.user?.id ?? request.ip ?? 'anonymous';
};

const throttlerErrorMessage = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{
    method?: string;
    originalUrl?: string;
    url?: string;
  }>();

  const requestPath = request.originalUrl ?? request.url ?? '';

  if (request.method === 'POST' && requestPath.includes('/shipments')) {
    return 'Shipment creation rate limit exceeded. Authenticated users can create up to 10 shipments per minute.';
  }

  return 'Too Many Requests';
};

@Module({
  imports: [
    EnvValidationModule,
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      errorMessage: throttlerErrorMessage,
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          limit: 60,
        },
        {
          name: 'auth',
          ttl: 60_000,
          limit: 10,
        },
        {
          name: 'shipmentCreate',
          ttl: 60_000,
          limit: 10,
          getTracker: (_request, context) => shipmentCreateTracker(context),
        },
      ],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get('DATABASE_NAME'),
        password: configService.get('DATABASE_PASSWORD'),
        username: configService.get('DATABASE_USERNAME'),
        port: +configService.get('DATABASE_PORT'),
        host: configService.get('DATABASE_HOST'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    PrometheusModule.register(),
    HealthModule,
    AppMailerModule,
    UsersModule,
    AuthModule,
    ShipmentsModule,
    NotificationsModule,
    AdminModule,
    DocumentsModule,
    WebhooksModule,
    AddressesModule,
    AuditLogModule,
    BidsModule,
    NotificationPreferencesModule,
    CarriersModule,
    ReviewsModule,
    CloudinaryModule,
    RouteCalculatorModule,
    AvatarUploadModule,
    DisputesModule,
    CertificationReviewModule,
    BulkShipmentsModule,
    MarketplaceSearchModule,
    OnboardingModule,
    RequestLoggerModule,
    DocumentPipelineModule,
    StellarEscrowModule,
    ReputationCalculatorModule,
    LocationUpdatesModule,
    ETAModule,
    BidExpiryModule,
    QueueModule,
    TasksModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminAuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
