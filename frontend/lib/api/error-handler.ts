interface ApiError {
  message?: string;
  statusCode?: number;
  error?: string;
}

function getStatusMessage(statusCode: number): string {
  switch (statusCode) {
    case 401:
      return 'Session expired. Please sign in again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return 'Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      if (statusCode >= 500) {
        return 'Something went wrong on our end. Please try again later.';
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

export function handleApiError(error: unknown): string {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.statusCode) {
      return getStatusMessage(apiError.statusCode);
    }
    if (apiError.message) {
      return apiError.message;
    }
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
}
