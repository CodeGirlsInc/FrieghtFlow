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

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {header && (
        <div className="border-b border-gray-100 dark:border-gray-800 p-4 font-semibold text-gray-800 dark:text-gray-100">
          {header}
        </div>
      )}

      <div className="p-4 text-gray-700 dark:text-gray-200">{children}</div>

      {footer && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 text-sm text-gray-600 dark:text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
