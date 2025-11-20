import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/agents';

// Query keys
export const statsKeys = {
  all: ['stats'] as const,
  dashboard: () => [...statsKeys.all, 'dashboard'] as const,
};

// Get dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: statsApi.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes for real-time updates
  });
};
