
import { useQuery } from '@tanstack/react-query';
import { researchService, ResearchPublication, FundingCall, EducationMetrics } from '@/services/researchService';

export const useResearchPublications = (organizationId?: string) => {
  return useQuery({
    queryKey: ['research-publications', organizationId],
    queryFn: () => researchService.getPublications(organizationId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const useFundingCalls = (organizationId?: string) => {
  return useQuery({
    queryKey: ['funding-calls', organizationId],
    queryFn: () => researchService.getFundingCalls(organizationId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const useEducationMetrics = (region?: string) => {
  return useQuery({
    queryKey: ['education-metrics', region],
    queryFn: () => researchService.getEducationMetrics(region),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const useResearchTrends = (region?: string) => {
  return useQuery({
    queryKey: ['research-trends', region],
    queryFn: () => researchService.getResearchTrends(region),
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
};
