import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">FF</span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <p className="text-8xl font-black text-primary/20">404</p>
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/shipments"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            View Shipments
          </Link>
        </div>
      </div>
    </div>
  );
}
