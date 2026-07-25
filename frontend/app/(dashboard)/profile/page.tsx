'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuthStore } from '../../../stores/auth.store';
import { updateProfile } from '../../../lib/api/auth.api';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser, fetchCurrentUser, isLoading } = useAuthStore();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => { if (!user) fetchCurrentUser(); }, [user, fetchCurrentUser]);
  useEffect(() => {
    if (user) reset({ firstName: user.firstName, lastName: user.lastName });
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateProfile(data);
      setUser(updated);
      reset({ firstName: updated.firstName, lastName: updated.lastName });
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to update profile.');
    }
  };

  if (isLoading || !user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your name. To manage your Stellar wallet address, visit{' '}
          <Link href="/settings/profile" className="underline text-primary">Settings → Profile</Link>.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div><Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div><Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}