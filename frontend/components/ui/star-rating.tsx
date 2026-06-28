'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  label?: string;
  readOnly?: boolean;
  id?: string;
}

export function StarRating({
  value = 0,
  onChange,
  label = 'Rating',
  readOnly = false,
  id = 'star-rating',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, star: number) => {
    if (readOnly) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(star + 1, 5);
      onChange?.(next);
      (groupRef.current?.querySelectorAll('[role="radio"]')[next - 1] as HTMLElement)?.focus();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(star - 1, 1);
      onChange?.(prev);
      (groupRef.current?.querySelectorAll('[role="radio"]')[prev - 1] as HTMLElement)?.focus();
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(star);
    }
  };

  const display = hovered || value;

  return (
    <div
      ref={groupRef}
      role="group"
      aria-labelledby={`${id}-label`}
      className="flex flex-col gap-1"
    >
      <span id={`${id}-label`} className="text-sm font-medium text-gray-700">
        {label}
      </span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            tabIndex={!readOnly && (value === star || (value === 0 && star === 1)) ? 0 : -1}
            disabled={readOnly}
            className={`text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded transition-colors ${
              star <= display ? 'text-yellow-400' : 'text-gray-300'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-300'}`}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onKeyDown={(e) => handleKeyDown(e, star)}
          >
            ★
          </button>
        ))}
      </div>
      {/* Screen reader current value announcement */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {value ? `Current rating: ${value} out of 5 stars` : 'No rating selected'}
      </span>
    </div>
  );
}