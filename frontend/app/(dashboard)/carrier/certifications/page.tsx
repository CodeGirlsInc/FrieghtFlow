'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CertificationsPanel } from '../../../../components/carriers/CertificationsPanel';
import { Button } from '../../../../components/ui/button';
import { useAuthStore } from '../../../../stores/auth.store';

export default function CarrierCertificationsPage() {
  const router = useRouter();
  const { user, fetchCurrentUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user) fetchCurrentUser();
  }, [user, fetchCurrentUser]);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'carrier') {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  if (!user) {
    if (!isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">Sign in to manage certifications.</p>
          <Button
            onClick={() =>
              router.push('/login?callbackUrl=/carrier/certifications')
            }
          >
            Sign in
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (user.role !== 'carrier') return null;

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground mt-4">Certifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage the documents that support your carrier profile.
        </p>
      </div>
      <CertificationsPanel />
    </div>
  );
}
