import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { QUERY_KEYS } from '../constants/queryKeys';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.analyticsOverview,
    queryFn: () => analyticsApi.overview(),
    staleTime: 60_000,
  });
}

export function useCampaignAnalytics(id: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.campaignAnalytics(id ?? 0),
    queryFn: () => analyticsApi.campaign(id as number),
    enabled: id !== undefined,
    staleTime: 30_000,
  });
}
