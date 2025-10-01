"use client";

import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, placeholder, maxLength, error, ...props }, ref) => {
    const charCount = value ? String(value).length : 0;

    return (
      <div className="relative w-full">
        <textarea
          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-destructive" : ""
          } ${className}`}
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          {...props}
        />
        <div className={`absolute right-1 flex items-center text-sm text-muted-foreground ${error ? "bottom-6" : "bottom-2"}`}>
          {maxLength && (
            <span className={`mr-2 ${charCount >= maxLength ? "text-red-500" : "text-gray-500"}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
