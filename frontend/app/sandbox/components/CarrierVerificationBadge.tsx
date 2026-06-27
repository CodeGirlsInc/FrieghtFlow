'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldOff, Star } from 'lucide-react';

export type VerificationTier = 'unverified' | 'verified' | 'trusted' | 'elite';

export interface CarrierVerificationBadgeProps {
  score: number;
  deliveries: number;
  memberSince: string;
}

function getTier(score: number): VerificationTier {
  if (score >= 90) return 'elite';
  if (score >= 70) return 'trusted';
  if (score >= 40) return 'verified';
  return 'unverified';
}

const TIER_CONFIG: Record<VerificationTier, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  unverified: { label: 'Unverified', icon: ShieldOff,   bg: 'bg-gray-100',   text: 'text-gray-600',  border: 'border-gray-300'  },
  verified:   { label: 'Verified',   icon: ShieldCheck, bg: 'bg-blue-100',   text: 'text-blue-700',  border: 'border-blue-300'  },
  trusted:    { label: 'Trusted',    icon: ShieldCheck, bg: 'bg-green-100',  text: 'text-green-700', border: 'border-green-300' },
  elite:      { label: 'Elite',      icon: Star,        bg: 'bg-yellow-100', text: 'text-yellow-700',border: 'border-yellow-400'},
};

export function CarrierVerificationBadge({ score, deliveries, memberSince }: CarrierVerificationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tier = getTier(score);
  const { label, icon: Icon, bg, text, border } = TIER_CONFIG[tier];

  return (
    <div className="relative inline-block">
      <span
        className={cn('inline-flex cursor-default items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold select-none', bg, text, border)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs text-gray-700">
          <p className="font-semibold text-gray-900 mb-1">{label} Carrier</p>
          <p>Reputation score: <span className="font-medium">{score}</span></p>
          <p>Total deliveries: <span className="font-medium">{deliveries.toLocaleString()}</span></p>
          <p>Member since: <span className="font-medium">{memberSince}</span></p>
        </div>
      )}
    </div>
  );
}
