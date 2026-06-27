import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Truck illustration */}
        <div className="flex justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Truck body */}
            <rect
              x="15"
              y="45"
              width="60"
              height="40"
              rx="4"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary/60"
              fill="none"
            />
            {/* Truck cabin */}
            <path
              d="M75 55h20l10 15v15H75V55z"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary/60"
              fill="none"
            />
            {/* Window */}
            <rect
              x="80"
              y="60"
              width="12"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/40"
              fill="none"
            />
            {/* Wheels */}
            <circle
              cx="30"
              cy="90"
              r="8"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary/60"
              fill="none"
            />
            <circle
              cx="30"
              cy="90"
              r="3"
              fill="currentColor"
              className="text-primary/60"
            />
            <circle
              cx="90"
              cy="90"
              r="8"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary/60"
              fill="none"
            />
            <circle
              cx="90"
              cy="90"
              r="3"
              fill="currentColor"
              className="text-primary/60"
            />
            {/* Road */}
            <path
              d="M10 98h100"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/30"
              strokeLinecap="round"
            />
            {/* Question mark */}
            <text
              x="60"
              y="35"
              textAnchor="middle"
              fontSize="28"
              fontWeight="bold"
              fill="currentColor"
              className="text-muted-foreground/40"
            >
              ?
            </text>
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
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
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
