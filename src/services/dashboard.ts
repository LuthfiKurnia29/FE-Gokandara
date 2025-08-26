import axios from '@/lib/axios';
import {
  DashboardQueryParams,
  FollowUpResponse,
  KonsumenByProspekResponse,
  NewKonsumenResponse,
  SalesOverviewResponse,
  TransaksiByPropertiResponse
} from '@/types/dashboard';
import { useQuery } from '@tanstack/react-query';

export const dashboardService = {
  // Get follow-ups for today
  getFollowUpToday: async (): Promise<FollowUpResponse> => {
    const response = await axios.get<FollowUpResponse>('/dashboard/followup-today');
    return response.data;
  },

  // Get follow-ups for tomorrow
  getFollowUpTomorrow: async (): Promise<FollowUpResponse> => {
    const response = await axios.get<FollowUpResponse>('/dashboard/followup-tomorrow');
    return response.data;
  },

  // Get new konsumens for today
  getNewKonsumens: async (): Promise<NewKonsumenResponse> => {
    const response = await axios.get<NewKonsumenResponse>('/dashboard/new-konsumens');
    return response.data;
  },

  // Get konsumen data grouped by prospek
  getKonsumenByProspek: async (): Promise<KonsumenByProspekResponse> => {
    const response = await axios.get<KonsumenByProspekResponse>('/dashboard/konsumen-by-prospek');
    return response.data;
  },

  // Get sales overview data
  getSalesOverview: async (params: DashboardQueryParams = {}): Promise<SalesOverviewResponse> => {
    const response = await axios.get<SalesOverviewResponse>('/dashboard/sales-overview', {
      params
    });
    return response.data;
  },

  // Get transaksi data grouped by properti
  getTransaksiByProperti: async (): Promise<TransaksiByPropertiResponse> => {
    const response = await axios.get<TransaksiByPropertiResponse>('/dashboard/transaksi-by-properti');
    return response.data;
  }
};

// Query hooks for dashboard data
export const useDashboardFollowUpToday = () => {
  return useQuery({
    queryKey: ['/dashboard/followup-today'],
    queryFn: dashboardService.getFollowUpToday,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });
};

export const useDashboardFollowUpTomorrow = () => {
  return useQuery({
    queryKey: ['/dashboard/followup-tomorrow'],
    queryFn: dashboardService.getFollowUpTomorrow,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });
};

export const useDashboardNewKonsumens = () => {
  return useQuery({
    queryKey: ['/dashboard/new-konsumens'],
    queryFn: dashboardService.getNewKonsumens,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000 // Refresh every 2 minutes
  });
};

export const useDashboardKonsumenByProspek = () => {
  return useQuery({
    queryKey: ['/dashboard/konsumen-by-prospek'],
    queryFn: dashboardService.getKonsumenByProspek,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true
  });
};

export const useDashboardSalesOverview = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/sales-overview', params],
    queryFn: () => dashboardService.getSalesOverview(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true
  });
};

export const useDashboardTransaksiByProperti = () => {
  return useQuery({
    queryKey: ['/dashboard/transaksi-by-properti'],
    queryFn: dashboardService.getTransaksiByProperti,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true
  });
};
