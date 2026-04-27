'use client';

import { useState } from 'react';
import { DocumentChecklist } from './DocumentChecklist';
import type { ShipmentDocument, DocumentType } from './DocumentChecklist';

interface DocumentChecklistDemoProps {
  title: string;
  initialDocuments: ShipmentDocument[];
}

export function DocumentChecklistDemo({ title, initialDocuments }: DocumentChecklistDemoProps) {
  const [documents, setDocuments] = useState<ShipmentDocument[]>(initialDocuments);

  function handleUpload(type: DocumentType) {
    const now = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.type === type ? { ...doc, status: 'uploaded', uploadedAt: now } : doc,
      ),
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      <DocumentChecklist documents={documents} onUpload={handleUpload} />
    </div>
  );
}
