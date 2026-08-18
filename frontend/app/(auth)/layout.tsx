export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">FF</span>
        </div>
        <span className="text-xl font-bold text-foreground">FreightFlow</span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
