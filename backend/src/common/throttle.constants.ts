export const THROTTLE_LIMITS = {
  default: { ttl: 60_000, limit: 60 },
  auth: { ttl: 60_000, limit: 5 },
  passwordReset: { ttl: 900_000, limit: 3 },
  shipmentCreate: { ttl: 60_000, limit: 10 },
  documentUpload: { ttl: 3_600_000, limit: 10 },
  bidSubmission: { ttl: 3_600_000, limit: 20 },
  messageSend: { ttl: 60_000, limit: 30 },
  csvExport: { ttl: 3_600_000, limit: 5 },
  escrow: { ttl: 3_600_000, limit: 10 },
  admin: { ttl: 60_000, limit: 60 },
} as const;
