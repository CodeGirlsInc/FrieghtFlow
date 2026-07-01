'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';

interface CarrierProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  completedShipments: number;
  averageRating: number;
  certifications: string[];
  bio?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

function CarrierReviews({ reviews, loading }: { reviews: Review[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No reviews yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {review.reviewerName[0]}
              </div>
              <span className="text-sm font-medium">{review.reviewerName}</span>
            </div>
            <StarRating rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function CarrierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [carrier, setCarrier] = useState<CarrierProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch carrier profile
    fetch(`/api/carriers/${id}/profile`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setCarrier(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    // Fetch reviews
    fetch(`/api/carriers/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">Carrier not found</h1>
        <p className="text-muted-foreground text-sm mb-4">
          This carrier profile doesn&apos;t exist or has no public data yet.
        </p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ) : carrier ? (
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {carrier.firstName[0]}{carrier.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">
                  {carrier.firstName} {carrier.lastName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Member since{' '}
                  {new Date(carrier.createdAt).toLocaleDateString('en-US', {
                    month: 'long', year: 'numeric',
                  })}
                </p>
                {carrier.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{carrier.bio}</p>
                )}
              </div>
              <Button asChild className="shrink-0">
                <Link href={`/shipments/new?carrierId=${carrier.id}&carrierName=${encodeURIComponent(`${carrier.firstName} ${carrier.lastName}`)}`}>
                  Contact / Hire
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card shadow p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))
        ) : carrier ? (
          <>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Completed Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{carrier.completedShipments}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <StarRating rating={carrier.averageRating} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Certifications */}
      {!loading && carrier && carrier.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {carrier.certifications.map((cert) => (
                <li
                  key={cert}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {cert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <CarrierReviews reviews={reviews} loading={reviewsLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
