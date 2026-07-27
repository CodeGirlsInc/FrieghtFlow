import Link from 'next/link';

export default function ShipmentNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
          <span className="text-muted-foreground text-xl">📦</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Shipment not found</h2>
        <p className="text-sm text-muted-foreground">
          This shipment doesn&apos;t exist or you don&apos;t have access to it.
          It may have been removed or the link is incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/shipments"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View all shipments
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
