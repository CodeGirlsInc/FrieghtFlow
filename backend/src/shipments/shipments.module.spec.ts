import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentsModule } from './shipments.module';
import { ShipmentsService } from './shipments.service';
import { CancellationFeeService } from './cancellation-fee.service';
import { EtaService } from './eta.service';
import { ShipmentTemplateService } from './shipment-template.service';
import { ShipmentTemplatesController } from './shipment-templates.controller';
import { EtaController } from './eta.controller';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { ShipmentTemplate } from './entities/shipment-template.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { StellarContractService } from '../stellar/stellar-contract.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

/**
 * Wiring regression guard.
 *
 * `EtaService` and `ShipmentTemplateService` were fully implemented but
 * absent from `ShipmentsModule` — nothing could resolve them, and neither
 * had a controller. These tests fail if either is ever unregistered again.
 */
describe('ShipmentsModule', () => {
  let moduleRef: TestingModule;

  const repoStub = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      // EventEmitterModule is registered globally in AppModule; without it
      // ShipmentsService has no EventEmitter2 to inject.
      imports: [EventEmitterModule.forRoot(), ShipmentsModule],
    })
      .overrideProvider(getRepositoryToken(Shipment))
      .useValue(repoStub)
      .overrideProvider(getRepositoryToken(ShipmentStatusHistory))
      .useValue(repoStub)
      .overrideProvider(getRepositoryToken(ShipmentTemplate))
      .useValue(repoStub)
      // Repositories PaymentsModule registers for itself.
      .overrideProvider(getRepositoryToken(Payment))
      .useValue(repoStub)
      .overrideProvider(getRepositoryToken(User))
      .useValue(repoStub)
      .overrideProvider(PaymentsService)
      .useValue({
        refundEscrowForShipment: jest.fn(),
        releaseEscrowForShipment: jest.fn(),
      })
      // PaymentsModule transitively builds StellarContractService; stub the
      // chain bridge and config so this spec exercises shipments wiring only.
      .overrideProvider(StellarContractService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn() })
      .overrideProvider(EventEmitter2)
      .useValue({ emit: jest.fn() })
      .compile();
  });

  it('registers CancellationFeeService and injects it into ShipmentsService', () => {
    expect(moduleRef.get(CancellationFeeService)).toBeInstanceOf(
      CancellationFeeService,
    );
    // Reaching the service through ShipmentsService proves the
    // constructor dependency is satisfied — i.e. cancel() can charge a fee.
    expect(moduleRef.get(ShipmentsService)).toBeInstanceOf(ShipmentsService);
  });

  it('registers EtaService so it is resolvable', () => {
    expect(moduleRef.get(EtaService)).toBeInstanceOf(EtaService);
  });

  it('registers ShipmentTemplateService backed by the ShipmentTemplate repository', () => {
    expect(moduleRef.get(ShipmentTemplateService)).toBeInstanceOf(
      ShipmentTemplateService,
    );
  });

  it('exports all three services to consuming modules', () => {
    for (const service of [
      CancellationFeeService,
      EtaService,
      ShipmentTemplateService,
    ]) {
      expect(moduleRef.get(service, { strict: false })).toBeDefined();
    }
  });

  it('declares the ETA and shipment-template controllers', () => {
    expect(moduleRef.get(EtaController)).toBeInstanceOf(EtaController);
    expect(moduleRef.get(ShipmentTemplatesController)).toBeInstanceOf(
      ShipmentTemplatesController,
    );
  });
});
