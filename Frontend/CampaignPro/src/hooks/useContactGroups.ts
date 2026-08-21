import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactGroupsApi } from '../api/contactGroupsApi';
import type { AddMembersRequest, ContactGroupRequest } from '../types/contactGroup';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useContactGroups() {
  return useQuery({
    queryKey: QUERY_KEYS.contactGroups,
    queryFn: () => contactGroupsApi.list(),
    staleTime: 30_000,
  });
}

export function useCreateContactGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactGroupRequest) => contactGroupsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contactGroups });
    },
  });
}

export function useDeleteContactGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactGroupsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contactGroups });
    },
  });
}

export function useAddGroupMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddMembersRequest }) => contactGroupsApi.addMembers(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contactGroups });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contactId }: { id: number; contactId: number }) => contactGroupsApi.removeMember(id, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contactGroups });
    },
  });
}
