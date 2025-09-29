export const FREIGHT_QUOTATION_CONSTANTS = {
  DEFAULT_QUOTE_EXPIRY_DAYS: 30,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_WEIGHT: 0.01,
  MIN_DISTANCE: 0.1,
  PRICING_DECIMAL_PLACES: 2,
} as const;

export const CARGO_TYPE_DESCRIPTIONS = {
  general: 'Standard cargo with no special handling requirements',
  hazardous: 'Dangerous goods requiring special handling and documentation',
  fragile: 'Delicate items requiring careful handling and packaging',
  perishable: 'Time-sensitive goods requiring temperature control',
  oversized: 'Large or heavy items requiring special equipment',
  liquid: 'Liquid cargo requiring specialized containers',
} as const;

export const QUOTE_STATUS_DESCRIPTIONS = {
  pending: 'Quote is awaiting review and approval',
  approved: 'Quote has been approved and is ready for booking',
  rejected: 'Quote has been rejected',
  expired: 'Quote has expired and is no longer valid',
} as const;
