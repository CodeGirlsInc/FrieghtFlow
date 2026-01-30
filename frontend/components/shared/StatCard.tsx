"use client";

import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard(props: {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}) {
  const { title, value, icon, subtitle, className } = props;

  return (
    <Card variant="default" className={cn("h-full transition-all hover:shadow-lg", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</div>
          {subtitle ? <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        {icon ? (
          <div className="shrink-0 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

