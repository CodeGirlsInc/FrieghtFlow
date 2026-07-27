import Link from 'next/link';

export default function MarketplaceNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
          <span className="text-muted-foreground text-xl">🏪</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Marketplace unavailable</h2>
        <p className="text-sm text-muted-foreground">
          The marketplace page you&apos;re looking for doesn&apos;t exist or is currently unavailable.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}
