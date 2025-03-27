'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export function Providers({ children }) {
  const router = useRouter();

  const onRedirectCallback = (appState, user) => {
    // Verificar si hay error en la URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      // Si el error es access_denied (usuario canceló la autenticación)
      if (error === 'access_denied') {
        router.push('/sign-in');
        return;
      }
    }

    // Si no hay error, proceder con la redirección normal
    router.push(appState?.returnTo || '/');
  };

  const onError = (error) => {
    console.error('Auth Error:', error);
    router.push('/sign-in');
  };

  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/callback`
    : 'http://localhost:3000/callback';

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        prompt: 'select_account',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
      onError={onError}
    >
      {children}
    </Auth0Provider>
  );
} 