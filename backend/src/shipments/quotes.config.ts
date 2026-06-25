export const ZONE_BASE_RATES: Record<string, number> = {
  'US-US': 120,
  'US-CA': 150,
  'US-MX': 160,
  'EU-EU': 110,
  'EU-US': 180,
  'AS-AS': 140,
  'AS-EU': 190,
  'AS-US': 220,
};

export const DEFAULT_ZONE_BASE_RATE = 140;
export const RATE_PER_KG = 1.8;

export const CATEGORY_MULTIPLIERS: Record<string, number> = {
  'General Cargo': 1.0,
  Hazardous: 1.5,
  Electronics: 1.3,
  Perishables: 1.4,
  Furniture: 1.1,
  Machinery: 1.2,
  'Textiles': 1.0,
  'Food & Beverage': 1.1,
  Automotive: 1.1,
  'Pharmaceuticals': 1.3,
  'Construction Materials': 1.2,
};
