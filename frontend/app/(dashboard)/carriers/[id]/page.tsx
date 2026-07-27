'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { CarrierReviews } from '../../../../components/carriers/carrier-reviews';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface CarrierProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  completedShipments: number;
  averageRating: number;
  reviewCount: number;
  bio?: string;
  isVerified: boolean;
  serviceAreas: string[];
  onTimeRate: number;
  joinedAt: string;
}

function VerificationBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      Verified Carrier
    </span>
  );
}

export default function CarrierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<CarrierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${BASE_URL}/carriers/${id}/profile`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((p) => setProfile(p))
      .catch(() => setError('Failed to load carrier profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return <p className="p-4 sm:p-8 text-destructive">{error ?? 'Carrier not found.'}</p>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{profile.firstName} {profile.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            <VerificationBadge verified={profile.isVerified} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xl font-bold text-foreground">{profile.completedShipments}</p>
              <p className="text-xs text-muted-foreground">Shipments</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xl font-bold text-foreground">
                {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xl font-bold text-foreground">{profile.onTimeRate}%</p>
              <p className="text-xs text-muted-foreground">On-Time</p>
            </div>
          </div>

          {/* Service areas */}
          {profile.serviceAreas && profile.serviceAreas.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.serviceAreas.map((area) => (
                  <span key={area} className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Not verified notice */}
          {!profile.isVerified && (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">
                This carrier has not yet completed verification. Exercise additional caution when considering them.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <CarrierReviews carrierId={profile.id} />
    </div>
  );
}
