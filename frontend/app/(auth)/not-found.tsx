import Link from 'next/link';

export default function AuthNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">FF</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
