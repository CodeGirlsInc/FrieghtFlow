import { useCallback } from 'react';
import { toast } from 'sonner';
import { handleApiError } from '../lib/api/error-handler';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    const message = handleApiError(error);
    toast.error(message);
  }, []);

  return { handleError };
}
