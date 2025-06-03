export interface ShipperStats {
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  rating: number
  isAvailable: boolean
}

export interface ShipmentPagination {
  shipments: any[]
  total: number
  totalPages: number
}

export interface VerificationResponse {
  message: string
}
