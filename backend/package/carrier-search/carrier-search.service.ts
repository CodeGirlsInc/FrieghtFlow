import { Injectable } from '@nestjs/common';
import { CarrierSearchDto } from './dto/carrier-search.dto';
import { PaginatedResponseDto } from '../../src/package/pagination/dto/paginated-response.dto';

export interface CarrierResult {
  id: string;
  name: string;
  rating: number;
  completedShipments: number;
  vehicleTypes: string[];
  available: boolean;
  routes: { origin: string; destination: string }[];
}

const MOCK_CARRIERS: CarrierResult[] = [
  { id: 'c1', name: 'SwiftHaul Logistics',   rating: 4.8, completedShipments: 1820, vehicleTypes: ['truck', 'van'],         available: true,  routes: [{ origin: 'Lagos', destination: 'Abuja' }, { origin: 'Kano', destination: 'Lagos' }] },
  { id: 'c2', name: 'Eagle Freight Co.',      rating: 4.2, completedShipments: 540,  vehicleTypes: ['truck'],               available: true,  routes: [{ origin: 'Ibadan', destination: 'Kano' }] },
  { id: 'c3', name: 'Meridian Cargo',         rating: 3.9, completedShipments: 300,  vehicleTypes: ['van', 'motorcycle'],   available: false, routes: [{ origin: 'Lagos', destination: 'Port Harcourt' }] },
  { id: 'c4', name: 'Atlas Express',          rating: 4.5, completedShipments: 980,  vehicleTypes: ['truck', 'flatbed'],    available: true,  routes: [{ origin: 'Abuja', destination: 'Enugu' }] },
  { id: 'c5', name: 'Horizon Shipping',       rating: 4.6, completedShipments: 1200, vehicleTypes: ['truck'],               available: true,  routes: [{ origin: 'Kano', destination: 'Abuja' }] },
  { id: 'c6', name: 'Apex Freight',           rating: 2.8, completedShipments: 90,   vehicleTypes: ['van'],                 available: true,  routes: [{ origin: 'Benin City', destination: 'Lagos' }] },
  { id: 'c7', name: 'Delta Carriers',         rating: 4.1, completedShipments: 430,  vehicleTypes: ['refrigerated truck'], available: false, routes: [{ origin: 'Lagos', destination: 'Kano' }] },
  { id: 'c8', name: 'Coastal Haul',           rating: 3.5, completedShipments: 210,  vehicleTypes: ['flatbed', 'truck'],    available: true,  routes: [{ origin: 'Calabar', destination: 'Abuja' }] },
];

@Injectable()
export class CarrierSearchService {
  search(query: CarrierSearchDto): PaginatedResponseDto<CarrierResult> {
    let results = [...MOCK_CARRIERS];

    if (query.origin) {
      const origin = query.origin.toLowerCase();
      results = results.filter((c) =>
        c.routes.some((r) => r.origin.toLowerCase().includes(origin)),
      );
    }

    if (query.destination) {
      const dest = query.destination.toLowerCase();
      results = results.filter((c) =>
        c.routes.some((r) => r.destination.toLowerCase().includes(dest)),
      );
    }

    if (query.minRating !== undefined) {
      results = results.filter((c) => c.rating >= query.minRating!);
    }

    if (query.vehicleType) {
      const vt = query.vehicleType.toLowerCase();
      results = results.filter((c) =>
        c.vehicleTypes.some((v) => v.toLowerCase().includes(vt)),
      );
    }

    if (query.available !== undefined) {
      results = results.filter((c) => c.available === query.available);
    }

    const sortBy = query.sortBy ?? 'rating';
    results.sort((a, b) => b[sortBy] - a[sortBy]);

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const total = results.length;
    const data = results.slice((page - 1) * limit, page * limit);

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
