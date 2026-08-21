import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../api/contactsApi';
import type { ContactListParams } from '../api/contactsApi';
import type { ContactRequest } from '../types/contact';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useContacts(params: ContactListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.contacts(params),
    queryFn: () => contactsApi.list(params),
    staleTime: 30_000,
  });
}

export function useContact(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.contact(id ?? 0),
    queryFn: () => contactsApi.get(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactRequest) => contactsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ContactRequest }) => contactsApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contact(variables.id) });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
