'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { reviewsApi } from '../../lib/api/reviews.api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SubmitReviewFormProps {
  shipmentId: string;
  /** Shown in the card title, e.g. "Rate your carrier". */
  title?: string;
}

/**
 * FE-108 — lets a shipper rate a completed shipment's carrier. Surfaced on
 * the shipment detail page once a shipment reaches COMPLETED.
 */
export function SubmitReviewForm({ shipmentId, title = 'Rate this shipment' }: SubmitReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submit(shipmentId, { rating, comment: comment.trim() || undefined });
      toast.success('Thanks for your review!');
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          ✓ Your review has been submitted.
        </CardContent>
      </Card>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            role="radiogroup"
            aria-label="Rating"
            className="flex gap-1 text-2xl"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => setRating(star)}
                className={star <= displayRating ? 'text-yellow-400' : 'text-muted-foreground/30'}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            aria-label="Comment"
            placeholder="Share details about your experience (optional)"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
