import { apiClient } from './client';

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  page: number;
  totalPages: number;
}

export interface SubmitReviewPayload {
  rating: number; // 1-5
  comment?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) q.set(key, String(value));
  });
  const str = q.toString();
  return str ? `?${str}` : '';
}

export const reviewsApi = {
  /** Paginated reviews for a given carrier. */
  listByCarrier(
    carrierId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<ReviewsResponse> {
    return apiClient(`/carriers/${carrierId}/reviews${buildQuery(params)}`);
  },

  /**
   * Submits a review for a completed shipment. One review per
   * (shipment, reviewer) — a duplicate submission is rejected server-side.
   */
  submit(shipmentId: string, payload: SubmitReviewPayload): Promise<void> {
    return apiClient(`/shipments/${shipmentId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Average rating for a carrier/user. */
  getAverageRating(userId: string): Promise<{ averageRating: number; totalReviews: number }> {
    return apiClient(`/users/${userId}/rating`);
  },
};
