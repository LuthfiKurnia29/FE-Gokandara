import axios from '@/lib/axios';
import {
  CreateSkemaPembayaranData,
  SkemaPembayaran,
  SkemaPembayaranApiResponse,
  SkemaPembayaranResponse,
  UpdateSkemaPembayaranData,
  UseSkemaPembayaranListParams
} from '@/types/skema-pembayaran';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const skemaPembayaranService = {
  // Get all skema pembayaran (for dropdowns)
  getAll: async (): Promise<SkemaPembayaran[]> => {
    const response = await axios.get('/all-skema-pembayaran');
    return response.data;
  },

  // Get paginated list of skema pembayaran
  getList: async ({
    page = 1,
    perPage = 10,
    search = ''
  }: UseSkemaPembayaranListParams = {}): Promise<SkemaPembayaranResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per: perPage.toString(),
      ...(search && { search })
    });

    const response = await axios.get(`/list-skema-pembayaran?${params}`);
    return response.data;
  },

  // Create new skema pembayaran
  create: async (data: CreateSkemaPembayaranData): Promise<SkemaPembayaranApiResponse> => {
    const response = await axios.post<SkemaPembayaranApiResponse>('/create-skema-pembayaran', data);
    return response.data;
  },

  // Update skema pembayaran by ID
  update: async (id: number, data: UpdateSkemaPembayaranData): Promise<SkemaPembayaranApiResponse> => {
    const response = await axios.put<SkemaPembayaranApiResponse>(`/update-skema-pembayaran/${id}`, data);
    return response.data;
  },

  // Delete skema pembayaran by ID
  delete: async (id: number): Promise<SkemaPembayaranApiResponse> => {
    const response = await axios.delete<SkemaPembayaranApiResponse>(`/delete-skema-pembayaran/${id}`);
    return response.data;
  }
};

// Query hooks
export const useAllSkemaPembayaran = () => {
  return useQuery({
    queryKey: ['/all-skema-pembayaran'],
    queryFn: (): Promise<SkemaPembayaran[]> => {
      return skemaPembayaranService.getAll();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useSkemaPembayaranList = ({ page = 1, perPage = 10, search = '' }: UseSkemaPembayaranListParams = {}) => {
  return useQuery({
    queryKey: ['/list-skema-pembayaran', { page, perPage, search }],
    queryFn: (): Promise<SkemaPembayaranResponse> => {
      return skemaPembayaranService.getList({ page, perPage, search });
    }
  });
};

// Mutation hooks
export const useCreateSkemaPembayaran = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSkemaPembayaranData): Promise<SkemaPembayaranApiResponse> => {
      return skemaPembayaranService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch skema pembayaran lists
      queryClient.invalidateQueries({ queryKey: ['/list-skema-pembayaran'] });
      queryClient.invalidateQueries({ queryKey: ['/all-skema-pembayaran'] });
    }
  });
};

export const useUpdateSkemaPembayaran = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number;
      data: UpdateSkemaPembayaranData;
    }): Promise<SkemaPembayaranApiResponse> => {
      return skemaPembayaranService.update(id, data);
    },
    onSuccess: () => {
      // Invalidate and refetch skema pembayaran lists
      queryClient.invalidateQueries({ queryKey: ['/list-skema-pembayaran'] });
      queryClient.invalidateQueries({ queryKey: ['/all-skema-pembayaran'] });
    }
  });
};

export const useDeleteSkemaPembayaran = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<SkemaPembayaranApiResponse> => {
      return skemaPembayaranService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch skema pembayaran lists
      queryClient.invalidateQueries({ queryKey: ['/list-skema-pembayaran'] });
      queryClient.invalidateQueries({ queryKey: ['/all-skema-pembayaran'] });
    }
  });
};
