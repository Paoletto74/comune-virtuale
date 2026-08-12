import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.me(),
    retry: false,
  });
}

export function useHome(enabled: boolean) {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => api.home(),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
