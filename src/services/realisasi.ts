import axios from '@/lib/axios';
import { RealisasiResponse } from '@/types/realisasi';

export const getRealisasi = async (params: { created_id?: number } = {}): Promise<RealisasiResponse> => {
  const response = await axios.get('/get-realisasi', {
    params
  });
  return response.data;
};
