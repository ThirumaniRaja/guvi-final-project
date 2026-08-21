import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../api/templatesApi';
import type { TemplateListParams } from '../api/templatesApi';
import type { PreviewRequest, TemplateRequest } from '../types/template';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.templates(params),
    queryFn: () => templatesApi.list(params),
    staleTime: 30_000,
  });
}

export function useTemplate(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.template(id ?? 0),
    queryFn: () => templatesApi.get(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplateRequest) => templatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TemplateRequest }) => templatesApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.template(variables.id) });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => templatesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PreviewRequest }) => templatesApi.preview(id, payload),
  });
}
