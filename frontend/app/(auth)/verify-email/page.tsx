'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { verifyEmail } from '../../../lib/api/auth.api';
import { getErrorMessage } from '../../../lib/api/client';
import { useAuthStore } from '../../../stores/auth.store';

type VerificationState = 'verifying' | 'success' | 'expired' | 'invalid' | 'missing';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const [state, setState] = useState<VerificationState>(
    token ? 'verifying' : 'missing',
  );
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token || requestedRef.current) return;
    requestedRef.current = true;
    verifyEmail(token)
      .then(() => {
        fetchCurrentUser();
        setState('success');
      })
      .catch((err: unknown) => {
        const message = getErrorMessage(err) ?? '';
        setState(/expired/i.test(message) ? 'expired' : 'invalid');
      });
  }, [token, fetchCurrentUser]);

  if (state === 'verifying') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifying your email</CardTitle>
          <CardDescription>
            Please wait while we confirm your verification link.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your account is ready. You can now sign in and use all FreightFlow
            features.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const expired = state === 'expired';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {expired
            ? 'Verification link expired'
            : state === 'missing'
              ? 'Verification link missing'
              : 'Invalid verification link'}
        </CardTitle>
        <CardDescription>
          {state === 'missing'
            ? 'This page needs a verification token. Sign in to request a new email from your profile.'
            : 'This link is no longer valid. Sign in to request a fresh verification email from your profile.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Verification links expire after 24 hours.
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link href="/login?callbackUrl=/profile">Sign in to resend</Link>
        </Button>
        <Link
          href="/login?callbackUrl=/profile"
          className="text-sm text-primary underline underline-offset-4"
        >
          Request a new verification email
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
