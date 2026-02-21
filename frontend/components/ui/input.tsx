'use client'

import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full border border-input bg-background px-3 py-2 text-sm rounded-md 
        ring-offset-background 
        focus-visible:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-ring 
        focus-visible:ring-offset-2 
        disabled:cursor-not-allowed 
        disabled:opacity-50 
        ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
