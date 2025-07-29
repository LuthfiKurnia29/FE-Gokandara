import axios from '@/lib/axios';
import { BlokData, CreateBlokData } from '@/types/blok';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getAllBlok = async (params?: any): Promise<BlokData[]> => {
  const { data } = await axios.get('/blok', { params });
  return data.data || data;
};

export const getBlok = async (id: number): Promise<BlokData> => {
  const { data } = await axios.get(`/blok/${id}`);
  return data.data || data;
};

export const createBlok = async (payload: CreateBlokData) => {
  return axios.post('/blok', payload);
};

export const updateBlok = async (id: number, payload: CreateBlokData) => {
  return axios.put(`/blok/${id}`, payload);
};

export const deleteBlok = async (id: number) => {
  return axios.delete(`/blok/${id}`);
};

// Custom hooks untuk react-query
export const useCreateBlok = () => {
  return useMutation({
    mutationFn: createBlok,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat blok');
    }
  });
};

export const useUpdateBlok = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBlokData }) => updateBlok(id, data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate blok');
    }
  });
};

export const useDeleteBlok = () => {
  return useMutation({
    mutationFn: deleteBlok,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus blok');
    }
  });
};

// Query hooks
export const useBlokById = (id: number | null) => {
  return useQuery({
    queryKey: ['/blok', 'by-id', id],
    queryFn: (): Promise<BlokData> => {
      if (!id) throw new Error('ID is required');
      return getBlok(id);
    },
    enabled: id !== null && id !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};
