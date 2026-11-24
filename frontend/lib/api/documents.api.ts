import { apiClient, getApiUrl, uploadWithProgress } from './client';

export enum DocumentType {
  BILL_OF_LADING = 'bill_of_lading',
  PROOF_OF_DELIVERY = 'proof_of_delivery',
  INVOICE = 'invoice',
  CUSTOMS_DECLARATION = 'customs_declaration',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  CARRIER_CERTIFICATION = 'carrier_certification',
  PHOTO = 'photo',
  OTHER = 'other',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.BILL_OF_LADING]: 'Bill of Lading',
  [DocumentType.PROOF_OF_DELIVERY]: 'Proof of Delivery',
  [DocumentType.INVOICE]: 'Invoice',
  [DocumentType.CUSTOMS_DECLARATION]: 'Customs Declaration',
  [DocumentType.INSURANCE_CERTIFICATE]: 'Insurance Certificate',
  [DocumentType.CARRIER_CERTIFICATION]: 'Carrier Certification',
  [DocumentType.PHOTO]: 'Photo',
  [DocumentType.OTHER]: 'Other',
};

export interface DocumentMetadata {
  id: string;
  shipmentId: string | null;
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
    return getApiUrl(`/documents/${id}/download`);
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
    signal?: AbortSignal,
  ): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shipmentId', payload.shipmentId);
    formData.append('documentType', payload.documentType);
    if (payload.notes) formData.append('notes', payload.notes);

    return uploadWithProgress<DocumentMetadata>(
      '/documents/upload',
      formData,
      onProgress,
      signal,
    );
  },

  uploadCertificationDocument(
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal,
  ): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    return uploadWithProgress<DocumentMetadata>(
      '/documents/certification',
      formData,
      onProgress,
      signal,
    );
  },
};
