interface Props {
  status:
    | "PENDING"
    | "VERIFIED"
    | "REJECTED";
}

export function CertificationStatusBadge({
  status,
}: Props) {
  const styles = {
    PENDING:
      "bg-yellow-100 text-yellow-800",
    VERIFIED:
      "bg-green-100 text-green-800",
    REJECTED:
      "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2
        py-1
        text-xs
        font-medium
        ${styles[status]}
      `}
    >
      {status}
    </span>
  );
}