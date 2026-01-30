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
  success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700",
  error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
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
