import { User } from "@/types/auth.types";
import { ShipmentStatusHistory } from "@/types/shipment.types";

export enum DisputeStatus {
  OPEN = "open",
  UNDER_REVIEW = "under_review",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export interface Dispute {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  evidenceUrls: string[];
  resolutionNotes: string | null;
  resolvedBy: Pick<User, "id" | "firstName" | "lastName"> | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Party information
  shipper: Pick<User, "id" | "firstName" | "lastName" | "email">;
  carrier: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;
  // Shipment details
  origin: string;
  destination: string;
  cargoDescription: string;
  price: number;
  currency: string;
  // Timeline
  timeline: ShipmentStatusHistory[];
}

export interface DisputeListResult {
  data: Dispute[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResolveDisputePayload {
  resolutionNotes: string;
  decision: "completed" | "cancelled";
}
