import { BadRequestException } from '@nestjs/common';
import { CancellationFeeService } from './cancellation-fee.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

describe('CancellationFeeService', () => {
  const shipmentRepo = {
    findOneOrFail: jest.fn(),
    update: jest.fn(),
  };
  const service = new CancellationFeeService(shipmentRepo as never);

  it('calculates the tiered fee by shipment status', () => {
    expect(service.calculateFee(100, ShipmentStatus.PENDING)).toBe(0);
    expect(service.calculateFee(100, ShipmentStatus.ACCEPTED)).toBe(10);
    expect(service.calculateFee(100, ShipmentStatus.IN_TRANSIT)).toBe(25);
  });

  it('rejects unsupported statuses', () => {
    expect(() => service.calculateFee(100, ShipmentStatus.COMPLETED)).toThrow(
      BadRequestException,
    );
  });

  it('marks a cancellable shipment cancelled and stores the fee note', async () => {
    shipmentRepo.findOneOrFail.mockResolvedValue({
      id: 'ship-1',
      price: 200,
      currency: 'USD',
      status: ShipmentStatus.ACCEPTED,
    } as Shipment);

    const result = await service.cancelShipment('ship-1');

    expect(shipmentRepo.update).toHaveBeenCalledWith('ship-1', {
      status: ShipmentStatus.CANCELLED,
      notes: 'Cancellation fee: 20 USD',
    });
    expect(result.status).toBe(ShipmentStatus.CANCELLED);
  });
});
