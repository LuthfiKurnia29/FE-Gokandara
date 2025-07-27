import axios from '@/lib/axios';
import {
  CreatePesanData,
  PesanApiResponse,
  PesanData,
  PesanPaginationResponse,
  UsePesanListParams
} from '@/types/pesan';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Message Services
export const pesanService = {
  // Get paginated list of messages
  getList: async ({ page = 1, perPage = 10, id_user }: UsePesanListParams): Promise<PesanPaginationResponse> => {
    const response = await axios.get('/chatting', {
      params: { id_user, page, perPage }
    });
    return response.data;
  },

  // Create new message
  create: async (data: CreatePesanData): Promise<PesanData> => {
    const response = await axios.post<PesanApiResponse>('/chatting', data);
    return response.data.data;
  }
};

// React Query Hooks for Messages
export const usePesanList = ({ perPage = 10, id_user }: Omit<UsePesanListParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['/chatting', { perPage, id_user }],
    queryFn: ({ pageParam = 1 }) => pesanService.getList({ page: pageParam, perPage, id_user }),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    // Merge pages for infinite scroll
    select: (data) => ({
      ...data,
      flatData: data.pages.flatMap((page) => page.data).reverse()
    })
  });
};

// Mutation hooks for Messages
export const useCreatePesan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePesanData): Promise<PesanData> => {
      return pesanService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch pesan list
      queryClient.invalidateQueries({ queryKey: ['/chatting'] });
    }
  });
};
