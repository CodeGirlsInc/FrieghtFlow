'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { getCurrentUser } from '../lib/api/auth.api';
import type { User } from '../types/auth.types';

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60_000,
  });
}
