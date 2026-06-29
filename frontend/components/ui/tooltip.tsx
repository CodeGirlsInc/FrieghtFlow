'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  setOpen: () => {},
});

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = React.useContext(TooltipContext);
  const props = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props as React.HTMLAttributes<HTMLElement>);
  }
  return <span {...props}>{children}</span>;
}

export function TooltipContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = React.useContext(TooltipContext);
  if (!open) return null;
  return (
    <div
      className={cn(
        'absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-md whitespace-nowrap',
        className,
      )}
    >
      {children}
    </div>
  );
}
