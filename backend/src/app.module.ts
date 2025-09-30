import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerModule } from './partner/partner.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ShipmentModule } from './shipment/shipment.module';
import { InsuranceModule } from './insurance/insurance.module';
import { CustomsComplianceModule } from './customs/customs-complaince.module';
import { SustainabilityModule } from './sustainability/sustainability.module';
import { EmissionModule } from './emission/emission.module';

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
    PartnerModule,
    InvoiceModule,
    ShipmentModule,
    InsuranceModule,
    CustomsComplianceModule,
    SustainabilityModule,
    EmissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
