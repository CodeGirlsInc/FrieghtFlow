interface Props {
  onRetry: () => void;
}

export function DefaultErrorFallback({
  onRetry,
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        p-8
        text-center
      "
    >
      <div className="mb-4 text-5xl">
        ⚠️
      </div>

      <h2
        className="
          text-xl
          font-semibold
        "
      >
        Something went wrong
      </h2>

      <p
        className="
          mt-2
          text-sm
          text-gray-500
        "
      >
        An unexpected error occurred.
        Please try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="
          mt-4
          rounded-md
          bg-blue-600
          px-4
          py-2
          text-white
        "
      >
        Try Again
      </button>
    </div>
  );
}