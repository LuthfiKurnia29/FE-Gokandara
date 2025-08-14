import axios from '@/lib/axios';
import type { NotificationItem, NotificationPaginationResponse } from '@/types/notification';
// React Query hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const notificationService = {
  // Backend endpoints
  list: async (params: { page?: number; per_page?: number; search?: string; filter?: 'all' | 'unread' } = {}) => {
    const { page = 1, per_page = 10, search = '', filter = 'all' } = params;
    const url = filter === 'unread' ? '/notifikasi-unread' : '/notifikasi';
    const { data } = await axios.get<NotificationPaginationResponse>(url, {
      params: { page, per_page, search }
    });
    return data;
  },

  count: async (): Promise<number> => {
    const { data } = await axios.get<{ count: number }>('/notifikasi-count');
    return (data as any).count ?? 0;
  },

  read: async (id: number) => {
    await axios.post(`/notifikasi-read/${id}`);
  },

  readAll: async () => {
    await axios.post('/notifikasi-read-all');
  },

  remove: async (id: number) => {
    await axios.delete(`/notifikasi/${id}`);
  }
};

export const useNotificationList = (
  params: { page?: number; per_page?: number; search?: string; filter?: 'all' | 'unread' } = {}
) =>
  useQuery({
    queryKey: ['/notifikasi', params],
    queryFn: () => notificationService.list(params)
  });

export const useNotificationCount = () =>
  useQuery({
    queryKey: ['/notifikasi-count'],
    queryFn: () => notificationService.count(),
    refetchInterval: 60_000
  });

export const useReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.read(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifikasi'] });
      queryClient.invalidateQueries({ queryKey: ['/notifikasi-count'] });
    }
  });
};

export const useReadAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifikasi'] });
      queryClient.invalidateQueries({ queryKey: ['/notifikasi-count'] });
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifikasi'] });
      queryClient.invalidateQueries({ queryKey: ['/notifikasi-count'] });
    }
  });
};
