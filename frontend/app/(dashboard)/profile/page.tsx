'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { updateProfile } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const stellarWalletRegex = /^G[A-Z2-7]{55}$/;

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  walletAddress: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || stellarWalletRegex.test(value), {
      message: 'Enter a valid Stellar wallet address',
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: string | string[] }).message;
    if (Array.isArray(message)) {
      return message[0] ?? 'Failed to update profile';
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return 'Failed to update profile';
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatMemberSince(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return parsed.toLocaleDateString();
}

export default function ProfilePage() {
  const { user, isLoading, fetchCurrentUser, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      walletAddress: '',
    },
  });

  useEffect(() => {
    if (!user) {
      void fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const updatedUser = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        walletAddress: values.walletAddress || undefined,
      });

      setUser(updatedUser);
      toast.success('Profile updated successfully');
      reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        walletAddress: updatedUser.walletAddress ?? '',
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading && !user) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>These fields are managed by your account and cannot be edited here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{formatRole(user.role)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email verification</p>
            <p className="font-medium">{user.isEmailVerified ? 'Verified' : 'Not verified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="font-medium">{formatMemberSince(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your display details and optional Stellar wallet address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName ? (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName ? (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress">Stellar wallet address</Label>
              <Input id="walletAddress" placeholder="G..." {...register('walletAddress')} />
              {errors.walletAddress ? (
                <p className="text-sm text-red-600">{errors.walletAddress.message}</p>
              ) : null}
            </div>

            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
