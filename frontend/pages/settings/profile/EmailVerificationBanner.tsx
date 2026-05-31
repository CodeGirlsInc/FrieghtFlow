interface Props {
  visible: boolean;
}

export function EmailVerificationBanner({
  visible,
}: Props) {

  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        rounded-md
        border
        border-yellow-300
        bg-yellow-50
        p-4
      "
    >
      <p
        className="
          text-sm
          text-yellow-800
        "
      >
        Please verify your
        new email address
        after saving changes.
      </p>
    </div>
  );
}