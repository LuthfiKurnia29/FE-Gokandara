import axios from '@/lib/axios';
import { CreateTipeData, TipeData } from '@/types/tipe';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getAllTipe = async (params?: any): Promise<TipeData[]> => {
  const { data } = await axios.get('/tipe', { params });
  return data.data || data;
};

export const getTipe = async (id: number): Promise<TipeData> => {
  const { data } = await axios.get(`/tipe/${id}`);
  return data.data || data;
};

export const createTipe = async (payload: CreateTipeData) => {
  return axios.post('/tipe', payload);
};

export const updateTipe = async (id: number, payload: CreateTipeData) => {
  return axios.put(`/tipe/${id}`, payload);
};

export const deleteTipe = async (id: number) => {
  return axios.delete(`/tipe/${id}`);
};

// Custom hooks untuk react-query
export const useCreateTipe = () => {
  return useMutation({
    mutationFn: createTipe,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat tipe');
    }
  });
};

export const useUpdateTipe = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTipeData }) => updateTipe(id, data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate tipe');
    }
  });
};

export const useDeleteTipe = () => {
  return useMutation({
    mutationFn: deleteTipe,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus tipe');
    }
  });
};
