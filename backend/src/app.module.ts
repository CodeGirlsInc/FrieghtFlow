import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSocketModule } from './websocket/websocket.module';
import { NotificationModule } from './notifications/notifications.module';
import { FreightJobsModule } from './freight-jobs/freight-jobs.module';
import { CarrierModule } from './carriers/carrier.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
        synchronize: true,
      }),
    }),
    WebSocketModule,
    NotificationModule,
    FreightJobsModule,
    CarrierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
