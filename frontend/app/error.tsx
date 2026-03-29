"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_10%,transparent)_0%,transparent_45%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-border" />

          <section className="relative z-10 w-full max-w-xl rounded-3xl border border-border bg-card/95 p-8 shadow-2xl shadow-black/5 backdrop-blur sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Application error
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Something went wrong
              </h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                FreightFlow hit an unexpected problem while rendering this page. You can retry the
                request or leave this screen and continue from your dashboard.
              </p>
            </div>

            {error.digest ? (
              <div className="mt-6 rounded-2xl border border-border bg-muted/60 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Support reference
                </p>
                <code className="mt-2 block break-all text-sm text-foreground">{error.digest}</code>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
              <a
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                Go to Dashboard
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}