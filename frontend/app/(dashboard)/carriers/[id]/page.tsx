'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { cn } from '../../../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  /** Optional: on-time delivery percentage 0–100 */
  onTimeRate?: number;
  /** Optional: acceptance rate 0–100 */
  acceptanceRate?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type State =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      carrier: CarrierProfile;
      reviews: Review[];
      reviewsLoading: boolean;
    };

type Action =
  | { type: 'CARRIER_LOADED'; carrier: CarrierProfile }
  | { type: 'NOT_FOUND' }
  | { type: 'ERROR'; message: string }
  | { type: 'REVIEWS_LOADED'; reviews: Review[] }
  | { type: 'REVIEWS_ERROR' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CARRIER_LOADED':
      return { status: 'ready', carrier: action.carrier, reviews: [], reviewsLoading: true };
    case 'NOT_FOUND':
      return { status: 'not_found' };
    case 'ERROR':
      return { status: 'error', message: action.message };
    case 'REVIEWS_LOADED':
      if (state.status !== 'ready') return state;
      return { ...state, reviews: action.reviews, reviewsLoading: false };
    case 'REVIEWS_ERROR':
      if (state.status !== 'ready') return state;
      return { ...state, reviewsLoading: false };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

function memberSince(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const rounded = Math.round(rating * 2) / 2; // nearest half-star
  const px = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i + 1 <= rounded;
        const half = !full && i + 0.5 === rounded;
        return (
          <svg
            key={i}
            className={cn(px, full || half ? 'text-amber-400' : 'text-muted-foreground/25')}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            {half ? (
              /* half-star via clipPath */
              <>
                <defs>
                  <clipPath id={`half-${i}`}>
                    <rect x="0" y="0" width="10" height="20" />
                  </clipPath>
                </defs>
                <path
                  className="text-muted-foreground/25"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
                <path
                  clipPath={`url(#half-${i})`}
                  className="text-amber-400"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </>
            ) : (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        );
      })}
      <span className="ml-1.5 text-sm font-medium tabular-nums">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── RatingDistribution ───────────────────────────────────────────────────────

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0]; // index 0 = 1 star
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) c[Math.round(r.rating) - 1]++; });
    return c.reverse(); // 5→1 top to bottom
  }, [reviews]);

  const max = Math.max(...counts, 1);

  return (
    <div className="space-y-1.5" aria-label="Rating breakdown">
      {counts.map((count, i) => {
        const star = 5 - i;
        const pct = Math.round((count / reviews.length) * 100) || 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right tabular-nums text-muted-foreground">{star}</span>
            <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: `${(count / max) * 100}%` }}
                role="presentation"
              />
            </div>
            <span className="w-6 text-right tabular-nums text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── TrustBar ─────────────────────────────────────────────────────────────────

function TrustPill({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      'flex flex-col rounded-xl px-4 py-3 border',
      accent ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
    )}>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn('text-2xl font-bold tabular-nums mt-0.5', accent && 'text-primary')}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials: ini, size = 'lg' }: { initials: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-9 w-9 text-sm';
  return (
    <div
      className={cn(
        'rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary shrink-0 ring-2 ring-primary/20',
        dim,
      )}
      aria-hidden="true"
    >
      {ini}
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-xl border bg-card p-4 space-y-3 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar initials={review.reviewerName[0]?.toUpperCase() ?? '?'} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{review.reviewerName}</p>
            <time
              className="text-xs text-muted-foreground"
              dateTime={review.createdAt}
            >
              {formatDate(review.createdAt)}
            </time>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      )}
    </article>
  );
}

// ─── ReviewSection ────────────────────────────────────────────────────────────

function ReviewSection({ reviews, loading }: { reviews: Review[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading reviews">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-10 text-center space-y-1">
        <p className="text-sm font-medium text-foreground">No reviews yet</p>
        <p className="text-xs text-muted-foreground">
          Reviews appear here after completed shipments are rated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
    </div>
  );
}

// ─── Skeleton layouts ─────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-5">
      <Skeleton className="h-20 w-20 rounded-full shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg shrink-0" />
    </div>
  );
}

function TrustBarSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-7 w-14" />
        </div>
      ))}
    </div>
  );
}

// ─── Not-found / error states ─────────────────────────────────────────────────

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-muted-foreground">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold">Carrier not found</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          This profile doesn&apos;t exist or hasn&apos;t been made public yet.
        </p>
      </div>
      <Button variant="outline" onClick={onBack}>Go back</Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-destructive">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarrierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });

  const load = useCallback(() => {
    if (!id) return;
    dispatch({ type: 'CARRIER_LOADED', carrier: undefined as unknown as CarrierProfile }); // reset to loading

    // Carrier profile
    fetch(`/api/carriers/${id}/profile`)
      .then(async (res) => {
        if (res.status === 404) { dispatch({ type: 'NOT_FOUND' }); return; }
        if (!res.ok) throw new Error(`Failed to load carrier (${res.status})`);
        const data: CarrierProfile = await res.json();
        dispatch({ type: 'CARRIER_LOADED', carrier: data });

        // Reviews — only after carrier loaded
        fetch(`/api/carriers/${id}/reviews`)
          .then((r) => r.json())
          .then((d) => dispatch({ type: 'REVIEWS_LOADED', reviews: Array.isArray(d) ? d : d?.data ?? [] }))
          .catch(() => dispatch({ type: 'REVIEWS_ERROR' }));
      })
      .catch((err: Error) => dispatch({ type: 'ERROR', message: err.message }));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (state.status === 'loading') {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <Card><CardContent className="pt-6"><HeroSkeleton /></CardContent></Card>
        <TrustBarSkeleton />
        <Card><CardContent className="pt-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  if (state.status === 'not_found') return <NotFound onBack={() => router.back()} />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={load} />;

  const { carrier, reviews, reviewsLoading } = state;
  const fullName = `${carrier.firstName} ${carrier.lastName}`;
  const hireUrl = `/shipments/new?carrierId=${carrier.id}&carrierName=${encodeURIComponent(fullName)}`;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-5">

      {/* ── Hero card ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar initials={initials(carrier.firstName, carrier.lastName)} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Member since {memberSince(carrier.createdAt)}
              </p>
              {carrier.bio && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-prose">
                  {carrier.bio}
                </p>
              )}
            </div>
            <Button asChild className="shrink-0 w-full sm:w-auto">
              <Link href={hireUrl}>Contact &amp; hire</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Trust bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="region" aria-label="Carrier statistics">
        <TrustPill
          label="Shipments"
          value={carrier.completedShipments.toLocaleString()}
          sub="completed"
          accent
        />
        <TrustPill
          label="Rating"
          value={carrier.averageRating.toFixed(1)}
          sub={`${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
        />
        {carrier.onTimeRate !== undefined && (
          <TrustPill
            label="On-time"
            value={`${carrier.onTimeRate}%`}
            sub="delivery rate"
          />
        )}
        {carrier.acceptanceRate !== undefined && (
          <TrustPill
            label="Acceptance"
            value={`${carrier.acceptanceRate}%`}
            sub="load rate"
          />
        )}
      </div>

      {/* ── Certifications ── */}
      {carrier.certifications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2" aria-label="Certifications">
              {carrier.certifications.map((cert) => (
                <li
                  key={cert}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-sm font-medium"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.28 5.78a.75.75 0 00-1.06-1.06L7 8.94 5.78 7.72a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06 0l3.75-3.75z" />
                  </svg>
                  {cert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Reviews ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Reviews
            </CardTitle>
            {!reviewsLoading && reviews.length > 0 && (
              <StarRating rating={carrier.averageRating} size="md" />
            )}
          </div>
          {/* Rating distribution — only show once reviews are loaded and plentiful */}
          {!reviewsLoading && reviews.length >= 3 && (
            <div className="mt-4 pt-4 border-t">
              <RatingDistribution reviews={reviews} />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ReviewSection reviews={reviews} loading={reviewsLoading} />
        </CardContent>
      </Card>
    </main>
  );
}