import { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ illustration, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
      {illustration && (
        <div className="text-muted-foreground/50" aria-hidden="true">
          {illustration}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {cta && (
        <Button onClick={cta.onClick} size="sm">
          {cta.label}
        </Button>
      )}
    </div>
  );
}

/* ── Pre-built contextual empty states ── */

export function EmptyShipments({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      illustration={
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="10" y="30" width="60" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M10 42h60" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M28 42v24" stroke="currentColor" strokeWidth="2"/>
          <rect x="22" y="18" width="36" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <circle cx="24" cy="70" r="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <circle cx="56" cy="70" r="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        </svg>
      }
      title="No shipments yet"
      description="Create your first shipment to get started."
      cta={onCreate ? { label: 'Create your first shipment', onClick: onCreate } : undefined}
    />
  );
}

export function EmptyMarketplace() {
  return (
    <EmptyState
      illustration={
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M28 40h24M40 28v24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      }
      title="No available shipments"
      description="Check back later — new shipments will appear here when posted."
    />
  );
}

export function EmptyDocuments({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      illustration={
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="18" y="10" width="44" height="56" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M18 26h44" stroke="currentColor" strokeWidth="2"/>
          <path d="M28 38h24M28 48h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M44 10v16h18" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
      }
      title="No documents uploaded"
      description="Upload bills of lading, invoices, and other shipment documents."
      cta={onUpload ? { label: 'Upload a document', onClick: onUpload } : undefined}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      illustration={
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M40 14a20 20 0 0 1 20 20v10l6 8H14l6-8V34A20 20 0 0 1 40 14z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M34 62a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      }
      title="No notifications"
      description="You're all caught up! New activity will appear here."
    />
  );
}
