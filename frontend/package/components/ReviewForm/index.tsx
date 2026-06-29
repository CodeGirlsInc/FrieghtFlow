'use client';

import React, { useState } from 'react';

interface ReviewFormProps {
  shipmentId: string;
  carrierId: string;
  onSubmit: (review: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-colors focus:outline-none"
        >
          <span
            className={
              star <= (hovered || value)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({
  shipmentId: _shipmentId,
  carrierId: _carrierId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Rate your delivery experience
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Rating
        </label>
        <StarRating value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Comment{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Share details about your experience..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/500
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
