import axios from '@/lib/axios';
import {
  CreateKonsumenData,
  KonsumenApiResponse,
  KonsumenData,
  KonsumenResponse,
  UseKonsumenListParams
} from '@/types/konsumen';
import { ProjekData, ProjekResponse } from '@/types/projek';
import { ProspekData, ProspekResponse } from '@/types/prospek';
import { ReferensiData, ReferensiResponse } from '@/types/referensi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Master Data Services untuk Laravel Backend
export const masterDataService = {
  // Get all referensi dari Laravel API
  getReferensi: async (): Promise<ReferensiData[]> => {
    try {
      const response = await axios.get('/api/referensi');

      // Handle different Laravel response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data; // Format: { data: [...] }
      } else if (Array.isArray(response.data)) {
        return response.data; // Format: [...]
      } else {
        // Return empty array for unexpected format instead of console.warn
        return [];
      }
    } catch (error) {
      // Throw error to be handled by React Query's error boundary
      throw new Error('Failed to fetch referensi data');
    }
  },

  // Get all proyek dari Laravel API
  getProyek: async (): Promise<ProjekData[]> => {
    try {
      const response = await axios.get('/api/all-projek');

      // Handle different Laravel response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data; // Format: { data: [...] }
      } else if (Array.isArray(response.data)) {
        return response.data; // Format: [...]
      } else {
        // Return empty array for unexpected format instead of console.warn
        return [];
      }
    } catch (error) {
      // Throw error to be handled by React Query's error boundary
      throw new Error('Failed to fetch proyek data');
    }
  },

  // Get all prospek dari Laravel API
  getProspek: async (): Promise<ProspekData[]> => {
    try {
      const response = await axios.get('/api/prospek');

      // Handle different Laravel response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data; // Format: { data: [...] }
      } else if (Array.isArray(response.data)) {
        return response.data; // Format: [...]
      } else {
        // Return empty array for unexpected format
        return [];
      }
    } catch (error) {
      // Throw error to be handled by React Query's error boundary
      throw new Error('Failed to fetch prospek data');
    }
  }
};

// Master Data Hooks dengan error handling
export const useReferensiList = () => {
  return useQuery({
    queryKey: ['referensi'],
    queryFn: () => masterDataService.getReferensi(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  });
};

export const useProjekList = () => {
  return useQuery({
    queryKey: ['proyek'],
    queryFn: () => masterDataService.getProyek(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  });
};

export const useProspekList = () => {
  return useQuery({
    queryKey: ['prospek'],
    queryFn: () => masterDataService.getProspek(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  });
};

export const konsumenService = {
  // Konsumen fetch service
  getKonsumen: async (params: UseKonsumenListParams = {}): Promise<KonsumenResponse> => {
    const { search = '', page = 1, per_page = 12 } = params;

    const response = await axios.get<KonsumenResponse>('/konsumen', {
      params: {
        search,
        page,
        per_page
      }
    });

    return response.data;
  },

  // Get konsumen by ID
  getKonsumenById: async (id: number): Promise<KonsumenData> => {
    const response = await axios.get<KonsumenApiResponse>(`/konsumen/${id}`);
    return response.data.data;
  },

  // Create new konsumen
  createKonsumen: async (data: CreateKonsumenData): Promise<KonsumenData> => {
    const response = await axios.post<KonsumenApiResponse>('/konsumen', data);
    return response.data.data;
  },

  // Update existing konsumen
  updateKonsumen: async (id: number, data: Partial<CreateKonsumenData>): Promise<KonsumenData> => {
    const response = await axios.put<KonsumenApiResponse>(`/konsumen/${id}`, data);
    return response.data.data;
  },

  // Delete konsumen
  deleteKonsumen: async (id: number): Promise<void> => {
    await axios.delete(`/konsumen/${id}`);
  }
};

// Konsumen Query Hooks
export const useKonsumenList = (params: UseKonsumenListParams = {}) => {
  return useQuery({
    queryKey: ['/konsumen', params],
    queryFn: () => konsumenService.getKonsumen(params),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useKonsumenById = (id: number | null) => {
  return useQuery({
    queryKey: ['/konsumen', id],
    queryFn: () => (id ? konsumenService.getKonsumenById(id) : null),
    enabled: !!id,
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000
  });
};

// Konsumen Mutation Hooks
export const useCreateKonsumen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: konsumenService.createKonsumen,
    onSuccess: () => {
      // Invalidate and refetch konsumen list
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });
};

export const useUpdateKonsumen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateKonsumenData> }) =>
      konsumenService.updateKonsumen(id, data),
    onSuccess: (data, variables) => {
      // Update specific konsumen in cache
      queryClient.setQueryData(['/konsumen', variables.id], data);
      // Invalidate konsumen list
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });
};

export const useDeleteKonsumen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: konsumenService.deleteKonsumen,
    onSuccess: () => {
      // Invalidate and refetch konsumen list
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });
};
