'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/auth.store';

interface CarrierStats {
  active: number;
  completedMonth: number;
  totalEarnings: number;
  avgRating: number | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function fetchCarrierStats(carrierId: string): Promise<CarrierStats> {
  const res = await fetch(`${BASE_URL}/carriers/${carrierId}/stats`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch carrier stats');
  return res.json();
}

export function useCarrierStats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<CarrierStats>({
    active: 0,
    completedMonth: 0,
    totalEarnings: 0,
    avgRating: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchCarrierStats(user.id)
      .then(setStats)
      .catch(() => setStats({ active: 0, completedMonth: 0, totalEarnings: 0, avgRating: null }))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return { stats, loading };
}

export function formatRating(avgRating: number | null): string {
  if (avgRating === null) return 'No ratings yet';
  return avgRating.toFixed(1);
}