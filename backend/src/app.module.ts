import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './logging/logging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InAppModule } from './in-app-/in-app-.module';
import { InAppNotificationModule } from './in-app-notification/in-app-notification.module';

@Module({
  imports: [NotificationsModule, NotificationModule, InAppModule, InAppNotificationModule, LocationModule],
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import environmentValidation from './environment.validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DataResponseInterceptor } from './common/interceptors/dataResponse.interceptor';
import { PaginationModule } from './common/pagination/pagination.module';
import jwtConfig from './auth/config/jwtConfig';
import { JwtAuthGuard } from './auth/guards/jwtAuth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PassportModule } from '@nestjs/passport';
import { LocationModule } from './location/location.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      validationSchema: environmentValidation,
      load: [jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: configService.get('DATABASE_AUTOLOAD'),
        synchronize: configService.get('DATABASE_SYNC'),
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: +configService.get('THROTTLER_TTL'), // milliseconds - 1 minute
          limit: +configService.get('THROTTLER_LIMIT'), // request per ip
        },
      ],
    }),
    UsersModule,
    MailModule,
    LoggingModule,
    PaginationModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
