import {
  CarrierCertification,
} from "../components/CertificationUpload/certification.types";

export async function uploadCertification(
  formData: FormData
) {
  const response = await fetch(
    "/api/carriers/certifications",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to upload certification"
    );
  }

  return response.json();
}

export async function getCertifications() {
  const response = await fetch(
    "/api/carriers/certifications"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load certifications"
    );
  }

  return response.json() as Promise<
    CarrierCertification[]
  >;
}

export async function deleteCertification(
  certificationId: string
) {
  const response = await fetch(
    `/api/carriers/certifications/${certificationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete certification"
    );
  }
}