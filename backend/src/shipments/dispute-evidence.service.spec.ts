import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DisputeEvidenceService } from './dispute-evidence.service';

describe('DisputeEvidenceService', () => {
  let service: DisputeEvidenceService;

  beforeEach(() => {
    service = new DisputeEvidenceService();
    jest.spyOn(service as never, 'getShipment').mockReturnValue({
      id: 'ship-1',
      status: 'DISPUTED',
      senderId: 'shipper-1',
      carrierId: 'carrier-1',
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores evidence for parties to a disputed shipment', () => {
    const record = service.submit('ship-1', 'shipper-1', {
      fileUrl: 'https://example.com/evidence.pdf',
      description: 'Damage photos',
    });

    expect(record.shipmentId).toBe('ship-1');
    expect(record.submittedBy).toBe('shipper-1');
  });

  it('rejects users who are not parties to the shipment', () => {
    expect(() =>
      service.submit('ship-1', 'outsider', {
        fileUrl: 'https://example.com/evidence.pdf',
        description: 'Damage photos',
      }),
    ).toThrow(ForbiddenException);
  });

  it('returns evidence history for parties and admins', () => {
    service.submit('ship-1', 'shipper-1', {
      fileUrl: 'https://example.com/evidence.pdf',
      description: 'Damage photos',
    });

    expect(service.findAll('ship-1', 'carrier-1', false)).toHaveLength(1);
    expect(service.findAll('ship-1', 'admin', true)).toHaveLength(1);
  });

  it('propagates missing shipment lookups', () => {
    jest.spyOn(service as never, 'getShipment').mockImplementation(() => {
      throw new NotFoundException('Shipment ship-1 not found');
    });

    expect(() => service.findAll('ship-1', 'carrier-1', false)).toThrow(
      NotFoundException,
    );
  });
});
