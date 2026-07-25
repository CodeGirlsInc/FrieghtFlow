import { apiClient } from './client';

export interface CreateAddressPayload {
  label: string;
  address: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

export const addressesApi = {
  create: (payload: CreateAddressPayload) =>
    apiClient<void>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
