'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url: string;
}

interface DocumentListProps {
  shipmentId: string;
}

export function DocumentList({ shipmentId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [shipmentId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/documents`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading documents...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Documents</h3>
      {documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <a
                  href={`${doc.url}/download`}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
