import { ShipmentStatus } from "../../../types/shipment.types";

export interface ShipmentFilters {
  search?: string;
  status?: ShipmentStatus[];
  dateFrom?: string;
  dateTo?: string;
  originCountry?: string;
}

export const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: ShipmentStatus.PENDING, label: "Pending" },
  { value: ShipmentStatus.ACCEPTED, label: "Accepted" },
  { value: ShipmentStatus.IN_TRANSIT, label: "In Transit" },
  { value: ShipmentStatus.DELIVERED, label: "Delivered" },
  { value: ShipmentStatus.COMPLETED, label: "Completed" },
  { value: ShipmentStatus.CANCELLED, label: "Cancelled" },
  { value: ShipmentStatus.DISPUTED, label: "Disputed" },
];

export const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "NG", label: "Nigeria" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "MX", label: "Mexico" },
  { value: "ZA", label: "South Africa" },
  { value: "KE", label: "Kenya" },
  { value: "GH", label: "Ghana" },
  { value: "EG", label: "Egypt" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
];
