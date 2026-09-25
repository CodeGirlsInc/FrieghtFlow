import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { ShipmentTemplatesController } from './shipment-templates.controller';
import { EtaController } from './eta.controller';
import { CancellationFeeService } from './cancellation-fee.service';
import { EtaService } from './eta.service';
import { ShipmentTemplateService } from './shipment-template.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { ShipmentTemplate } from './entities/shipment-template.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipment,
      ShipmentStatusHistory,
      ShipmentTemplate,
    ]),
    PaymentsModule,
  ],
  controllers: [
    // Order matters: `ShipmentsController` declares `GET /shipments/:id`
    // with a UUID pipe, so the more specific `shipments/templates/*`
    // routes must be registered first to avoid being swallowed by it.
    ShipmentTemplatesController,
    EtaController,
    ShipmentsController,
  ],
  providers: [
    ShipmentsService,
    CancellationFeeService,
    EtaService,
    ShipmentTemplateService,
  ],
  exports: [
    ShipmentsService,
    CancellationFeeService,
    EtaService,
    ShipmentTemplateService,
  ],
})
export class ShipmentsModule {}
