'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings');
  }, [router]);
  return <div className="p-8 text-center text-muted-foreground text-sm">Redirecting to settings...</div>;
}
