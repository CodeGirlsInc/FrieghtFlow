"use client";

import React, { forwardRef } from "react";

export type InputType =
  | "text"
  | "password"
  | "number"
  | "email"
  | "tel"
  | "url";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: InputType;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      leftIcon,
      rightIcon,
      error,
      className,
      wrapperClassName,
      inputClassName,
      errorClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    // Helper function to combine class names
    const combineClasses = (
      ...classes: (string | undefined | boolean)[]
    ): string => {
      return classes.filter(Boolean).join(" ");
    };

    // Calculate padding based on icons
    const leftPadding = leftIcon ? "pl-10" : "pl-3";
    const rightPadding = rightIcon ? "pr-10" : "pr-3";

    return (
      <div className={combineClasses("w-full", wrapperClassName)}>
        {/* Input container with relative positioning for icons */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={combineClasses(
              // Base styles
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              // Dynamic padding based on icons
              leftPadding,
              rightPadding,
              // Error state styling
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
              // Disabled state
              disabled && "bg-gray-50",
              className,
              inputClassName
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${props.id || "input"}-error` : undefined
            }
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${props.id || "input"}-error`}
            className={combineClasses(
              "mt-1 text-sm text-red-500",
              errorClassName
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
