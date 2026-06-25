import { apiClient } from './client';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  status: 'active' | 'revoked';
}

export interface GenerateApiKeyPayload {
  name: string;
  expiresAt?: string;
}

export interface GenerateApiKeyResponse extends ApiKey {
  /** Full key shown exactly once at creation time. */
  key: string;
}

export const apiKeysApi = {
  list(): Promise<ApiKey[]> {
    return apiClient('/api-keys');
  },

  generate(payload: GenerateApiKeyPayload): Promise<GenerateApiKeyResponse> {
    return apiClient('/api-keys', { method: 'POST', body: JSON.stringify(payload) });
  },

  revoke(id: string): Promise<void> {
    return apiClient(`/api-keys/${id}`, { method: 'DELETE' });
  },
};
