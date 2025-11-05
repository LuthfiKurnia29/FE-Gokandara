import axios from '@/lib/axios';
import { CreateProjekData, ProjekData } from '@/types/projek';
import { SkemaPembayaran } from '@/types/skema-pembayaran';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export const getAllProjek = async (params?: any): Promise<ProjekData[]> => {
  const { data } = await axios.get('/projek', { params });
  return data.data || data;
};

export const getProjek = async (id: number): Promise<ProjekData> => {
  const { data } = await axios.get(`/projek/${id}`);
  return data.data || data;
};

export const getTipesByProjek = async (id: number): Promise<any[]> => {
  const { data } = await axios.get(`/projek/${id}/tipes`);
  return data.data || data;
};

// Mendapatkan daftar skema pembayaran berdasarkan projek dan tipe
export const getPembayaranByProjekTipe = async (
  projekId: number,
  tipeId: number
): Promise<
  Array<{
    id: number;
    nama: string;
    harga: number | string;
    skema_pembayaran: SkemaPembayaran;
    skema_pembayaran_id: number;
  }>
> => {
  const { data } = await axios.get(`/projek/${projekId}/tipe/${tipeId}/pembayaran`);
  return data.data || data;
};

export const createProjek = async (payload: CreateProjekData) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  if (payload.alamat) formData.append('alamat', payload.alamat);
  if (payload.jumlah_kavling !== undefined && payload.jumlah_kavling !== null) {
    formData.append('jumlah_kavling', String(payload.jumlah_kavling));
  }
  if (payload.kamar_tidur !== undefined && payload.kamar_tidur !== null) {
    formData.append('kamar_tidur', String(payload.kamar_tidur));
  }
  if (payload.kamar_mandi !== undefined && payload.kamar_mandi !== null) {
    formData.append('kamar_mandi', String(payload.kamar_mandi));
  }
  if (payload.wifi !== undefined && payload.wifi !== null) {
    formData.append('wifi', payload.wifi ? '1' : '0');
  }

  if (payload.tipe && payload.tipe.length > 0) {
    payload.tipe.forEach((t, i) => {
      if (t.name !== undefined) formData.append(`tipe[${i}][name]`, t.name);
      formData.append(`tipe[${i}][luas_tanah]`, String(t.luas_tanah ?? 0));
      formData.append(`tipe[${i}][luas_bangunan]`, String(t.luas_bangunan ?? 0));
      formData.append(`tipe[${i}][jumlah_unit]`, String(t.jumlah_unit ?? 0));
      if (t.jenis_pembayaran && t.jenis_pembayaran.length > 0) {
        t.jenis_pembayaran.forEach((jp, j) => {
          formData.append(`tipe[${i}][jenis_pembayaran][${j}][id]`, String(jp.id));
          formData.append(`tipe[${i}][jenis_pembayaran][${j}][harga]`, String(jp.harga ?? 0));
        });
      }
    });
  }

  if (payload.fasilitas && payload.fasilitas.length > 0) {
    payload.fasilitas.forEach((f, i) => {
      if (f.name !== undefined) formData.append(`fasilitas[${i}][name]`, f.name);
      formData.append(`fasilitas[${i}][luas]`, String(f.luas ?? 0));
    });
  }

  if (payload.gambars && payload.gambars.length > 0) {
    payload.gambars.forEach((file) => {
      formData.append('gambars[]', file);
    });
  }

  return axios.post('/projek', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateProjek = async (id: number, payload: CreateProjekData) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  if (payload.alamat) formData.append('alamat', payload.alamat);
  if (payload.jumlah_kavling !== undefined && payload.jumlah_kavling !== null) {
    formData.append('jumlah_kavling', String(payload.jumlah_kavling));
  }
  if (payload.kamar_tidur !== undefined && payload.kamar_tidur !== null) {
    formData.append('kamar_tidur', String(payload.kamar_tidur));
  }
  if (payload.kamar_mandi !== undefined && payload.kamar_mandi !== null) {
    formData.append('kamar_mandi', String(payload.kamar_mandi));
  }
  if (payload.wifi !== undefined && payload.wifi !== null) {
    formData.append('wifi', payload.wifi ? '1' : '0');
  }

  if (payload.tipe && payload.tipe.length > 0) {
    payload.tipe.forEach((t, i) => {
      if (t.name !== undefined) formData.append(`tipe[${i}][name]`, t.name);
      formData.append(`tipe[${i}][luas_tanah]`, String(t.luas_tanah ?? 0));
      formData.append(`tipe[${i}][luas_bangunan]`, String(t.luas_bangunan ?? 0));
      formData.append(`tipe[${i}][jumlah_unit]`, String(t.jumlah_unit ?? 0));
      if (t.jenis_pembayaran && t.jenis_pembayaran.length > 0) {
        t.jenis_pembayaran.forEach((jp, j) => {
          formData.append(`tipe[${i}][jenis_pembayaran][${j}][id]`, String(jp.id));
          formData.append(`tipe[${i}][jenis_pembayaran][${j}][harga]`, String(jp.harga ?? 0));
        });
      }
    });
  }

  if (payload.fasilitas && payload.fasilitas.length > 0) {
    payload.fasilitas.forEach((f, i) => {
      if (f.name !== undefined) formData.append(`fasilitas[${i}][name]`, f.name);
      formData.append(`fasilitas[${i}][luas]`, String(f.luas ?? 0));
    });
  }

  formData.append('_method', 'PUT');

  return axios.post(`/projek/${id}`, formData);
};

export const deleteProjek = async (id: number) => {
  return axios.delete(`/projek/${id}`);
};

export const getProjekGambars = async (id: number): Promise<any[]> => {
  const { data } = await axios.get(`/projek/${id}/images`);
  return data.data || data;
};

export const uploadProjekGambars = async (id: number, files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('gambar[]', file);
  });
  return axios.post(`/projek/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteProjekGambar = async (id: number): Promise<any> => {
  return axios.delete(`/projek-gambar/${id}`);
};

export const uploadProjekLogo = async (id: number, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post(`/projek/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

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

export const useProjekById = (id: number | null) => {
  return useQuery({
    queryKey: ['/projek', 'by-id', id],
    queryFn: (): Promise<ProjekData> => {
      if (!id) throw new Error('ID is required');
      return getProjek(id);
    },
    enabled: id !== null && id !== undefined,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
};

export const useUploadProjekGambars = () => {
  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) => uploadProjekGambars(id, files),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupload gambar projek');
    }
  });
};

export const useProjekGambars = (id: number | null) => {
  return useQuery({
    queryKey: ['/projek', id, 'images'],
    queryFn: () => {
      if (!id) throw new Error('ID is required');
      return getProjekGambars(id);
    },
    enabled: id !== null && id !== undefined,
    staleTime: 5 * 60 * 1000
  });
};

export const useUploadProjekLogo = () => {
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadProjekLogo(id, file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupload logo projek');
    }
  });
};
