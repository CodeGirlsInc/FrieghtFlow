import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are currently offline. Please check your internet connection.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mb-6 h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re offline</h1>
        <p className="text-muted-foreground text-sm mb-6">
          It looks like you&apos;ve lost your internet connection. Please check your network
          settings and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center bg-foreground text-background font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors"
        >
          Retry
        </button>
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Go home
          </Link>
        </p>
      </div>
    </div>
  );
}
