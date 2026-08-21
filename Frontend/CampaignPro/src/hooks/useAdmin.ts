import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { AdminUserListParams } from '../api/adminApi';
import type { UpdateUserStatusRequest } from '../types/admin';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers(params),
    queryFn: () => adminApi.users(params),
    staleTime: 15_000,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboard,
    queryFn: () => adminApi.dashboard(),
    staleTime: 30_000,
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: QUERY_KEYS.adminActivity,
    queryFn: () => adminApi.activity(),
    staleTime: 30_000,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserStatusRequest }) =>
      adminApi.updateUserStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
    },
  });
}
