import { BadRequestException } from '@nestjs/common';
import {
  CANCELLATION_FEE_TIERS,
  CancellationFeeService,
} from './cancellation-fee.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'ship-1',
    trackingNumber: 'FF-TEST-001',
    shipperId: 'user-1',
    carrierId: null,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    cargoCategory: null,
    weightKg: 100,
    volumeCbm: null,
    price: 200,
    currency: 'USD',
    isInsured: false,
    onChainShipmentId: null,
    insurancePremium: null,
    status: ShipmentStatus.ACCEPTED,
    notes: null,
    cancellationFee: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Shipment;
}

describe('CancellationFeeService', () => {
  const service = new CancellationFeeService();

  describe('calculateFee()', () => {
    it('calculates the tiered fee by shipment status', () => {
      expect(service.calculateFee(100, ShipmentStatus.PENDING)).toBe(0);
      expect(service.calculateFee(100, ShipmentStatus.ACCEPTED)).toBe(10);
      expect(service.calculateFee(100, ShipmentStatus.IN_TRANSIT)).toBe(25);
    });

    it('charges nothing when an admin cancels a disputed shipment', () => {
      expect(service.calculateFee(100, ShipmentStatus.DISPUTED)).toBe(0);
    });

    it('rounds the fee to 2 decimal places', () => {
      // 10% of 199.99
      expect(service.calculateFee(199.99, ShipmentStatus.ACCEPTED)).toBe(20);
      // 25% of 100.10
      expect(service.calculateFee(100.1, ShipmentStatus.IN_TRANSIT)).toBe(
        25.03,
      );
    });

    it('rejects terminal statuses', () => {
      expect(() => service.calculateFee(100, ShipmentStatus.COMPLETED)).toThrow(
        BadRequestException,
      );
      expect(() => service.calculateFee(100, ShipmentStatus.DELIVERED)).toThrow(
        BadRequestException,
      );
      expect(() => service.calculateFee(100, ShipmentStatus.CANCELLED)).toThrow(
        BadRequestException,
      );
    });

    it('exposes the published tiers so callers cannot drift from them', () => {
      expect(CANCELLATION_FEE_TIERS).toEqual({
        [ShipmentStatus.PENDING]: 0,
        [ShipmentStatus.ACCEPTED]: 0.1,
        [ShipmentStatus.IN_TRANSIT]: 0.25,
        [ShipmentStatus.DISPUTED]: 0,
      });
    });
  });

  describe('isCancellable()', () => {
    it('treats PENDING, ACCEPTED and IN_TRANSIT as cancellable', () => {
      expect(service.isCancellable(ShipmentStatus.PENDING)).toBe(true);
      expect(service.isCancellable(ShipmentStatus.ACCEPTED)).toBe(true);
      expect(service.isCancellable(ShipmentStatus.IN_TRANSIT)).toBe(true);
      expect(service.isCancellable(ShipmentStatus.DISPUTED)).toBe(true);
    });

    it('treats terminal statuses as not cancellable', () => {
      expect(service.isCancellable(ShipmentStatus.DELIVERED)).toBe(false);
      expect(service.isCancellable(ShipmentStatus.COMPLETED)).toBe(false);
      expect(service.isCancellable(ShipmentStatus.CANCELLED)).toBe(false);
    });
  });

  describe('isFeeBearingCancellable()', () => {
    it('is true only for the three published fee tiers', () => {
      expect(service.isFeeBearingCancellable(ShipmentStatus.PENDING)).toBe(
        true,
      );
      expect(service.isFeeBearingCancellable(ShipmentStatus.ACCEPTED)).toBe(
        true,
      );
      expect(service.isFeeBearingCancellable(ShipmentStatus.IN_TRANSIT)).toBe(
        true,
      );
      expect(service.isFeeBearingCancellable(ShipmentStatus.DISPUTED)).toBe(
        false,
      );
    });
  });

  describe('applyTo()', () => {
    it('stamps the fee and an audit note onto the shipment', () => {
      const shipment = makeShipment({ status: ShipmentStatus.ACCEPTED });

      const fee = service.applyTo(shipment, ShipmentStatus.ACCEPTED);

      expect(fee).toBe(20);
      expect(shipment.cancellationFee).toBe(20);
      expect(shipment.notes).toBe('Cancellation fee: 20 USD');
    });

    it('defaults to the shipment’s current status', () => {
      const shipment = makeShipment({ status: ShipmentStatus.IN_TRANSIT });

      expect(service.applyTo(shipment)).toBe(50);
      expect(shipment.cancellationFee).toBe(50);
    });

    it('appends to existing notes instead of overwriting them', () => {
      const shipment = makeShipment({
        status: ShipmentStatus.IN_TRANSIT,
        notes: 'Handle with care — fragile electronics',
      });

      service.applyTo(shipment);

      expect(shipment.notes).toBe(
        'Handle with care — fragile electronics\nCancellation fee: 50 USD',
      );
    });

    it('records a zero fee for a cancelled-before-accept shipment', () => {
      const shipment = makeShipment({ status: ShipmentStatus.PENDING });

      expect(service.applyTo(shipment)).toBe(0);
      expect(shipment.cancellationFee).toBe(0);
      expect(shipment.notes).toBe('Cancellation fee: 0 USD');
    });

    it('refuses to apply a fee to a non-cancellable shipment', () => {
      const shipment = makeShipment({ status: ShipmentStatus.DELIVERED });

      expect(() => service.applyTo(shipment)).toThrow(BadRequestException);
      expect(shipment.cancellationFee).toBeNull();
    });

    it('coerces a stringified numeric price (Postgres numeric) safely', () => {
      const shipment = makeShipment({ price: '1000.00' as never });

      expect(service.applyTo(shipment, ShipmentStatus.IN_TRANSIT)).toBe(250);
    });
  });

  describe('describeFee()', () => {
    it('renders the fee with its currency', () => {
      expect(service.describeFee(12.5, 'NGN')).toBe(
        'Cancellation fee: 12.5 NGN',
      );
    });
  });
});
