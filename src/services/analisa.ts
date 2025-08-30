import axios from '@/lib/axios';
import {
  AnalisaQueryParams,
  FollowupResponse,
  NewKonsumenResponse,
  RealisasiResponse,
  RingkasanPenjualanItem,
  RingkasanPenjualanResponse,
  StatistikPemesananItem,
  StatistikPemesananResponse,
  StatistikPenjualanItem,
  StatistikPenjualanResponse,
  UseAnalisaParams
} from '@/types/analisa';
import { useQuery } from '@tanstack/react-query';

export const analisaService = {
  // Get new konsumen data
  getNewKonsumen: async (params: AnalisaQueryParams = {}): Promise<NewKonsumenResponse> => {
    const response = await axios.get<NewKonsumenResponse>('/get-new-konsumen', {
      params
    });
    return response.data;
  },

  // Get followup data
  getFollowup: async (params: AnalisaQueryParams = {}): Promise<FollowupResponse> => {
    const response = await axios.get<FollowupResponse>('/get-followup', {
      params
    });
    return response.data;
  },

  // Get statistik penjualan data
  getStatistikPenjualan: async (params: AnalisaQueryParams = {}): Promise<StatistikPenjualanItem[]> => {
    const response = await axios.get<StatistikPenjualanItem[]>('/get-statistik-penjualan', {
      params
    });
    return response.data;
  },

  // Get statistik pemesanan data
  getStatistikPemesanan: async (params: AnalisaQueryParams = {}): Promise<StatistikPemesananItem[]> => {
    const response = await axios.get<StatistikPemesananItem[]>('/get-statistik-pemesanan', {
      params
    });
    return response.data;
  },

  // Get realisasi data
  getRealisasi: async (params: AnalisaQueryParams = {}): Promise<RealisasiResponse> => {
    const response = await axios.get<RealisasiResponse>('/get-realisasi', {
      params
    });
    return response.data;
  },

  // Get ringkasan penjualan data
  getRingkasanPenjualan: async (params: AnalisaQueryParams = {}): Promise<RingkasanPenjualanItem[]> => {
    const response = await axios.get<RingkasanPenjualanItem[]>('/get-ringkasan-penjualan', {
      params
    });
    return response.data;
  }
};

// React Query hooks for Analisa data

// Hook for new konsumen data
export const useAnalisaNewKonsumen = (params: UseAnalisaParams = {}) => {
  return useQuery({
    queryKey: ['analisa', 'new-konsumen', params],
    queryFn: () => analisaService.getNewKonsumen(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });
};

// Hook for followup data
export const useAnalisaFollowup = (params: UseAnalisaParams = {}) => {
  return useQuery({
    queryKey: ['analisa', 'followup', params],
    queryFn: () => analisaService.getFollowup(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000 // Refresh every 2 minutes
  });
};

// Hook for statistik penjualan data
export const useAnalisaStatistikPenjualan = (params: UseAnalisaParams = {}) => {
  return useQuery({
    queryKey: ['analisa', 'statistik-penjualan', params],
    queryFn: () => analisaService.getStatistikPenjualan(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });
};

// Hook for statistik pemesanan data
export const useAnalisaStatistikPemesanan = (params: UseAnalisaParams = {}) => {
  return useQuery({
    queryKey: ['analisa', 'statistik-pemesanan', params],
    queryFn: () => analisaService.getStatistikPemesanan(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });
};

// Hook for realisasi data
export const useAnalisaRealisasi = (params: UseAnalisaParams = {}) => {
  return useQuery({
    queryKey: ['analisa', 'realisasi', params],
    queryFn: () => analisaService.getRealisasi(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });
};

// Hook for ringkasan penjualan data
export const useAnalisaRingkasanPenjualan = (params: UseAnalisaParams = {}) => {
  return useQuery({
    queryKey: ['analisa', 'ringkasan-penjualan', params],
    queryFn: () => analisaService.getRingkasanPenjualan(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });
};

// Combined hook for all analisa data
export const useAnalisaData = (params: UseAnalisaParams = {}) => {
  const newKonsumen = useAnalisaNewKonsumen(params);
  const followup = useAnalisaFollowup(params);
  const statistikPenjualan = useAnalisaStatistikPenjualan(params);
  const statistikPemesanan = useAnalisaStatistikPemesanan(params);
  const realisasi = useAnalisaRealisasi(params);
  const ringkasanPenjualan = useAnalisaRingkasanPenjualan(params);

  return {
    newKonsumen: newKonsumen.data,
    followup: followup.data,
    statistikPenjualan: statistikPenjualan.data,
    statistikPemesanan: statistikPemesanan.data,
    realisasi: realisasi.data,
    ringkasanPenjualan: ringkasanPenjualan.data,
    isLoading: {
      newKonsumen: newKonsumen.isLoading,
      followup: followup.isLoading,
      statistikPenjualan: statistikPenjualan.isLoading,
      statistikPemesanan: statistikPemesanan.isLoading,
      realisasi: realisasi.isLoading,
      ringkasanPenjualan: ringkasanPenjualan.isLoading
    },
    isError: {
      newKonsumen: newKonsumen.isError,
      followup: followup.isError,
      statistikPenjualan: statistikPenjualan.isError,
      statistikPemesanan: statistikPemesanan.isError,
      realisasi: realisasi.isError,
      ringkasanPenjualan: ringkasanPenjualan.isError
    },
    error: {
      newKonsumen: newKonsumen.error,
      followup: followup.error,
      statistikPenjualan: statistikPenjualan.error,
      statistikPemesanan: statistikPemesanan.error,
      realisasi: realisasi.error,
      ringkasanPenjualan: ringkasanPenjualan.error
    }
  };
};
