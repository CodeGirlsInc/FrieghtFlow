import {
  CarrierCertification,
} from "./certification.types";

import {
  CertificationStatusBadge,
} from "./CertificationStatusBadge";

interface Props {
  certification:
    CarrierCertification;

  onDelete: (
    id: string
  ) => void;
}

export function CertificationCard({
  certification,
  onDelete,
}: Props) {
  const canDelete =
    certification.status ===
      "PENDING" ||
    certification.status ===
      "REJECTED";

  return (
    <div className="rounded-lg border p-4">

      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {certification.type}
        </h4>

        <CertificationStatusBadge
          status={
            certification.status
          }
        />
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Uploaded:
        {" "}
        {certification.uploadDate}
      </div>

      {certification.expiryDate && (
        <div className="text-sm text-gray-500">
          Expiry:
          {" "}
          {certification.expiryDate}
        </div>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={() =>
            onDelete(
              certification.id
            )
          }
          className="
            mt-3
            text-red-600
            text-sm
          "
        >
          Delete
        </button>
      )}
    </div>
  );
}