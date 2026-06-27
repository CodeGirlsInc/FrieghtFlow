import { CarrierSearchService } from '../carrier-search.service';
import { CarrierSearchDto } from '../dto/carrier-search.dto';

describe('CarrierSearchService', () => {
  let service: CarrierSearchService;

  beforeEach(() => {
    service = new CarrierSearchService();
  });

  function dto(overrides: Partial<CarrierSearchDto> = {}): CarrierSearchDto {
    return Object.assign(new CarrierSearchDto(), { page: 1, limit: 20 }, overrides);
  }

  it('returns all carriers with no filters', () => {
    const result = service.search(dto());
    expect(result.total).toBeGreaterThan(0);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('filters by minRating', () => {
    const result = service.search(dto({ minRating: 4 }));
    expect(result.data.every((c) => c.rating >= 4)).toBe(true);
  });

  it('filters by availability — available carriers only', () => {
    const result = service.search(dto({ available: true }));
    expect(result.data.every((c) => c.available === true)).toBe(true);
  });

  it('filters by availability — unavailable carriers only', () => {
    const result = service.search(dto({ available: false }));
    expect(result.data.every((c) => c.available === false)).toBe(true);
  });

  it('returns empty results when no carrier matches the filter', () => {
    const result = service.search(dto({ minRating: 5 }));
    expect(result.data.length).toBe(0);
    expect(result.total).toBe(0);
  });

  it('filters by origin (case-insensitive)', () => {
    const result = service.search(dto({ origin: 'lagos' }));
    expect(result.data.length).toBeGreaterThan(0);
    result.data.forEach((c) =>
      expect(c.routes.some((r) => r.origin.toLowerCase().includes('lagos'))).toBe(true),
    );
  });

  it('filters by vehicleType', () => {
    const result = service.search(dto({ vehicleType: 'van' }));
    expect(result.data.every((c) => c.vehicleTypes.some((v) => v.includes('van')))).toBe(true);
  });

  it('sorts by completedShipments descending', () => {
    const result = service.search(dto({ sortBy: 'completedShipments' }));
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i - 1].completedShipments).toBeGreaterThanOrEqual(result.data[i].completedShipments);
    }
  });

  it('default sort is rating descending', () => {
    const result = service.search(dto());
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i - 1].rating).toBeGreaterThanOrEqual(result.data[i].rating);
    }
  });

  it('paginates correctly', () => {
    const page1 = service.search(dto({ page: 1, limit: 3 }));
    const page2 = service.search(dto({ page: 2, limit: 3 }));
    expect(page1.data.length).toBe(3);
    expect(page1.data[0].id).not.toBe(page2.data[0]?.id);
  });
});
