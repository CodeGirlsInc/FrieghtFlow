import { cn } from "@/lib/utils"; // utility for conditional classes (you can replace with clsx)
import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800 border border-green-300",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  error: "bg-red-100 text-red-800 border border-red-300",
  info: "bg-blue-100 text-blue-800 border border-blue-300",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
};

export function Badge({
  variant = "info",
  size = "md",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && <span className="mr-1 h-4 w-4 flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
