import Link from "next/link";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_8%,transparent)_0%,transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,_color-mix(in_oklab,var(--color-muted)_70%,transparent),transparent)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center rounded-[2rem] border border-border bg-card/95 px-8 py-12 text-center shadow-2xl shadow-black/5 backdrop-blur sm:px-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-black tracking-tight text-primary-foreground shadow-lg shadow-primary/20">
          FF
        </div>

        <p className="mt-8 text-7xl font-semibold tracking-tight text-muted-foreground/60 sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          The route you requested does not exist or may have moved. Jump back into FreightFlow
          from the dashboard or head straight to your shipment workspace.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/shipments"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            View Shipments
          </Link>
        </div>
      </section>
    </main>
  );
}