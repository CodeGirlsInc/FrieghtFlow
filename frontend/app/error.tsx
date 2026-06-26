'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Replace with Sentry, LogRocket, Datadog, etc.
    console.error('[GlobalError]', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      reset();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section
        role="alert"
        aria-live="assertive"
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            An unexpected error occurred while loading this page.
            Please try again. If the problem persists, contact support.
          </p>

          {error.digest && (
            <div className="mt-4 rounded-md bg-muted px-3 py-2 text-xs font-mono text-muted-foreground">
              Error ID: {error.digest}
            </div>
          )}

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isResetting ? 'animate-spin' : ''
                }`}
              />
              {isResetting ? 'Retrying...' : 'Try Again'}
            </button>

            <Link
              href="/dashboard"
              className="inline-flex flex-1 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 w-full rounded-lg border border-border bg-muted/40 p-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details
              </summary>

              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Message
                  </p>
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words text-xs text-destructive">
                    {error.message}
                  </pre>
                </div>

                {error.stack && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Stack Trace
                    </p>
                    <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-background p-3 text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </section>
    </main>
  );
}