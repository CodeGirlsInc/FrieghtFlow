'use client';
// #991 – Submit carrier review with star rating and comment
import { useState } from 'react';
import { apiClient } from '../../lib/api/client';

interface Props { carrierId: string; shipmentId: string; onSubmitted?: () => void; }

export function ReviewForm({ carrierId, shipmentId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await apiClient('/reviews', { method: 'POST', body: JSON.stringify({ carrierId, shipmentId, rating, comment }) });
      onSubmitted?.();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-3 rounded border p-4">
      <p className="font-medium text-sm">Rate this carrier</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button" onClick={() => setRating(s)}
            className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment (optional)" rows={3}
        className="w-full rounded border px-3 py-2 text-sm resize-none"/>
      <button onClick={submit} disabled={!rating || submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}
