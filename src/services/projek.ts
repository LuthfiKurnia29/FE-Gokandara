import axios from '@/lib/axios';
import { CreateProjekData, ProjekData } from '@/types/projek';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getAllProjek = async (params?: any): Promise<ProjekData[]> => {
  const { data } = await axios.get('/projek', { params });
  return data.data || data;
};

export const getProjek = async (id: number): Promise<ProjekData> => {
  const { data } = await axios.get(`/projek/${id}`);
  return data.data || data;
};

export const createProjek = async (payload: CreateProjekData) => {
  return axios.post('/projek', payload);
};

export const updateProjek = async (id: number, payload: CreateProjekData) => {
  return axios.put(`/projek`, { id, ...payload });
};

export const deleteProjek = async (id: number) => {
  return axios.delete(`/projek/${id}`);
};

// Custom hooks untuk react-query
export const useCreateProjek = () => {
  return useMutation({
    mutationFn: createProjek,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat projek');
    }
  });
};

export const useUpdateProjek = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProjekData }) => updateProjek(id, data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate projek');
    }
  });
};

export const useDeleteProjek = () => {
  return useMutation({
    mutationFn: deleteProjek,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus projek');
    }
  });
};
