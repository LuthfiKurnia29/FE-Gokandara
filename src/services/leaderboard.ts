import axios from '@/lib/axios';
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
