import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ShipmentTemplateService } from './shipment-template.service';

describe('ShipmentTemplateService', () => {
  let service: ShipmentTemplateService;

  beforeEach(() => {
    service = new ShipmentTemplateService();
  });

  it('creates and applies templates for the owning user', () => {
    const template = service.create({
      userId: 'user-1',
      name: 'Weekly Lagos route',
      origin: 'Lagos',
      destination: 'Abuja',
      cargoDescription: 'Electronics',
      weightKg: 100,
      price: 5000,
      currency: 'USD',
    });

    expect(service.findAll('user-1')).toEqual([template]);
    expect(service.buildShipmentFromTemplate(template.id, 'user-1')).toEqual({
      origin: 'Lagos',
      destination: 'Abuja',
      cargoDescription: 'Electronics',
      weightKg: 100,
      price: 5000,
      currency: 'USD',
    });
  });

  it('rejects cross-user access', () => {
    const template = service.create({
      userId: 'user-1',
      name: 'Weekly Lagos route',
      origin: 'Lagos',
      destination: 'Abuja',
      cargoDescription: 'Electronics',
      weightKg: 100,
      price: 5000,
      currency: 'USD',
    });

    expect(() => service.findOne(template.id, 'user-2')).toThrow(
      ForbiddenException,
    );
    expect(() => service.findOne('missing', 'user-1')).toThrow(
      NotFoundException,
    );
  });
});
