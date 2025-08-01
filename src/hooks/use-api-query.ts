import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export interface UseApiQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  staleTime?: number;
}

export function useApiQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchOnWindowFocus = false,
  retry = 3,
  staleTime = 5 * 60 * 1000, // 5 minutes
}: UseApiQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchOnWindowFocus,
    retry,
    staleTime,
  });
}

export interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: AxiosError, variables: TVariables) => void;
  invalidateQueries?: string[][];
}

export function useApiMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      onSuccess?.(data, variables);
    },
    onError,
  });
}