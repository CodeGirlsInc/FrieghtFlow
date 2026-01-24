// Carrier types and interfaces for the carrier directory

export interface Carrier {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  location: string;
  serviceAreas: string[];
  vehicleTypes: VehicleType[];
  cargoSpecializations: CargoSpecialization[];
  pricePerMile: number;
  deliverySpeed: DeliverySpeed[];
  isVerified: boolean;
  hasInsurance: boolean;
  isAvailableNow: boolean;
  yearsInBusiness: number;
  completedDeliveries: number;
  onTimeRate: number;
  description: string;
  isFavorite?: boolean;
}

export type VehicleType =
  | 'truck'
  | 'van'
  | 'cargo_ship'
  | 'rail'
  | 'air_freight';

export type CargoSpecialization =
  | 'fragile'
  | 'refrigerated'
  | 'hazmat'
  | 'oversized'
  | 'standard';

export type DeliverySpeed =
  | 'same_day'
  | 'next_day'
  | 'standard'
  | 'economy';

export type SortOption =
  | 'rating'
  | 'price_low'
  | 'price_high'
  | 'distance'
  | 'availability';

export type ViewMode = 'grid' | 'list';

export interface CarrierFilters {
  searchQuery: string;
  serviceArea: string;
  vehicleTypes: VehicleType[];
  cargoSpecializations: CargoSpecialization[];
  minRating: number;
  hasInsurance: boolean | null;
  verifiedOnly: boolean;
  availableNow: boolean;
  priceRange: [number, number];
  deliverySpeed: DeliverySpeed[];
}

export const defaultFilters: CarrierFilters = {
  searchQuery: '',
  serviceArea: '',
  vehicleTypes: [],
  cargoSpecializations: [],
  minRating: 0,
  hasInsurance: null,
  verifiedOnly: false,
  availableNow: false,
  priceRange: [0, 10],
  deliverySpeed: [],
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  truck: 'Truck',
  van: 'Van',
  cargo_ship: 'Cargo Ship',
  rail: 'Rail',
  air_freight: 'Air Freight',
};

export const cargoSpecializationLabels: Record<CargoSpecialization, string> = {
  fragile: 'Fragile',
  refrigerated: 'Refrigerated',
  hazmat: 'Hazmat',
  oversized: 'Oversized',
  standard: 'Standard',
};

export const deliverySpeedLabels: Record<DeliverySpeed, string> = {
  same_day: 'Same Day',
  next_day: 'Next Day',
  standard: 'Standard',
  economy: 'Economy',
};

export const sortOptionLabels: Record<SortOption, string> = {
  rating: 'Rating',
  price_low: 'Price: Low to High',
  price_high: 'Price: High to Low',
  distance: 'Distance',
  availability: 'Availability',
};
