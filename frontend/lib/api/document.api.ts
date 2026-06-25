import { apiClient } from './client';

export interface Document {
  id: string;
  fileName: string;
  documentType: string;
  mimeType: string;
  fileSize: number;
  uploadDate: string;
  ipfsStatus: 'pinned' | 'pending' | null;
  ipfsCid: string | null;
  sha256Hash: string | null;
  stellarTxHash: string | null;
  anchorStatus: 'anchored' | 'pending' | 'failed' | null;
  shipmentId: string | null;
  shipmentTrackingNumber: string | null;
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
  page: number;
  limit: number;
}

export interface DocumentListParams {
  documentType?: string;
  trackingNumber?: string;
  page?: number;
  limit?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1';

export const documentApi = {
  list(params: DocumentListParams = {}): Promise<PaginatedDocuments> {
    const q = new URLSearchParams();
    if (params.documentType) q.set('documentType', params.documentType);
    if (params.trackingNumber) q.set('trackingNumber', params.trackingNumber);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient(`/documents${qs ? '?' + qs : ''}`);
  },

  getById(id: string): Promise<Document> {
    return apiClient(`/documents/${id}`);
  },

  async download(id: string, fileName: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}/download`, {
      headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') ?? '' : ''}` },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },

  delete(id: string): Promise<void> {
    return apiClient(`/documents/${id}`, { method: 'DELETE' });
  },
};
