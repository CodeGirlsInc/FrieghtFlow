'use client';

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '../../stores/toast.store';
import { cn } from '../../lib/utils';

const TOAST_STYLES: Record<ToastType, { bg: string; text: string; Icon: React.ElementType }> = {
  success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', Icon: CheckCircle },
  error:   { bg: 'bg-red-50 border-red-200',     text: 'text-red-800',   Icon: XCircle },
  warning: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', Icon: AlertTriangle },
  info:    { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800',  Icon: Info },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const { bg, text, Icon } = TOAST_STYLES[toast.type];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md text-sm w-80 animate-in slide-in-from-right-4',
        bg,
        text,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
