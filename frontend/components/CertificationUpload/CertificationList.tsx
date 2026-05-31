import {
  CarrierCertification,
} from "./certification.types";

import {
  CertificationCard,
} from "./CertificationCard";

interface Props {
  certifications:
    CarrierCertification[];

  onDelete: (
    id: string
  ) => void;
}

export function CertificationList({
  certifications,
  onDelete,
}: Props) {
  return (
    <div className="space-y-4">
      {certifications.map(
        (certification) => (
          <CertificationCard
            key={
              certification.id
            }
            certification={
              certification
            }
            onDelete={onDelete}
          />
        )
      )}
    </div>
  );
}