import axios from '@/lib/axios';
import { CreateProspekData, ProspekData } from '@/types/prospek';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getAllProspek = async (params?: any): Promise<ProspekData[]> => {
  const { data } = await axios.get('/prospek', { params });
  return data.data || data;
};

export const getProspek = async (id: number): Promise<ProspekData> => {
  const { data } = await axios.get(`/prospek/${id}`);
  return data.data || data;
};

export const createProspek = async (payload: CreateProspekData) => {
  return axios.post('/prospek', payload);
};

export const updateProspek = async (id: number, payload: CreateProspekData) => {
  return axios.put(`/prospek/${id}`, payload);
};

// Fallback method if backend cannot be changed
export const updateProspekFallback = async (id: number, payload: CreateProspekData) => {
  return axios.post('/prospek/update', { id, ...payload });
};

export const deleteProspek = async (id: number) => {
  return axios.delete(`/prospek/${id}`);
};

// Custom hooks untuk react-query
export const useCreateProspek = () => {
  return useMutation({
    mutationFn: createProspek,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat prospek');
    }
  });
};

export const useUpdateProspek = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProspekData }) => updateProspek(id, data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate prospek');
    }
  });
};

export const useDeleteProspek = () => {
  return useMutation({
    mutationFn: deleteProspek,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus prospek');
    }
  });
};

// Query hooks
export const useProspekById = (id: number | null) => {
  return useQuery({
    queryKey: ['/prospek', 'by-id', id],
    queryFn: (): Promise<ProspekData> => {
      if (!id) throw new Error('ID is required');
      return getProspek(id);
    },
    enabled: id !== null && id !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};
