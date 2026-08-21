import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaignsApi';
import type { CampaignListParams } from '../api/campaignsApi';
import type { CreateCampaignRequest, ScheduleCampaignRequest, UpdateCampaignRequest } from '../types/campaign';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useCampaigns(params: CampaignListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.campaigns(params),
    queryFn: () => campaignsApi.list(params),
    staleTime: 15_000,
  });
}

export function useCampaign(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.campaign(id ?? 0),
    queryFn: () => campaignsApi.get(id as number),
    enabled: id !== undefined,
  });
}

export function useCampaignRecipients(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.campaignRecipients(id ?? 0),
    queryFn: () => campaignsApi.recipients(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignRequest) => campaignsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCampaignRequest }) => campaignsApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(variables.id) });
    },
  });
}

export function useSendCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignsApi.sendNow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(id) });
    },
  });
}

export function useScheduleCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ScheduleCampaignRequest }) => campaignsApi.schedule(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(variables.id) });
    },
  });
}

export function useCancelCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignsApi.cancel(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(id) });
    },
  });
}
