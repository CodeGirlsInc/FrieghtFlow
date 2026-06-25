"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry or other monitoring service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center space-y-6 max-w-md">
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                <span className="text-destructive font-bold text-2xl">!</span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Critical error occurred
              </h1>
              <p className="text-muted-foreground text-sm">
                {error.message ||
                  "A critical application error occurred. Please try refreshing the page."}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
