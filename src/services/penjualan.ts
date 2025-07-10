import axios from '@/lib/axios';
import {
  CreatePenjualanData,
  PenjualanApiResponse,
  PenjualanData,
  PenjualanResponse,
  PenjualanWithRelations,
  UpdatePenjualanData,
  UpdatePenjualanStatusData,
  UsePenjualanListParams
} from '@/types/penjualan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const penjualanService = {
  // Get paginated list of penjualan
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    status,
    konsumenId,
    include
  }: UsePenjualanListParams = {}): Promise<PenjualanResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(konsumenId && { konsumen_id: konsumenId.toString() }),
      ...(include && include.length > 0 && { include: include.join(',') })
    });

    const response = await axios.get(`/penjualan?${params}`);
    return response.data;
  },

  // Get penjualan by ID
  getById: async (id: number, include?: string[]): Promise<PenjualanWithRelations> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/penjualan/${id}${params.toString() ? `?${params}` : ''}`;
    const response = await axios.get<PenjualanApiResponse>(url);
    return response.data.data;
  },

  // Create new penjualan
  create: async (data: CreatePenjualanData): Promise<PenjualanWithRelations> => {
    const response = await axios.post<PenjualanApiResponse>('/penjualan', data);
    return response.data.data;
  },

  // Update penjualan by ID
  update: async (id: number, data: UpdatePenjualanData): Promise<PenjualanWithRelations> => {
    const response = await axios.put<PenjualanApiResponse>(`/penjualan/${id}`, data);
    return response.data.data;
  },

  // Partial update penjualan by ID
  partialUpdate: async (id: number, data: UpdatePenjualanData): Promise<PenjualanWithRelations> => {
    const response = await axios.patch<PenjualanApiResponse>(`/penjualan/${id}`, data);
    return response.data.data;
  },

  // Update penjualan status only
  updateStatus: async (id: number, data: UpdatePenjualanStatusData): Promise<PenjualanWithRelations> => {
    const response = await axios.patch<PenjualanApiResponse>(`/penjualan/${id}/status`, data);
    return response.data.data;
  },

  // Delete penjualan by ID
  delete: async (id: number): Promise<PenjualanWithRelations> => {
    const response = await axios.delete<PenjualanApiResponse>(`/penjualan/${id}`);
    return response.data.data;
  }
};

// Query hooks
export const usePenjualanList = ({
  page = 1,
  perPage = 10,
  search = '',
  status,
  konsumenId,
  include
}: UsePenjualanListParams = {}) => {
  return useQuery({
    queryKey: ['/penjualan', { page, perPage, search, status, konsumenId, include }],
    queryFn: (): Promise<PenjualanResponse> => {
      return penjualanService.getList({ page, perPage, search, status, konsumenId, include });
    }
  });
};

export const usePenjualanById = (id: number | null, include?: string[]) => {
  return useQuery({
    queryKey: ['/penjualan', id, { include }],
    queryFn: (): Promise<PenjualanWithRelations> => {
      if (!id) throw new Error('ID is required');
      return penjualanService.getById(id, include);
    },
    enabled: !!id
  });
};

// Mutation hooks
export const useCreatePenjualan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePenjualanData): Promise<PenjualanWithRelations> => {
      return penjualanService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch penjualan list
      queryClient.invalidateQueries({ queryKey: ['/penjualan'] });
    }
  });
};

export const useUpdatePenjualan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePenjualanData }): Promise<PenjualanWithRelations> => {
      return penjualanService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch penjualan list and specific penjualan
      queryClient.invalidateQueries({ queryKey: ['/penjualan'] });
      queryClient.invalidateQueries({ queryKey: ['/penjualan', id] });
    }
  });
};

export const usePartialUpdatePenjualan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePenjualanData }): Promise<PenjualanWithRelations> => {
      return penjualanService.partialUpdate(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch penjualan list and specific penjualan
      queryClient.invalidateQueries({ queryKey: ['/penjualan'] });
      queryClient.invalidateQueries({ queryKey: ['/penjualan', id] });
    }
  });
};

export const useUpdatePenjualanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePenjualanStatusData }): Promise<PenjualanWithRelations> => {
      return penjualanService.updateStatus(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch penjualan list and specific penjualan
      queryClient.invalidateQueries({ queryKey: ['/penjualan'] });
      queryClient.invalidateQueries({ queryKey: ['/penjualan', id] });
    }
  });
};

export const useDeletePenjualan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<PenjualanWithRelations> => {
      return penjualanService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch penjualan list
      queryClient.invalidateQueries({ queryKey: ['/penjualan'] });
    }
  });
};
