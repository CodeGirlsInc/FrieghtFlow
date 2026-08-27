import { BadRequestException } from '@nestjs/common';
import { EtaService } from './eta.service';

describe('EtaService', () => {
  const service = new EtaService();

  it('calculates ETA based on route and cargo weight', () => {
    const result = service.estimate({
      origin: 'Lagos, Nigeria',
      destination: 'Abuja, Nigeria',
      weightKg: 120,
    });

    expect(result.estimatedTransitDays).toBeGreaterThan(0);
    expect(result.estimatedDeliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('rejects invalid shipment inputs', () => {
    expect(() =>
      service.estimate({ origin: '', destination: 'Abuja', weightKg: 0 }),
    ).toThrow(BadRequestException);
  });
});
