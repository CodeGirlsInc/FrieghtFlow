import { useEffect, useState } from "react";

import {
  getCertifications,
} from "../services/certifications";

import {
  CarrierCertification,
} from "../components/CertificationUpload/certification.types";

export function useCarrierCertifications() {
  const [
    certifications,
    setCertifications,
  ] = useState<
    CarrierCertification[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

    try {
      const data =
        await getCertifications();

      setCertifications(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    certifications,
    loading,
    refresh: load,
  };
}