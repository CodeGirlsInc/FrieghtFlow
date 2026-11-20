'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { useAuthStore } from '../../../stores/auth.store';
import { updateProfile } from '../../../lib/api/auth.api';
import { reviewsApi } from '../../../lib/api/reviews.api';
import { getErrorMessage } from '../../../lib/api/client';

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
}

// Stellar public key: starts with G, 56 chars, base32
const STELLAR_RE = /^G[A-Z2-7]{55}$/;

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  walletAddress: z
    .string()
    .optional()
    .refine((v) => !v || STELLAR_RE.test(v), {
      message: 'Invalid Stellar address (must start with G and be 56 characters)',
    }),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser, fetchCurrentUser, isLoading } = useAuthStore();
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [ratingLoading, setRatingLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setRatingLoading(true);
    reviewsApi.getAverageRating(user.id)
      .then((summary) => {
        if (active) setRatingSummary(summary);
      })
      .catch((err: unknown) => {
        if (active) toast.error(getErrorMessage(err) ?? 'Failed to load your rating.');
      })
      .finally(() => {
        if (active) setRatingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Populate form once user loads
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        walletAddress: data.walletAddress || undefined,
      });
      setUser(updated);
      reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
        walletAddress: updated.walletAddress ?? '',
      });
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to update profile.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Identity card (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
          <CardDescription>These fields cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Role</p>
              <p className="text-sm font-medium capitalize">{user.role}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Email verified
              </p>
              <p className="text-sm font-medium">
                {user.isEmailVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending verification</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Member since
              </p>
              <p className="text-sm font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Received rating</CardTitle>
          <CardDescription>Ratings left by the other party on completed shipments.</CardDescription>
        </CardHeader>
        <CardContent>
          {ratingLoading ? (
            <p className="text-sm text-muted-foreground">Loading rating…</p>
          ) : ratingSummary && ratingSummary.totalReviews > 0 ? (
            <p className="text-sm">
              <span className="font-semibold">{ratingSummary.averageRating.toFixed(1)} / 5</span>
              <span className="text-muted-foreground">
                {' '}· {ratingSummary.totalReviews} review{ratingSummary.totalReviews === 1 ? '' : 's'}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No ratings yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Editable fields */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal information</CardTitle>
            <CardDescription>Update your name and wallet address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  autoComplete="given-name"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  autoComplete="family-name"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress">
                Stellar wallet address{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="walletAddress"
                placeholder="G..."
                autoComplete="off"
                {...register('walletAddress')}
              />
              {errors.walletAddress && (
                <p className="text-sm text-destructive">{errors.walletAddress.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Link your Stellar wallet for on-chain contract interactions.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
