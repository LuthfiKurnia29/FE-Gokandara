import axios from '@/lib/axios';
import {
  CreateTargetData,
  TargetApiResponse,
  TargetResponse,
  TargetWithRelations,
  UpdateTargetData,
  UseTargetListParams
} from '@/types/target';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const targetService = {
  // Get paginated list of targets
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    role_id,
    created_id,
    include
  }: UseTargetListParams = {}): Promise<TargetResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(role_id && { role_id: role_id.toString() }),
      ...(created_id && { created_id: created_id.toString() }),
      ...(include && include.length > 0 && { include: include.join(',') })
    });

    const response = await axios.get(`/target?${params}`);
    return response.data;
  },

  // Get target by ID
  getById: async (id: number, include?: string[]): Promise<TargetWithRelations> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/target/${id}${params.toString() ? `?${params}` : ''}`;
    const response = await axios.get<TargetWithRelations>(url);
    return response.data;
  },

  // Create new target
  create: async (data: CreateTargetData): Promise<TargetWithRelations> => {
    const response = await axios.post<TargetApiResponse>('/target', data);
    return response.data.data;
  },

  // Update target by ID
  update: async (id: number, data: UpdateTargetData): Promise<TargetWithRelations> => {
    const response = await axios.put<TargetApiResponse>(`/target/${id}`, data);
    return response.data.data;
  },

  // Delete target by ID
  delete: async (id: number): Promise<TargetWithRelations> => {
    const response = await axios.delete<TargetApiResponse>(`/target/${id}`);
    return response.data.data;
  },

  // Get achieved users for target
  getAchievedUsers: async (id: number): Promise<any> => {
    const response = await axios.get(`/target/${id}/achieved`);
    return response.data;
  }
};

// Query hooks
export const useTargetList = ({
  page = 1,
  perPage = 10,
  search = '',
  role_id,
  created_id,
  include
}: UseTargetListParams = {}) => {
  return useQuery({
    queryKey: ['/target', { page, perPage, search, role_id, created_id, include }],
    queryFn: (): Promise<TargetResponse> => {
      return targetService.getList({ page, perPage, search, role_id, created_id, include });
    }
  });
};

export const useTargetById = (id: number | null, include?: string[]) => {
  return useQuery({
    queryKey: ['/target', id, { include }],
    queryFn: (): Promise<TargetWithRelations> => {
      if (!id) throw new Error('ID is required');
      return targetService.getById(id, include);
    },
    enabled: !!id
  });
};

export const useAchievedUsers = (id: number | null) => {
  return useQuery({
    queryKey: ['/target', id, 'achieved'],
    queryFn: (): Promise<any> => {
      if (!id) throw new Error('ID is required');
      return targetService.getAchievedUsers(id);
    },
    enabled: !!id
  });
};

// Mutation hooks
export const useCreateTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTargetData): Promise<TargetWithRelations> => {
      return targetService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch target list
      queryClient.invalidateQueries({ queryKey: ['/target'] });
    }
  });
};

export const useUpdateTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTargetData }): Promise<TargetWithRelations> => {
      return targetService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch target list and specific target
      queryClient.invalidateQueries({ queryKey: ['/target'] });
      queryClient.invalidateQueries({ queryKey: ['/target', id] });
    }
  });
};

export const useDeleteTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<TargetWithRelations> => {
      return targetService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch target list
      queryClient.invalidateQueries({ queryKey: ['/target'] });
    }
  });
};
