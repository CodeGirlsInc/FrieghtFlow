import React from "react";
import clsx from "clsx";

export type CardVariant = "default" | "bordered" | "flat";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  variant?: CardVariant;
}

const Card: React.FC<CardProps> = ({
  header,
  footer,
  children,
  variant = "default",
  className,
  ...props
}) => {
  const baseStyles =
    "rounded-2xl overflow-hidden bg-white dark:bg-gray-900 transition-all";

  const variantStyles = {
    default: "shadow-md hover:shadow-lg",
    bordered: "border border-gray-200 dark:border-gray-700",
    flat: "shadow-none border-none",
  };

  const isFlex = className?.includes("flex") || className?.includes("h-full");

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], isFlex && "flex flex-col", className)}
      {...props}
    >
      {header && (
        <div className="border-b border-gray-100 dark:border-gray-800 p-4 font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">
          {header}
        </div>
      )}

      <div className={clsx("p-4 text-gray-700 dark:text-gray-200", isFlex && "flex flex-col flex-1 min-h-0")}>
        {children}
      </div>

      {footer && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
