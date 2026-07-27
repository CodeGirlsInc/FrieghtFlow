'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function SessionExpiryWarning() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleStorageEvent = useCallback(() => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const userId = sessionStorage.getItem('userId');
    if (!refreshToken || !userId) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [handleStorageEvent]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative bg-card border border-border rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Session expiring soon</h2>
        <p className="text-sm text-muted-foreground">
          Your session will expire shortly. Would you like to stay signed in?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              sessionStorage.removeItem('refreshToken');
              sessionStorage.removeItem('userId');
              setOpen(false);
              router.push('/login');
            }}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
