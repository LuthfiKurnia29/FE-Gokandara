import axios from '@/lib/axios';
import { CreateUnitData, UnitData } from '@/types/unit';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getAllUnit = async (params?: any): Promise<UnitData[]> => {
  const { data } = await axios.get('/unit', { params });
  return data.data || data;
};

export const getUnit = async (id: number): Promise<UnitData> => {
  const { data } = await axios.get(`/unit/${id}`);
  return data.data || data;
};

export const createUnit = async (payload: CreateUnitData) => {
  return axios.post('/unit', payload);
};

export const updateUnit = async (id: number, payload: CreateUnitData) => {
  return axios.put(`/unit`, { id, ...payload });
};

export const deleteUnit = async (id: number) => {
  return axios.delete(`/unit/${id}`);
};

// Custom hooks untuk react-query
export const useCreateUnit = () => {
  return useMutation({
    mutationFn: createUnit,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat unit');
    }
  });
};

export const useUpdateUnit = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateUnitData }) => updateUnit(id, data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate unit');
    }
  });
};

export const useDeleteUnit = () => {
  return useMutation({
    mutationFn: deleteUnit,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus unit');
    }
  });
};
