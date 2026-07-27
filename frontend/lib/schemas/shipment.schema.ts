import { z } from 'zod';

export const CARGO_CATEGORIES = [
  'Electronics',
  'Perishables',
  'Hazardous',
  'Furniture',
  'Machinery',
  'Textiles',
  'Food & Beverage',
  'Automotive',
  'Pharmaceuticals',
  'Construction Materials',
  'General Cargo',
] as const;

export const shipmentRouteSchema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
});

export const shipmentCargoSchema = z.object({
  cargoDescription: z.string().min(10, 'Describe the cargo (min 10 chars)'),
  cargoCategory: z.enum(CARGO_CATEGORIES, 'Select a cargo category'),
  weightKg: z.coerce.number().positive('Weight must be positive'),
  volumeCbm: z.coerce.number().positive().optional().or(z.literal('')),
});

export const shipmentPricingSchema = z.object({
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().length(3, 'Must be 3 characters').default('USD'),
  pickupDate: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
});

export const shipmentNotesSchema = z.object({
  notes: z.string().max(2000).optional(),
});

export const createShipmentSchema = shipmentRouteSchema
  .merge(shipmentCargoSchema)
  .merge(shipmentPricingSchema)
  .merge(shipmentNotesSchema);

export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;
