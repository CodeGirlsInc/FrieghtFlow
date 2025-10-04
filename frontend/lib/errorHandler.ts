export type ApiError = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
};

/**
 * Maps API status codes and known error codes to user-friendly messages.
 */
const errorMessages: Record<string | number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Authentication required. Please log in.",
  403: "You don’t have permission to perform this action.",
  404: "The requested resource was not found.",
  408: "The request timed out. Please try again.",
  500: "A server error occurred. Please try again later.",
  ECONNABORTED: "The request took too long. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
};

/**
 * Normalizes raw API/axios/fetch errors into a consistent shape.
 */
export function handleApiError(err: any): ApiError {
  const status = err.response?.status ?? 500;
  const code = err.code ?? err.response?.data?.code;
  const message =
    errorMessages[status] ||
    errorMessages[code] ||
    err.response?.data?.message ||
    "An unexpected error occurred.";

  const normalized: ApiError = {
    status,
    code,
    message,
    details: err.response?.data ?? err.message,
  };

  if (process.env.NODE_ENV === "development") {
    // Developers get detailed logs in dev mode
    console.error("[API ERROR]", normalized);
  }

  return normalized;
}
