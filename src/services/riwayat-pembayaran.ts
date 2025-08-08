import axios from '@/lib/axios';
import {
  CreateRiwayatPembayaranData,
  RiwayatPembayaranData,
  RiwayatPembayaranPaginationResponse,
  UpdateRiwayatPembayaranData
} from '@/types/riwayat-pembayaran';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getRiwayatPembayaran = async (
  transaksiId: number,
  params?: { page?: number; per?: number; search?: string }
): Promise<RiwayatPembayaranPaginationResponse> => {
  const { data } = await axios.get(`/riwayat-pembayaran/${transaksiId}`, {
    params
  });
  return data;
};

export const createRiwayatPembayaran = async (payload: CreateRiwayatPembayaranData) => {
  return axios.post('/create-riwayat-pembayaran', payload);
};

export const updateRiwayatPembayaran = async (id: number, payload: UpdateRiwayatPembayaranData) => {
  return axios.put(`/update-riwayat-pembayaran/${id}`, payload);
};

export const deleteRiwayatPembayaran = async (id: number) => {
  return axios.delete(`/delete-riwayat-pembayaran/${id}`);
};

export const useRiwayatPembayaran = (
  transaksiId: number,
  params?: { page?: number; per?: number; search?: string }
) => {
  return useQuery({
    queryKey: ['/riwayat-pembayaran', transaksiId, params?.page ?? 1, params?.per ?? 10, params?.search ?? ''],
    queryFn: () => getRiwayatPembayaran(transaksiId, params),
    enabled: Boolean(transaksiId)
  });
};

export const useCreateRiwayatPembayaran = () =>
  useMutation({
    mutationFn: createRiwayatPembayaran,
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal membuat riwayat pembayaran')
  });

export const useUpdateRiwayatPembayaran = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRiwayatPembayaranData }) => updateRiwayatPembayaran(id, data),
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal mengupdate riwayat pembayaran')
  });

export const useDeleteRiwayatPembayaran = () =>
  useMutation({
    mutationFn: deleteRiwayatPembayaran,
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Gagal menghapus riwayat pembayaran')
  });
