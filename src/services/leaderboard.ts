import axios from '@/lib/axios';
import { DashboardQueryParams } from '@/types/dashboard';
import { LeaderboardResponse, UseLeaderboardListParams } from '@/types/leaderboard';
import { useQuery } from '@tanstack/react-query';

export const leaderboardService = {
  // Get leaderboard list
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    member_id
  }: UseLeaderboardListParams = {}): Promise<LeaderboardResponse> => {
    const response = await axios.get(`/leaderboard`, {
      params: {
        page,
        per: perPage,
        per_page: perPage,
        search,
        ...(member_id ? { member_id } : {})
      }
    });
    return response.data;
  },

  // Get top 3 leaderboard cards
  getTop3: async (params?: { dateStart?: string; dateEnd?: string }) => {
    const response = await axios.get(`/leaderboard/top-3`, { params });
    return response.data as any[];
  }
};

// Query hook
export const useLeaderboardList = ({
  page = 1,
  perPage = 10,
  search = '',
  member_id
}: UseLeaderboardListParams = {}) => {
  return useQuery({
    queryKey: ['/leaderboard', { page, perPage, search, member_id }],
    queryFn: (): Promise<LeaderboardResponse> => {
      return leaderboardService.getList({ page, perPage, search, member_id });
    }
  });
};

// Hook for top 3 leaderboard
export const useTop3Leaderboard = (params?: { dateStart?: string; dateEnd?: string }) => {
  return useQuery({
    queryKey: ['/leaderboard/top-3', params],
    queryFn: () => leaderboardService.getTop3(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

// Hook for dashboard top 3 leaderboard with filter params
export const useDashboardTop3Leaderboard = (filterParams?: DashboardQueryParams) => {
  return useQuery({
    queryKey: ['/leaderboard/top-3', 'dashboard', filterParams],
    queryFn: () =>
      leaderboardService.getTop3({
        dateStart: filterParams?.dateStart,
        dateEnd: filterParams?.dateEnd
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};
