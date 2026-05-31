'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';

interface CarrierProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  completedShipments: number;
  averageRating: number;
  totalReviews: number;
  certifications: string[];
  bio?: string;
  avatarUrl?: string;
  onTimeRate?: number;
  responseRate?: number;
  totalEarnings?: number;
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

function ReputationBar({ score }: { score: number }) {
  const percentage = Math.min((score / 5) * 100, 100);
  const color =
    score >= 4.5 ? 'bg-green-500' : score >= 3.5 ? 'bg-blue-500' : score >= 2.5 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Reputation Score</span>
        <span className="font-medium">{score.toFixed(1)} / 5.0</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
        />
      </div>
    </div>
  );
}

export function CarrierProfilePage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: carrier,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['carrier-profile', id],
    queryFn: () => apiClient<CarrierProfileData>(`/carriers/${id}`),
    enabled: !!id,
  });

  const {
    data: reviews,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ['carrier-reviews', id],
    queryFn: () => apiClient<Review[]>(`/carriers/${id}/reviews`),
    enabled: !!id,
  });

  if (isError) {
    return (
      <div className="p-8 text-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-destructive text-sm mb-2">
              Failed to load carrier profile.
            </p>
            <p className="text-muted-foreground text-xs mb-4">
              {(error as Error)?.message || 'An unexpected error occurred.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
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
                {carrier.avatarUrl ? (
                  <img
                    src={carrier.avatarUrl}
                    alt={`${carrier.firstName} ${carrier.lastName}`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  `${carrier.firstName[0]}${carrier.lastName[0]}`
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">
                  {carrier.firstName} {carrier.lastName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Member since{' '}
                  {new Date(carrier.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {carrier.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{carrier.bio}</p>
                )}
              </div>
              <Button asChild className="shrink-0">
                <Link
                  href={`/shipments/new?carrierId=${carrier.id}&carrierName=${encodeURIComponent(`${carrier.firstName} ${carrier.lastName}`)}`}
                >
                  Contact / Hire
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-1">
                  <Skeleton className="h-3 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-12" />
                </CardContent>
              </Card>
            ))
          : carrier && (
              <>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{carrier.completedShipments}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StarRating rating={carrier.averageRating} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      On-Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {carrier.onTimeRate != null ? `${carrier.onTimeRate}%` : '—'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      Response Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {carrier.responseRate != null ? `${carrier.responseRate}%` : '—'}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
      </div>

      {/* Reputation Score */}
      {!isLoading && carrier && (
        <Card>
          <CardContent className="pt-6">
            <ReputationBar score={carrier.averageRating} />
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {!isLoading && carrier && carrier.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {carrier.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {cert}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Reviews {reviews && `(${reviews.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
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
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
