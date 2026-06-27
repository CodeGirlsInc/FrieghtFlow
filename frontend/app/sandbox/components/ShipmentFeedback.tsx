'use client';

import { useState } from 'react';

interface ShipmentFeedbackProps {
  shipmentId: string;
  carrierId: string;
  onSuccess?: (data: FeedbackData) => void;
}

export interface FeedbackData {
  shipmentId: string;
  carrierId: string;
  ratings: Record<RatingCategory, number>;
  comment: string;
  wouldUseAgain: boolean | null;
}

type RatingCategory = 'overall' | 'communication' | 'timeliness' | 'cargoCondition';

const CATEGORIES: { key: RatingCategory; label: string }[] = [
  { key: 'overall',       label: 'Overall Experience' },
  { key: 'communication', label: 'Communication' },
  { key: 'timeliness',    label: 'Timeliness' },
  { key: 'cargoCondition',label: 'Cargo Condition' },
];

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 text-sm text-gray-700">{label}</span>
      <div className="flex gap-1" role="group" aria-label={`${label} rating`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} star`}
            className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
          >
            <span className={(hovered || value) >= star ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShipmentFeedback({ shipmentId, carrierId, onSuccess }: ShipmentFeedbackProps) {
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    overall: 0, communication: 0, timeliness: 0, cargoCondition: 0,
  });
  const [comment, setComment] = useState('');
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const allRated = Object.values(ratings).every((v) => v > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allRated) return;
    const data: FeedbackData = { shipmentId, carrierId, ratings, comment, wouldUseAgain };
    setSubmitted(true);
    onSuccess?.(data);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-4xl">✅</div>
        <h3 className="mt-3 text-lg font-semibold text-green-800">Thank you for your feedback!</h3>
        <p className="mt-1 text-sm text-green-700">Your review for shipment {shipmentId} has been submitted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">Rate Your Shipment Experience</h2>
      <p className="mb-5 text-sm text-gray-500">Shipment {shipmentId}</p>

      <div className="space-y-4">
        {CATEGORIES.map(({ key, label }) => (
          <StarRating
            key={key}
            label={label}
            value={ratings[key]}
            onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
          />
        ))}
      </div>

      <div className="mt-5">
        <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700">
          Comment <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Share more about your experience..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/500</p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Would you use this carrier again?</p>
        <div className="flex gap-3">
          {([true, false] as const).map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setWouldUseAgain(val)}
              className={[
                'rounded-lg border px-5 py-2 text-sm font-medium transition-colors',
                wouldUseAgain === val
                  ? val ? 'border-green-500 bg-green-100 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
              aria-pressed={wouldUseAgain === val}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!allRated}
        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Submit Feedback
      </button>
    </form>
  );
}
