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

// Master Data Interfaces for form dropdowns
interface MasterDataItem {
  id: number;
  name: string;
}

interface PropertyData {
  id: number;
  name: string;
  code: string;
  project_id: number;
  blok_id: number;
  unit_id: number;
  tipe_id: number;
  luas_bangunan: string;
  luas_tanah: string;
  kelebihan: string;
  lokasi: string;
  harga: number;
}

export const penjualanService = {
  // Get paginated list of penjualan
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    status,
    konsumen_id,
    properti_id,
    include
  }: UsePenjualanListParams = {}): Promise<PenjualanResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(konsumen_id && { konsumen_id: konsumen_id.toString() }),
      ...(properti_id && { properti_id: properti_id.toString() }),
      ...(include && include.length > 0 && { include: include.join(',') })
    });

    const response = await axios.get(`/list-transaksi?${params}`);
    return response.data;
  },

  // Get total count of transaksi for badge
  getTotalCount: async (): Promise<number> => {
    try {
      const response = await axios.get('/list-transaksi?page=1&per_page=1');
      return response.data.total || 0;
    } catch (error) {
      console.error('Error fetching transaksi total count:', error);
      return 0;
    }
  },

  // Get penjualan by ID
  getById: async (id: number, include?: string[]): Promise<PenjualanWithRelations> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/list-transaksi/${id}${params.toString() ? `?${params}` : ''}`;
    const response = await axios.get<PenjualanApiResponse>(url);
    return response.data.data;
  },

  // Create new penjualan
  create: async (data: CreatePenjualanData): Promise<PenjualanWithRelations> => {
    console.log('🚀 Frontend sending data to backend:', JSON.stringify(data, null, 2));
    const response = await axios.post<PenjualanApiResponse>('/create-transaksi', data);
    console.log('📥 Backend response:', JSON.stringify(response.data, null, 2));
    return response.data.data;
  },

  // Update penjualan by ID
  update: async (id: number, data: UpdatePenjualanData): Promise<PenjualanWithRelations> => {
    const response = await axios.put<PenjualanApiResponse>(`/update-transaksi/${id}`, data);
    return response.data.data;
  },

  // Partial update penjualan by ID
  partialUpdate: async (id: number, data: UpdatePenjualanData): Promise<PenjualanWithRelations> => {
    const response = await axios.patch<PenjualanApiResponse>(`/update-transaksi/${id}`, data);
    return response.data.data;
  },

  // Update penjualan status only
  updateStatus: async (id: number, data: UpdatePenjualanStatusData): Promise<PenjualanWithRelations> => {
    const response = await axios.post<PenjualanApiResponse>(`/update-status-transaksi/${id}`, data);
    return response.data.data;
  },

  // Delete penjualan by ID
  delete: async (id: number): Promise<PenjualanWithRelations> => {
    const response = await axios.delete<PenjualanApiResponse>(`/delete-transaksi/${id}`);
    return response.data.data;
  },

  // Get metrics data
  getMetrics: async () => {
    const [konsumenResponse, transaksiResponse] = await Promise.all([
      axios.get('/konsumen?per_page=1'), // Get first page to get total count
      axios.get('/list-transaksi?per_page=1') // Get first page to get total count
    ]);

    return {
      totalKonsumen: konsumenResponse.data.total || 0,
      totalTransaksi: transaksiResponse.data.total || 0
    };
  },

  // Master Data Services for form dropdowns
  getAllKonsumen: async (): Promise<MasterDataItem[]> => {
    const response = await axios.get('/all-konsumen');
    return response.data.data || response.data || [];
  },

  // Note: getAllProperti is now handled by properti service
  // This is kept for backward compatibility
  getAllProperti: async (): Promise<PropertyData[]> => {
    const response = await axios.get('/all-properti');
    return response.data.data || response.data || [];
  },

  getAllBlok: async (): Promise<MasterDataItem[]> => {
    const response = await axios.get('/all-blok');
    return response.data.data || response.data || [];
  },

  getAllTipe: async (): Promise<MasterDataItem[]> => {
    const response = await axios.get('/all-tipe');
    return response.data.data || response.data || [];
  },

  getAllUnit: async (): Promise<MasterDataItem[]> => {
    const response = await axios.get('/all-unit');
    return response.data.data || response.data || [];
  }
};

// Query hooks
export const usePenjualanList = ({
  page = 1,
  perPage = 10,
  search = '',
  status,
  konsumen_id,
  properti_id,
  include
}: UsePenjualanListParams = {}) => {
  return useQuery({
    queryKey: ['/list-transaksi', { page, perPage, search, status, konsumen_id, properti_id, include }],
    queryFn: (): Promise<PenjualanResponse> => {
      return penjualanService.getList({ page, perPage, search, status, konsumen_id, properti_id, include });
    }
  });
};

export const usePenjualanById = (id: number | null, include?: string[]) => {
  return useQuery({
    queryKey: ['/list-transaksi', id, { include }],
    queryFn: (): Promise<PenjualanWithRelations> => {
      if (!id) throw new Error('ID is required');
      return penjualanService.getById(id, include);
    },
    enabled: !!id
  });
};

// Metrics hook
export const usePenjualanMetrics = () => {
  return useQuery({
    queryKey: ['/penjualan-metrics'],
    queryFn: penjualanService.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

// Master Data Hooks for form dropdowns
export const useAllKonsumen = () => {
  return useQuery({
    queryKey: ['/all-konsumen'],
    queryFn: penjualanService.getAllKonsumen,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useAllProperti = () => {
  return useQuery({
    queryKey: ['/all-properti'],
    queryFn: penjualanService.getAllProperti,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useAllBlok = () => {
  return useQuery({
    queryKey: ['/all-blok'],
    queryFn: penjualanService.getAllBlok,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useAllTipe = () => {
  return useQuery({
    queryKey: ['/all-tipe'],
    queryFn: penjualanService.getAllTipe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useAllUnit = () => {
  return useQuery({
    queryKey: ['/all-unit'],
    queryFn: penjualanService.getAllUnit,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

// Hook untuk mendapatkan total transaksi untuk badge
export const useTransaksiTotalCount = () => {
  return useQuery({
    queryKey: ['/transaksi-total-count'],
    queryFn: penjualanService.getTotalCount,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000 // 5 minutes
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
      // Invalidate and refetch penjualan list and metrics
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['/penjualan-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/transaksi-total-count'] });
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
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi', id] });
      queryClient.invalidateQueries({ queryKey: ['/transaksi-total-count'] });
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
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi', id] });
      queryClient.invalidateQueries({ queryKey: ['/transaksi-total-count'] });
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
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi', id] });
      queryClient.invalidateQueries({ queryKey: ['/transaksi-total-count'] });
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
      // Invalidate and refetch penjualan list and metrics
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['/penjualan-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/transaksi-total-count'] });
    }
  });
};
