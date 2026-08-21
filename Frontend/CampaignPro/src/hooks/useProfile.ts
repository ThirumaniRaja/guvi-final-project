import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import type { ChangePasswordRequest, UpdateProfileRequest } from '../types/auth';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => userApi.getMe(),
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => userApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => userApi.changePassword(payload),
  });
}
