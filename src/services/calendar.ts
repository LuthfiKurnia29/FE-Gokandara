import axios from '@/lib/axios';
import type {
  CalendarItemResponse,
  CalendarListResponse,
  CreateCalendarPayload,
  FollowupMonitoring,
  UpdateCalendarPayload
} from '@/types/calendar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type GetCalendarParams = {
  startDay: string | null;
  endDay: string | null;
  sales_id?: number;
};

export const calendarService = {
  getCalendar: async (params: GetCalendarParams): Promise<FollowupMonitoring[]> => {
    const { data } = await axios.get<CalendarListResponse>('/get-calendar', { params });
    return data.data;
  },

  getCalendarById: async (id: number): Promise<FollowupMonitoring> => {
    const { data } = await axios.get<CalendarItemResponse>(`/get-calendar/${id}`);
    return data.data;
  },

  createCalendar: async (payload: CreateCalendarPayload): Promise<FollowupMonitoring> => {
    const { data } = await axios.post<CalendarItemResponse>('/create-calendar', payload);
    return data.data;
  },

  updateCalendar: async (id: number, payload: UpdateCalendarPayload): Promise<void> => {
    await axios.put(`/update-calendar/${id}`, payload);
  },

  deleteCalendar: async (id: number): Promise<void> => {
    await axios.delete(`/delete-calendar`, { params: { id } });
  },
  updateCalendarStatus: async (id: number): Promise<void> => {
    await axios.post(`/update-status-follow-up/${id}`);
  }
};

export const useCalendarList = (params: GetCalendarParams) => {
  return useQuery({
    queryKey: ['/get-calendar', params],
    queryFn: () => calendarService.getCalendar(params)
  });
};

export const useCalendarById = (id: number | null) => {
  return useQuery({
    queryKey: ['/get-calendar', id],
    queryFn: () => (id ? calendarService.getCalendarById(id) : null),
    enabled: !!id
  });
};

export const useCreateCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCalendarPayload) => calendarService.createCalendar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/get-calendar'] });
    }
  });
};

export const useUpdateCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCalendarPayload }) => calendarService.updateCalendar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['/get-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['/get-calendar', id] });
    }
  });
};

export const useDeleteCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => calendarService.deleteCalendar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/get-calendar'] });
    }
  });
};

export const useUpdateCalendarStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => calendarService.updateCalendarStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/get-calendar'] });
    }
  });
};
