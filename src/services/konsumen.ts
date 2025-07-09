import axios from '@/lib/axios';
import {
  CreateKonsumenData,
  KonsumenApiResponse,
  KonsumenData,
  KonsumenResponse,
  UseKonsumenListParams
} from '@/types/konsumen';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const konsumenService = {
  // Get paginated list of konsumen
  getList: async ({ page = 1, perPage = 10, search = '' }: UseKonsumenListParams = {}): Promise<KonsumenResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search })
    });

    const response = await axios.get(`/konsumen?${params}`);
    return response.data;
  },

  // Get konsumen by ID
  getById: async (id: number): Promise<KonsumenData> => {
    const response = await axios.get<KonsumenApiResponse>(`/konsumen/${id}`);
    return response.data.data;
  },

  // Create new konsumen
  create: async (data: CreateKonsumenData): Promise<KonsumenData> => {
    const response = await axios.post<KonsumenApiResponse>('/konsumen', data);
    return response.data.data;
  },

  // Update konsumen by ID
  update: async (id: number, data: CreateKonsumenData): Promise<KonsumenData> => {
    const response = await axios.put<KonsumenApiResponse>(`/konsumen/${id}`, data);
    return response.data.data;
  },

  // Delete konsumen by ID
  delete: async (id: number): Promise<KonsumenData> => {
    const response = await axios.delete<KonsumenApiResponse>(`/konsumen/${id}`);
    return response.data.data;
  }
};

export const useKonsumenList = ({ page = 1, perPage = 10, search = '' }: UseKonsumenListParams = {}) => {
  return useQuery({
    queryKey: ['/konsumen', { page, perPage, search }],
    queryFn: (): Promise<KonsumenResponse> => {
      return konsumenService.getList({ page, perPage, search });
    }
  });
};

export const useKonsumenById = (id: number | null) => {
  return useQuery({
    queryKey: ['/konsumen', id],
    queryFn: (): Promise<KonsumenData> => {
      if (!id) throw new Error('ID is required');
      return konsumenService.getById(id);
    },
    enabled: !!id
  });
};

// Mutation hooks
export const useCreateKonsumen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKonsumenData): Promise<KonsumenData> => {
      return konsumenService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch konsumen list
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });
};

export const useUpdateKonsumen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateKonsumenData }): Promise<KonsumenData> => {
      return konsumenService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch konsumen list and specific konsumen
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
      queryClient.invalidateQueries({ queryKey: ['/konsumen', id] });
    }
  });
};

export const useDeleteKonsumen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<KonsumenData> => {
      return konsumenService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch konsumen list
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });
};
