import { Bid, CarrierRating, SortField, SortDirection } from "./types";

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return date.toLocaleDateString();
}

/**
 * Get carrier rating by carrierId
 */
export function getCarrierRating(
  carrierId: string,
  ratings: CarrierRating[] = [],
): CarrierRating {
  return (
    ratings.find((r) => r.carrierId === carrierId) || {
      carrierId,
      averageRating: 0,
      totalReviews: 0,
    }
  );
}

/**
 * Sort bids by field and direction
 */
export function sortBids(
  bids: Bid[],
  field: SortField,
  direction: SortDirection,
  carrierRatings: CarrierRating[] = [],
): Bid[] {
  return [...bids].sort((a, b) => {
    let comparison = 0;

    if (field === "price") {
      comparison = a.proposedPrice - b.proposedPrice;
    } else if (field === "rating") {
      const ratingA = getCarrierRating(
        a.carrierId,
        carrierRatings,
      ).averageRating;
      const ratingB = getCarrierRating(
        b.carrierId,
        carrierRatings,
      ).averageRating;
      comparison = ratingA - ratingB;
    }

    return direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Check if any bid has been accepted
 */
export function hasAcceptedBid(bids: Bid[]): boolean {
  return bids.some((bid) => bid.status === "ACCEPTED");
}

/**
 * Check if actions should be disabled (any bid accepted)
 */
export function areActionsDisabled(bids: Bid[]): boolean {
  return hasAcceptedBid(bids);
}
