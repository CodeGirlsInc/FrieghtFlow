import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28 px-6">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
      />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          Powered by Stellar Blockchain
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Freight logistics,{' '}
          <span className="text-primary">reimagined</span>{' '}
          for Web3
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect shippers and carriers on a transparent, blockchain-backed platform.
          Post loads, bid on jobs, and settle payments — all without intermediaries.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get Started — it&apos;s free
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Learn More ↓
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-xs text-muted-foreground">
          Trusted by <strong className="text-foreground">6,800+</strong> carriers across{' '}
          <strong className="text-foreground">52</strong> countries
        </p>
      </div>
    </section>
  );
}
