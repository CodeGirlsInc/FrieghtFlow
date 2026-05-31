import { CertificationType } from "./certification.types";

export const CERTIFICATION_OPTIONS: {
  label: string;
  value: CertificationType;
}[] = [
  {
    label: "Operating License",
    value: "OPERATING_LICENSE",
  },
  {
    label: "Insurance Certificate",
    value: "INSURANCE_CERTIFICATE",
  },
  {
    label: "Safety Certification",
    value: "SAFETY_CERTIFICATION",
  },
  {
    label: "Hazmat License",
    value: "HAZMAT_LICENSE",
  },
  {
    label: "Vehicle Registration",
    value: "VEHICLE_REGISTRATION",
  },
];