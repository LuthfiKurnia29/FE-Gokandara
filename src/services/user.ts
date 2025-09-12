import axios from '@/lib/axios';
import {
  CreateUserData,
  RoleResponse,
  UpdateUserData,
  UseUserListParams,
  UserApiResponse,
  UserResponse,
  UserWithRelations
} from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const userService = {
  // Get paginated list of users
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    role_id,
    include
  }: UseUserListParams = {}): Promise<UserResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(role_id && { role_id: role_id.toString() }),
      ...(include && include.length > 0 && { include: include.join(',') })
    });

    const response = await axios.get(`/user?${params}`);
    return response.data;
  },

  // Get SPV and Sales users for Telemarketing role
  getSpvSalesUsers: async (): Promise<{
    success: boolean;
    message: string;
    data: Array<{ id: number; name: string }>;
  }> => {
    const response = await axios.get('/user-spv-sales');
    return response.data;
  },

  // Get SPV and Sales users for Telemarketing role
  getSpvSalesMitraUsers: async (): Promise<{
    success: boolean;
    message: string;
    data: Array<{ id: number; name: string }>;
  }> => {
    const response = await axios.get('/user-spv-sales-mitra');
    return response.data;
  },

  // Get user by ID
  getById: async (id: number, include?: string[]): Promise<UserWithRelations> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/user/${id}${params.toString() ? `?${params}` : ''}`;
    const response = await axios.get<UserWithRelations>(url);
    return response.data;
  },

  // Create new user
  create: async (data: CreateUserData): Promise<UserWithRelations> => {
    const response = await axios.post<UserApiResponse>('/user', data);
    return response.data.data;
  },

  // Update user by ID
  update: async (id: number, data: UpdateUserData): Promise<UserWithRelations> => {
    const response = await axios.put<UserApiResponse>(`/user/${id}`, data);
    return response.data.data;
  },

  // Partial update user by ID
  partialUpdate: async (id: number, data: UpdateUserData): Promise<UserWithRelations> => {
    const response = await axios.patch<UserApiResponse>(`/user/${id}`, data);
    return response.data.data;
  },

  // Delete user by ID
  delete: async (id: number): Promise<UserWithRelations> => {
    const response = await axios.delete<UserApiResponse>(`/user/${id}`);
    return response.data.data;
  }
};

export const roleService = {
  // Get paginated list of roles
  getList: async (): Promise<RoleResponse> => {
    const response = await axios.get(`/role`);
    return response.data;
  }
};

// Query hooks
export const useUserList = ({ page = 1, perPage = 10, search = '', role_id, include }: UseUserListParams = {}) => {
  return useQuery({
    queryKey: ['/user', { page, perPage, search, role_id, include }],
    queryFn: (): Promise<UserResponse> => {
      return userService.getList({ page, perPage, search, role_id, include });
    }
  });
};

export const useUserById = (id: number | null, include?: string[]) => {
  return useQuery({
    queryKey: ['/user', id, { include }],
    queryFn: (): Promise<UserWithRelations> => {
      if (!id) throw new Error('ID is required');
      return userService.getById(id, include);
    },
    enabled: !!id
  });
};

export const useRoleList = () => {
  return useQuery({
    queryKey: ['/role'],
    queryFn: roleService.getList
  });
};

export const useSpvSalesUsers = () => {
  return useQuery({
    queryKey: ['/user-spv-sales'],
    queryFn: userService.getSpvSalesUsers
  });
};

export const useSpvSalesMitraUsers = () => {
  return useQuery({
    queryKey: ['/user-spv-sales-mitra'],
    queryFn: userService.getSpvSalesMitraUsers
  });
};

export const useSupervisorList = () => {
  return useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const response = await axios.get('/user-spv');
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData): Promise<UserWithRelations> => {
      return userService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch user list
      queryClient.invalidateQueries({ queryKey: ['/user'] });
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }): Promise<UserWithRelations> => {
      return userService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch user list and specific user
      queryClient.invalidateQueries({ queryKey: ['/user'] });
      queryClient.invalidateQueries({ queryKey: ['/user', id] });
    }
  });
};

export const usePartialUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }): Promise<UserWithRelations> => {
      return userService.partialUpdate(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch user list and specific user
      queryClient.invalidateQueries({ queryKey: ['/user'] });
      queryClient.invalidateQueries({ queryKey: ['/user', id] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<UserWithRelations> => {
      return userService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch user list
      queryClient.invalidateQueries({ queryKey: ['/user'] });
    }
  });
};
