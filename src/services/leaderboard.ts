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
    const params = new URLSearchParams({
      page: page.toString(),
      per: perPage.toString(),
      ...(search && { search }),
      ...(member_id && { member_id: member_id.toString() })
    });

    const response = await axios.get(`/leaderboard?${params}`);
    return response.data;
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
