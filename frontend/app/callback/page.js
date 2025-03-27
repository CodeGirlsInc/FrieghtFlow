'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';

export default function Callback() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAuth0();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        // Si hay error, redirigir a sign-in
        router.push('/sign-in');
      } else if (isAuthenticated) {
        // Si está autenticado, redirigir a home
        router.push('/');
      } else {
        // Si no está autenticado y no hay error, redirigir a sign-in
        router.push('/sign-in');
      }
    }
  }, [isLoading, isAuthenticated, error, router]);

  // Mostrar un loading mientras se procesa
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );
} 