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
  getFollowUpToday: async (params: DashboardQueryParams = {}): Promise<FollowUpResponse> => {
    const response = await axios.get<FollowUpResponse>('/dashboard/followup-today', {
      params
    });
    return response.data;
  },

  // Get follow-ups for tomorrow
  getFollowUpTomorrow: async (params: DashboardQueryParams = {}): Promise<FollowUpResponse> => {
    const response = await axios.get<FollowUpResponse>('/dashboard/followup-tomorrow', {
      params
    });
    return response.data;
  },

  // Get new konsumens for today
  getNewKonsumens: async (params: DashboardQueryParams = {}): Promise<NewKonsumenResponse> => {
    const response = await axios.get<NewKonsumenResponse>('/dashboard/new-konsumens', {
      params
    });
    return response.data;
  },

  // Get konsumen data grouped by prospek
  getKonsumenByProspek: async (params: DashboardQueryParams = {}): Promise<KonsumenByProspekResponse> => {
    const response = await axios.get<KonsumenByProspekResponse>('/dashboard/konsumen-by-prospek', {
      params
    });
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
  getTransaksiByProperti: async (params: DashboardQueryParams = {}): Promise<TransaksiByPropertiResponse> => {
    const response = await axios.get<TransaksiByPropertiResponse>('/dashboard/transaksi-by-properti', {
      params
    });
    return response.data;
  }
};

// Query hooks for dashboard data
export const useDashboardFollowUpToday = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/followup-today', params],
    queryFn: () => dashboardService.getFollowUpToday(params),
    staleTime: 0, // Always refetch when params change
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

export const useDashboardFollowUpTomorrow = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/followup-tomorrow', params],
    queryFn: () => dashboardService.getFollowUpTomorrow(params),
    staleTime: 0, // Always refetch when params change
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

export const useDashboardNewKonsumens = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/new-konsumens', params],
    queryFn: () => dashboardService.getNewKonsumens(params),
    staleTime: 0, // Always refetch when params change
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

export const useDashboardKonsumenByProspek = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/konsumen-by-prospek', params],
    queryFn: () => dashboardService.getKonsumenByProspek(params),
    staleTime: 0, // Always refetch when params change
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

export const useDashboardSalesOverview = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/sales-overview', params],
    queryFn: () => dashboardService.getSalesOverview(params),
    staleTime: 0, // Always refetch when params change
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

export const useDashboardTransaksiByProperti = (params: DashboardQueryParams = {}) => {
  return useQuery({
    queryKey: ['/dashboard/transaksi-by-properti', params],
    queryFn: () => dashboardService.getTransaksiByProperti(params),
    staleTime: 0, // Always refetch when params change
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};
