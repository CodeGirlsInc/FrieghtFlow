'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../../lib/api/client';
import { ShipmentStatus } from '../../../types/shipment.types';
import { Button } from '@/components/ui/button';

export interface ExportFilters {
  /** Status filter for shipments */
  status?: ShipmentStatus | 'all';
  /** Search query for origin/destination */
  search?: string;
  /** Origin filter */
  origin?: string;
  /** Destination filter */
  destination?: string;
  /** Start date for date range filter (ISO string) */
  startDate?: string;
  /** End date for date range filter (ISO string) */
  endDate?: string;
}

export interface ExportButtonProps {
  /** Current active filters to include in the export */
  filters?: ExportFilters;
  /** Custom class name for styling */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom label for the button */
  label?: string;
  /** Variant of the button */
  variant?: 'default' | 'outline' | 'ghost';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Callback when export starts */
  onExportStart?: () => void;
  /** Callback when export succeeds */
  onExportSuccess?: () => void;
  /** Callback when export fails */
  onExportError?: (error: Error) => void;
}

/**
 * ExportButton component for exporting shipment data as CSV.
 * Triggers a file download using the current active filter state.
 */
export function ExportButton({
  filters,
  className = '',
  disabled = false,
  label = 'Export CSV',
  variant = 'outline',
  size = 'sm',
  onExportStart,
  onExportSuccess,
  onExportError,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const buildQueryString = (): string => {
    const params = new URLSearchParams();
    params.set('format', 'csv');

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.origin) {
        params.set('origin', filters.origin);
      }
      if (filters.destination) {
        params.set('destination', filters.destination);
      }
      if (filters.startDate) {
        params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.set('endDate', filters.endDate);
      }
    }

    return params.toString();
  };

  const handleClick = async () => {
    if (exporting || disabled) return;

    setExporting(true);
    onExportStart?.();

    try {
      const queryString = buildQueryString();
      const blob = await apiClient<Blob>(`/shipments/export?${queryString}`, {
        headers: { Accept: 'text/csv' },
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shipments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onExportSuccess?.();
      toast.success('Shipments exported successfully');
    } catch (error) {
      onExportError?.(error as Error);
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Button base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Variant styles
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const buttonClasses = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      disabled={exporting || disabled}
      aria-label="Export shipments as CSV"
      aria-busy={exporting}
    >
      {exporting ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 mr-1.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Exporting…
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4 mr-1.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {label}
        </>
      )}
    </Button>
  );
}