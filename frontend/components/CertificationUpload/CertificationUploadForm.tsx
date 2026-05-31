import { useState } from "react";

import {
  CERTIFICATION_OPTIONS,
} from "./certification.constants";

import {
  validateCertificationFile,
} from "./certification.validation";

import {
  uploadCertification,
  deleteCertification,
} from "../../services/certifications";

import {
  useCarrierCertifications,
} from "../../hooks/useCarrierCertifications";

import {
  CertificationList,
} from "./CertificationList";

export function CertificationUploadForm() {
  const {
    certifications,
    refresh,
  } =
    useCarrierCertifications();

  const [type, setType] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [expiryDate, setExpiryDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!file) {
      setError(
        "Please upload a PDF file."
      );
      return;
    }

    const validation =
      validateCertificationFile(
        file
      );

    if (validation) {
      setError(validation);
      return;
    }

    const formData =
      new FormData();

    formData.append("type", type);
    formData.append("file", file);

    if (expiryDate) {
      formData.append(
        "expiryDate",
        expiryDate
      );
    }

    if (notes) {
      formData.append(
        "notes",
        notes
      );
    }

    await uploadCertification(
      formData
    );

    setType("");
    setFile(null);
    setExpiryDate("");
    setNotes("");

    await refresh();
  }

  async function handleDelete(
    id: string
  ) {
    await deleteCertification(id);

    await refresh();
  }

  return (
    <div className="space-y-6">

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <select
          required
          value={type}
          onChange={(e) =>
            setType(
              e.target.value
            )
          }
        >
          <option value="">
            Select certification
          </option>

          {CERTIFICATION_OPTIONS.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] ??
                null
            )
          }
        />

        <input
          type="date"
          value={expiryDate}
          onChange={(e) =>
            setExpiryDate(
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
        />

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <button type="submit">
          Upload Certification
        </button>
      </form>

      <CertificationList
        certifications={
          certifications
        }
        onDelete={handleDelete}
      />
    </div>
  );
}