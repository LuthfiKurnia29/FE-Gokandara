import axios from '@/lib/axios';
import { RealisasiResponse } from '@/types/realisasi';

export const getRealisasi = async (): Promise<RealisasiResponse> => {
  const response = await axios.get('/get-realisasi');
  return response.data;
};
