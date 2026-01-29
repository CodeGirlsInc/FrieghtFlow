"use client";

import Card from "@/components/ui/Card";

export default function ChartCard(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { title, subtitle, children } = props;
  return (
    <Card
      header={
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs font-normal text-muted-foreground">{subtitle}</div> : null}
        </div>
      }
    >
      <div className="h-72">{children}</div>
    </Card>
  );
}

