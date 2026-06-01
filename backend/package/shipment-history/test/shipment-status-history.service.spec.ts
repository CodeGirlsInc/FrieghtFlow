import { ShipmentStatusHistoryService } from '../src/shipment-status-history.service';

const mockRepo = {
  create: jest.fn((x) => x),
  save: jest.fn((x) => Promise.resolve({ ...x, id: 'uuid' })),
  find: jest.fn(() => Promise.resolve([{ id: 'uuid', shipmentId: 's1', fromStatus: 'A', toStatus: 'B', createdAt: new Date() }])),
};

describe('ShipmentStatusHistoryService', () => {
  let svc: ShipmentStatusHistoryService;

  beforeEach(() => {
    mockRepo.create.mockClear();
    mockRepo.save.mockClear();
    mockRepo.find.mockClear();
    svc = new ShipmentStatusHistoryService(mockRepo as any);
  });

  it('records a transition', async () => {
    const res = await svc.record('s1', 'Pending', 'InTransit', 'actor1', 'user');
    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(res.id).toBe('uuid');
  });

  it('fetches history', async () => {
    const res = await svc.getHistory('s1');
    expect(mockRepo.find).toHaveBeenCalled();
    expect(res[0].shipmentId).toBe('s1');
  });
});
