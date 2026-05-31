export type CertificationType =
  | "OPERATING_LICENSE"
  | "INSURANCE_CERTIFICATE"
  | "SAFETY_CERTIFICATION"
  | "HAZMAT_LICENSE"
  | "VEHICLE_REGISTRATION";

export type CertificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export interface CarrierCertification {
  id: string;

  type: CertificationType;

  fileName: string;

  uploadDate: string;

  expiryDate?: string;

  notes?: string;

  status: CertificationStatus;
}