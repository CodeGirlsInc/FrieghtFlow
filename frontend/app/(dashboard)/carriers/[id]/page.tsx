'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface CarrierProfile {
  id: string; firstName: string; lastName: string; email: string;
  completedShipments: number; averageRating: number; bio?: string;
}
interface Review {
  id: string; rating: number; comment: string; reviewerName: string; createdAt: string;
}

export default function CarrierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<CarrierProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/carriers/${id}/profile`, { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch(`${BASE_URL}/carriers/${id}/reviews`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([p, r]) => { setProfile(p); setReviews(r); })
      .catch(() => setError('Failed to load carrier profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-32 w-full" /></div>;
  if (error || !profile) return <p className="p-8 text-destructive">{error ?? 'Carrier not found.'}</p>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Card><CardHeader><CardTitle>{profile.firstName} {profile.lastName}</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{profile.bio ?? 'No bio provided.'}</p>
          <p>Completed shipments: <strong>{profile.completedShipments}</strong></p>
          <p>Rating: <strong>{profile.averageRating > 0 ? `${profile.averageRating.toFixed(1)} / 5` : 'No ratings yet'}</strong></p>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Reviews ({reviews.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p>
            : reviews.map(r => (
              <div key={r.id} className="border rounded p-3 text-sm">
                <p className="font-medium">{r.reviewerName} — {r.rating}/5</p>
                <p className="text-muted-foreground">{r.comment}</p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}