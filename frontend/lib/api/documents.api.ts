import { apiClient, getAccessToken } from './client';

export enum DocumentType {
  BILL_OF_LADING = 'bill_of_lading',
  PROOF_OF_DELIVERY = 'proof_of_delivery',
  INVOICE = 'invoice',
  CUSTOMS_DECLARATION = 'customs_declaration',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  PHOTO = 'photo',
  OTHER = 'other',
}

export interface DocumentMetadata {
  id: string;
  shipmentId: string;
  uploaderId: string;
  documentType: DocumentType;
  originalName: string;
  mimetype: string;
  sizeBytes: number;
  notes: string | null;
  createdAt: string;
}

export interface UploadDocumentPayload {
  shipmentId: string;
  documentType: DocumentType;
  notes?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1';

/**
 * FE-107 — centralizes document upload/list/retrieval so it's reusable
 * outside DocumentUploadModal and DocumentViewer (e.g. a shipment detail
 * page listing its documents without duplicating fetch logic).
 */
export const documentsApi = {
  listByShipment(shipmentId: string): Promise<DocumentMetadata[]> {
    return apiClient(`/documents/shipment/${shipmentId}`);
  },

  getById(id: string): Promise<DocumentMetadata> {
    return apiClient(`/documents/${id}`);
  },

  /**
   * Direct-download URL for a document (streams via the backend, which
   * authenticates the request via the session cookie).
   */
  getDownloadUrl(id: string): string {
    return `${API_BASE}/documents/${id}/download`;
  },

  remove(id: string): Promise<void> {
    return apiClient(`/documents/${id}`, { method: 'DELETE' });
  },

  /**
   * Uploads a single file. Uses XMLHttpRequest directly (rather than the
   * fetch-based apiClient) so upload progress can be reported via
   * onProgress. The backend accepts exactly one file per request, so a
   * caller uploading multiple files should call this once per file.
   */
  upload(
    file: File,
    payload: UploadDocumentPayload,
    onProgress?: (percent: number) => void,
  ): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shipmentId', payload.shipmentId);
    formData.append('documentType', payload.documentType);
    if (payload.notes) formData.append('notes', payload.notes);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/documents/upload`);

      const token = getAccessToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as DocumentMetadata);
          } catch {
            resolve({} as DocumentMetadata);
          }
        } else {
          reject(new Error(xhr.statusText || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  },
};
