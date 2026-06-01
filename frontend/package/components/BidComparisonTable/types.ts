import { User } from "../../../types/auth.types";

export enum BidStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface Bid {
  id: string;
  shipmentId: string;
  carrier: Pick<User, "id" | "firstName" | "lastName" | "email">;
  carrierId: string;
  proposedPrice: number;
  message: string | null;
  status: BidStatus;
  createdAt: string;
}

export interface CarrierRating {
  carrierId: string;
  averageRating: number;
  totalReviews: number;
}

export type SortField = "price" | "rating";
export type SortDirection = "asc" | "desc";

export interface BidComparisonTableProps {
  shipmentId: string;
  bids: Bid[];
  carrierRatings?: CarrierRating[];
  currency?: string;
  onBidAccepted?: (bidId: string) => void;
  onBidRejected?: (bidId: string) => void;
  hasAcceptedBid?: boolean;
}
