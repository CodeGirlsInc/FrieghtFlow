import { apiClient } from './client';

export enum CertificationType {
  OPERATING_LICENSE = 'Operating License',
  INSURANCE_CERTIFICATE = 'Insurance Certificate',
  SAFETY_CERTIFICATION = 'Safety Certification',
  HAZMAT_CERTIFICATION = 'Hazmat Certification',
  VEHICLE_REGISTRATION = 'Vehicle Registration',
  OTHER = 'Other',
}

export interface CarrierCertification {
  id: string;
  carrierId: string;
  documentType: CertificationType;
  documentId: string | null;
  fileUrl: string | null;
  issuedBy: string;
  expiresAt: string | null;
  isVerified: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarrierCertificationPayload {
  documentType: CertificationType;
  documentId: string;
  issuedBy: string;
  expiresAt?: string;
  notes?: string;
}

export const carrierCertificationsApi = {
  listMine(): Promise<CarrierCertification[]> {
    return apiClient<CarrierCertification[]>('/carriers/me/certifications');
  },

  create(payload: CreateCarrierCertificationPayload): Promise<CarrierCertification> {
    return apiClient<CarrierCertification>('/carriers/me/certifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  remove(id: string): Promise<void> {
    return apiClient<void>(`/carriers/me/certifications/${id}`, {
      method: 'DELETE',
    });
  },
};
