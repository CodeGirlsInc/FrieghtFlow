import { toast as sonner } from 'sonner';

interface ApiError {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

function extractMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'An unexpected error occurred.';
  const e = err as ApiError;
  if (Array.isArray(e.message)) return e.message[0];
  if (typeof e.message === 'string' && e.message) return e.message;
  if (e.error) return e.error;
  return 'An unexpected error occurred.';
}

export const toast = {
  success: (message: string, description?: string) =>
    sonner.success(message, { description }),

  error: (message: string, description?: string) =>
    sonner.error(message, { description }),

  info: (message: string, description?: string) =>
    sonner.info(message, { description }),

  warning: (message: string, description?: string) =>
    sonner.warning(message, { description }),

  apiError: (err: unknown, fallback = 'Something went wrong.') =>
    sonner.error(extractMessage(err) || fallback),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error?: string },
  ) =>
    sonner.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err: unknown) => extractMessage(err) || messages.error || 'Failed.',
    }),
};
