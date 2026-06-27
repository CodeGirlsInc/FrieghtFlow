import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentExportService } from './shipment-export.service';
import { Response } from 'express';

const mockShipments = [
  {
    trackingNumber: 'TRK-001',
    origin: 'New York',
    destination: 'London',
    status: 'DELIVERED',
    cargoCategory: 'GENERAL',
    price: 1200.5,
    currency: 'USD',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    actualDeliveryDate: new Date('2024-01-10T15:00:00Z'),
    shipperId: 'user-1',
  },
  {
    trackingNumber: 'TRK-002',
    origin: 'Berlin',
    destination: 'Tokyo',
    status: 'IN_TRANSIT',
    cargoCategory: null,
    price: null,
    currency: 'EUR',
    createdAt: new Date('2024-02-01T10:00:00Z'),
    actualDeliveryDate: null,
    shipperId: 'user-1',
  },
];

function mockResponse() {
  const chunks: string[] = [];
  return {
    res: {
      setHeader: jest.fn(),
      write: jest.fn((chunk: string) => { chunks.push(chunk); }),
      end: jest.fn(),
    } as unknown as Response,
    getBody: () => chunks.join(''),
  };
}

const mockRepo = () => ({
  find: jest.fn(),
});

describe('ShipmentExportService', () => {
  let service: ShipmentExportService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentExportService,
        { provide: getRepositoryToken('Shipment'), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(ShipmentExportService);
    repo = module.get(getRepositoryToken('Shipment'));
  });

  it('streams CSV headers and rows', async () => {
    repo.find.mockResolvedValue(mockShipments);
    const { res, getBody } = mockResponse();

    await service.streamCsv(res, 'user-1', false, {});

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=shipments.csv');

    const body = getBody();
    expect(body).toContain('Tracking Number,Origin,Destination,Status');
    expect(body).toContain('TRK-001');
    expect(body).toContain('TRK-002');
    expect(res.end).toHaveBeenCalled();
  });

  it('returns empty CSV with headers when no shipments found', async () => {
    repo.find.mockResolvedValue([]);
    const { res, getBody } = mockResponse();

    await service.streamCsv(res, 'user-1', false, {});

    const body = getBody();
    const lines = body.trim().split('\n');
    expect(lines).toHaveLength(1); // header only
    expect(lines[0]).toContain('Tracking Number');
    expect(res.end).toHaveBeenCalled();
  });

  it('passes shipperId filter for non-admin users', async () => {
    repo.find.mockResolvedValue([]);
    const { res } = mockResponse();

    await service.streamCsv(res, 'user-1', false, {});

    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ shipperId: 'user-1' }) }),
    );
  });

  it('omits shipperId filter for admin users', async () => {
    repo.find.mockResolvedValue([]);
    const { res } = mockResponse();

    await service.streamCsv(res, 'admin-1', true, {});

    const callArg = repo.find.mock.calls[0][0] as { where: Record<string, unknown> };
    expect(callArg.where).not.toHaveProperty('shipperId');
  });
});
