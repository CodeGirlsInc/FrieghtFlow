'use client';

import { Check, X, Minus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DocumentType =
  | 'bill_of_lading'
  | 'commercial_invoice'
  | 'packing_list'
  | 'certificate_of_origin'
  | 'customs_declaration';

export type DocumentStatus = 'uploaded' | 'missing' | 'optional';

export interface ShipmentDocument {
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt?: string;
}

interface DocumentChecklistProps {
  documents: ShipmentDocument[];
  onUpload?: (type: DocumentType) => void;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  bill_of_lading:        'Bill of Lading',
  commercial_invoice:    'Commercial Invoice',
  packing_list:          'Packing List',
  certificate_of_origin: 'Certificate of Origin',
  customs_declaration:   'Customs Declaration',
};

export function DocumentChecklist({ documents, onUpload }: DocumentChecklistProps) {
  const uploaded = documents.filter((d) => d.status === 'uploaded').length;
  const missing  = documents.filter((d) => d.status === 'missing').length;
  const total    = uploaded + missing;
  const pct      = total === 0 ? 100 : Math.round((uploaded / total) * 100);
  const allDone  = pct === 100 && missing === 0;

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className={cn('font-medium', allDone ? 'text-green-700' : 'text-gray-700')}>
            {allDone ? 'All required documents uploaded' : `${uploaded} of ${total} required documents uploaded`}
          </span>
          <span className={cn('font-semibold tabular-nums', allDone ? 'text-green-600' : 'text-gray-500')}>
            {pct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              allDone ? 'bg-green-500' : 'bg-blue-500',
            )}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Document list */}
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {documents.map((doc) => {
          const label = DOCUMENT_LABELS[doc.type];

          return (
            <li key={doc.type} className="flex items-center gap-4 px-4 py-3.5">
              {/* Status icon */}
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  doc.status === 'uploaded' && 'bg-green-100',
                  doc.status === 'missing'  && 'bg-red-100',
                  doc.status === 'optional' && 'bg-gray-100',
                )}
              >
                {doc.status === 'uploaded' && (
                  <Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
                )}
                {doc.status === 'missing' && (
                  <X className="h-4 w-4 text-red-500" strokeWidth={2.5} />
                )}
                {doc.status === 'optional' && (
                  <Minus className="h-4 w-4 text-gray-400" strokeWidth={2} />
                )}
              </div>

              {/* Label + meta */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    doc.status === 'uploaded' && 'text-gray-900',
                    doc.status === 'missing'  && 'text-gray-900',
                    doc.status === 'optional' && 'text-gray-400',
                  )}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {doc.status === 'uploaded'
                    ? doc.uploadedAt
                      ? `Uploaded ${doc.uploadedAt}`
                      : 'Uploaded'
                    : doc.status === 'missing'
                    ? 'Required — not yet uploaded'
                    : 'Optional'}
                </p>
              </div>

              {/* Upload button */}
              {doc.status === 'missing' && onUpload && (
                <button
                  onClick={() => onUpload(doc.type)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
