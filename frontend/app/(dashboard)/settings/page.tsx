'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { changePassword } from '../../../lib/api/auth.api';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '../../../lib/validation/auth';

export default function SettingsPage() {
  const { logout } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed. Please sign in again with your new password.');
      reset();
      // All sessions are invalidated — log user out of this device too
      setTimeout(() => logout(), 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to change password.');
    }
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account security
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
            <CardDescription>
              After changing your password, you will be signed out of all devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting ? 'Updating…' : 'Change password'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger zone placeholder */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          <CardDescription>
            These actions are irreversible. Please be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Account deletion is not available through the self-service portal. Please
            contact{' '}
            <a
              href="mailto:support@freightflow.io"
              className="text-primary underline underline-offset-4"
            >
              support@freightflow.io
            </a>{' '}
            if you need your account removed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
