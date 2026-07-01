import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as Joi from 'joi';
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
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(6000),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().default(2525),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().default('noreply@freightflow.io'),
        UPLOAD_DIR: Joi.string().default('./uploads'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    ThrottlerModule.forRoot({
      errorMessage: throttlerErrorMessage,
      throttlers: [
        {
          name: 'default',
          ttl: 60_000, // 1 minute window
          limit: 60, // 60 requests per minute (general)
        },
        {
          name: 'auth',
          ttl: 60_000, // 1 minute window
          limit: 10, // 10 requests per minute (auth routes)
        },
        {
          name: 'shipmentCreate',
          ttl: 60_000,
          limit: 10,
          getTracker: (_request, context) => shipmentCreateTracker(context),
        },
      ],
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
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
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
export class AppModule {}
