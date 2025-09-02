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
      const response = await axios.get('/referensi');

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
      const response = await axios.get('/all-projek');

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
      const response = await axios.get('/prospek');

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
    const { search = '', page = 1, per_page = 12, created_id } = params;

    const response = await axios.get<KonsumenResponse>('/konsumen', {
      params: {
        search,
        page,
        per_page,
        ...(created_id && { created_id }),
        with: 'prospek,project,refrensi' // Load relations
      }
    });

    return response.data;
  },

  // Get new konsumen for dashboard
  getNewKonsumen: async (params: UseKonsumenListParams = {}): Promise<KonsumenData[]> => {
    try {
      const response = await axios.get<{ data: KonsumenData[] } | KonsumenData[]>('/get-new-konsumen', {
        params
      });

      // Handle different response formats
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data; // Format: { data: [...] }
      } else if (Array.isArray(response.data)) {
        return response.data; // Format: [...]
      } else {
        return [];
      }
    } catch (error: any) {
      throw error;
    }
  },

  // Get konsumen by ID
  getKonsumenById: async (id: number): Promise<KonsumenData> => {
    try {
      const response = await axios.get<KonsumenData>(`/konsumen/${id}`, {
        params: {
          with: 'prospek,project,refrensi' // Load relations
        }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Create new konsumen
  createKonsumen: async (data: CreateKonsumenData): Promise<KonsumenData> => {
    try {
      const formData = new FormData();

      // Add all text fields
      formData.append('name', data.name);
      if (data.ktp_number) {
        formData.append('ktp_number', data.ktp_number);
      }
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      if (data.email) {
        formData.append('email', data.email);
      }
      formData.append('description', data.description || '');
      formData.append('refrensi_id', data.refrensi_id.toString());
      formData.append('prospek_id', data.prospek_id.toString());
      formData.append('project_id', data.project_id.toString());
      if (data.created_id) {
        formData.append('created_id', data.created_id.toString());
      }
      formData.append('kesiapan_dana', data.kesiapan_dana?.toString() || '');
      formData.append('pengalaman', data.pengalaman || '');
      formData.append('materi_fu_1', data.materi_fu_1 || '');
      formData.append('tgl_fu_1', data.tgl_fu_1 || '');
      formData.append('materi_fu_2', data.materi_fu_2 || '');
      formData.append('tgl_fu_2', data.tgl_fu_2 || '');

      // Add gambar files if present
      if (data.gambar && data.gambar.length > 0) {
        data.gambar.forEach((file) => {
          formData.append('gambar', file);
        });
      }

      const response = await axios.post<KonsumenApiResponse>('/konsumen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Update existing konsumen
  updateKonsumen: async (id: number, data: Partial<CreateKonsumenData>): Promise<KonsumenData> => {
    try {
      const formData = new FormData();

      // Add _method for Laravel to handle PUT request
      formData.append('_method', 'PUT');

      // Add all text fields
      if (data.name) formData.append('name', data.name);
      if (data.ktp_number) formData.append('ktp_number', data.ktp_number);
      if (data.address) formData.append('address', data.address);
      if (data.phone) formData.append('phone', data.phone);
      if (data.email !== undefined) formData.append('email', data.email || '');
      if (data.description !== undefined) formData.append('description', data.description || '');
      if (data.refrensi_id) formData.append('refrensi_id', data.refrensi_id.toString());
      if (data.prospek_id) formData.append('prospek_id', data.prospek_id.toString());
      if (data.project_id) formData.append('project_id', data.project_id.toString());
      if (data.created_id !== undefined) formData.append('created_id', data.created_id?.toString() || '');
      if (data.kesiapan_dana !== undefined) formData.append('kesiapan_dana', data.kesiapan_dana?.toString() || '');
      if (data.pengalaman !== undefined) formData.append('pengalaman', data.pengalaman || '');
      if (data.materi_fu_1 !== undefined) formData.append('materi_fu_1', data.materi_fu_1 || '');
      if (data.tgl_fu_1 !== undefined) formData.append('tgl_fu_1', data.tgl_fu_1 || '');
      if (data.materi_fu_2 !== undefined) formData.append('materi_fu_2', data.materi_fu_2 || '');
      if (data.tgl_fu_2 !== undefined) formData.append('tgl_fu_2', data.tgl_fu_2 || '');

      // Add gambar files if present
      if (data.gambar && data.gambar.length > 0) {
        data.gambar.forEach((file) => {
          formData.append('gambar', file);
        });
      }

      const response = await axios.post<KonsumenApiResponse>(`/konsumen/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
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

export const useAllKonsumen = () => {
  return useQuery({
    queryKey: ['all-konsumen'],
    queryFn: async () => {
      const res = await axios.get('/all-konsumen');
      // Support both { data: [...] } and [...]
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useNewKonsumen = (params: UseKonsumenListParams = {}) => {
  return useQuery({
    queryKey: ['new-konsumen', params],
    queryFn: () => konsumenService.getNewKonsumen(params),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
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
