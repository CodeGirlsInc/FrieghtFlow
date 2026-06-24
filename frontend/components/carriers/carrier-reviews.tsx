'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  data: Review[];
  total: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  page: number;
  totalPages: number;
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <span className={sz} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-muted-foreground/30'}>
          ★
        </span>
      ))}
    </span>
  );
}

interface CarrierReviewsProps {
  carrierId: string;
}

export function CarrierReviews({ carrierId }: CarrierReviewsProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ['carrier-reviews', carrierId, page],
    queryFn: () => apiClient(`/carriers/${carrierId}/reviews?page=${page}&limit=5`),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-muted-foreground">Unable to load reviews.</p>;
  }

  if (data.total === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No reviews yet for this carrier.
        </CardContent>
      </Card>
    );
  }

  const dist = data.distribution ?? ({} as Record<number, number>);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ratings & Reviews</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8 flex-wrap">
          <div className="text-center">
            <p className="text-4xl font-bold">{data.averageRating?.toFixed(1) ?? '—'}</p>
            <Stars rating={data.averageRating ?? 0} size="lg" />
            <p className="text-xs text-muted-foreground mt-1">{data.total} review{data.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 min-w-40 space-y-1">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = dist[star] ?? 0;
              const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-muted-foreground">{star}</span>
                  <span className="text-yellow-400">★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Individual reviews */}
      <div className="space-y-3">
        {data.data.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{review.reviewerName}</p>
                  <Stars rating={review.rating} />
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </time>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {data.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
