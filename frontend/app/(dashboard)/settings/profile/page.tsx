'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { useAuthStore } from '../../../../stores/auth.store';
import { updateProfile, changePassword } from '../../../../lib/api/auth.api';
import { apiClient } from '../../../../lib/api/client';

// Stellar public key: starts with G, 56 chars, base32
const STELLAR_RE = /^G[A-Z2-7]{55}$/;

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
});

const walletSchema = z.object({
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(STELLAR_RE, 'Invalid Stellar address (must start with G and be 56 characters)'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileData = z.infer<typeof profileSchema>;
type WalletData = z.infer<typeof walletSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfileSettingsPage() {
  const { user, setUser, fetchCurrentUser, logout } = useAuthStore();

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const walletForm = useForm<WalletData>({ resolver: zodResolver(walletSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (!user) fetchCurrentUser();
  }, [user, fetchCurrentUser]);

  useEffect(() => {
    if (user) {
      profileForm.reset({ firstName: user.firstName, lastName: user.lastName });
      walletForm.reset({ walletAddress: user.walletAddress ?? '' });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProfile = async (data: ProfileData) => {
    try {
      const updated = await updateProfile(data);
      setUser(updated);
      profileForm.reset({ firstName: updated.firstName, lastName: updated.lastName });
      toast.success('Personal info updated.');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to update profile.');
    }
  };

  const saveWallet = async (data: WalletData) => {
    try {
      const updated = await apiClient<typeof user>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ walletAddress: data.walletAddress }),
      });
      setUser(updated!);
      toast.success('Wallet address linked.');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to link wallet.');
    }
  };

  const savePassword = async (data: PasswordData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed. Signing you out…');
      passwordForm.reset();
      setTimeout(() => logout(), 1500);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to change password.');
    }
  };

  if (!user) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal info, wallet, and security
        </p>
      </div>

      {/* Personal Info */}
      <form onSubmit={profileForm.handleSubmit(saveProfile)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Info</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...profileForm.register('firstName')} />
              {profileForm.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...profileForm.register('lastName')} />
              {profileForm.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
            >
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Wallet */}
      <form onSubmit={walletForm.handleSubmit(saveWallet)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stellar Wallet</CardTitle>
            <CardDescription>
              Link your Stellar wallet address for on-chain interactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="walletAddress">Wallet address</Label>
            <Input
              id="walletAddress"
              placeholder="G…"
              autoComplete="off"
              {...walletForm.register('walletAddress')}
            />
            {walletForm.formState.errors.walletAddress && (
              <p className="text-sm text-destructive">
                {walletForm.formState.errors.walletAddress.message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={walletForm.formState.isSubmitting || !walletForm.formState.isDirty}
            >
              {walletForm.formState.isSubmitting ? 'Linking…' : 'Link Wallet'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Security */}
      <form onSubmit={passwordForm.handleSubmit(savePassword)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>
              Change your password. You will be signed out of all devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>
                  {field === 'currentPassword'
                    ? 'Current password'
                    : field === 'newPassword'
                      ? 'New password'
                      : 'Confirm new password'}
                </Label>
                <Input
                  id={field}
                  type="password"
                  placeholder="••••••••"
                  autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'}
                  {...passwordForm.register(field)}
                />
                {passwordForm.formState.errors[field] && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors[field]?.message}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Change Password'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
