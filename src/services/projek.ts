import axios from '@/lib/axios';
import { CreateProjekData, ProjekData } from '@/types/projek';
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

export const createProjek = async (payload: CreateProjekData) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  if (payload.alamat) formData.append('alamat', payload.alamat);
  if (payload.jumlah_kavling !== undefined && payload.jumlah_kavling !== null) {
    formData.append('jumlah_kavling', String(payload.jumlah_kavling));
  }

  if (payload.tipe && payload.tipe.length > 0) {
    payload.tipe.forEach((t, i) => {
      if (t.name !== undefined) formData.append(`tipe[${i}][name]`, t.name);
      formData.append(`tipe[${i}][luas_tanah]`, String(t.luas_tanah ?? 0));
      formData.append(`tipe[${i}][luas_bangunan]`, String(t.luas_bangunan ?? 0));
      formData.append(`tipe[${i}][jumlah_unit]`, String(t.jumlah_unit ?? 0));
      formData.append(`tipe[${i}][harga]`, String(t.harga ?? 0));
      if (t.jenis_pembayaran_ids && t.jenis_pembayaran_ids.length > 0) {
        t.jenis_pembayaran_ids.forEach((id, j) => {
          formData.append(`tipe[${i}][jenis_pembayaran_ids][${j}]`, String(id));
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

  if (payload.tipe && payload.tipe.length > 0) {
    payload.tipe.forEach((t, i) => {
      if (t.name !== undefined) formData.append(`tipe[${i}][name]`, t.name);
      formData.append(`tipe[${i}][luas_tanah]`, String(t.luas_tanah ?? 0));
      formData.append(`tipe[${i}][luas_bangunan]`, String(t.luas_bangunan ?? 0));
      formData.append(`tipe[${i}][jumlah_unit]`, String(t.jumlah_unit ?? 0));
      formData.append(`tipe[${i}][harga]`, String(t.harga ?? 0));
      if (t.jenis_pembayaran_ids && t.jenis_pembayaran_ids.length > 0) {
        t.jenis_pembayaran_ids.forEach((id, j) => {
          formData.append(`tipe[${i}][jenis_pembayaran_ids][${j}]`, String(id));
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
