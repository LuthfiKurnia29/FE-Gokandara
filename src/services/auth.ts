import axios from '@/lib/axios';
import type { CurrentUserResponse, LoginFormData, LoginResponse } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>('/login', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    localStorage.removeItem('user-data');
  },

  getStoredToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  },

  getStoredUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getStoredUserData: (): CurrentUserResponse | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user-data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  storeAuth: (token: string, user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  storeUserData: (userData: CurrentUserResponse) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-data', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData.user));
    }
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await axios.post<CurrentUserResponse>('/me');
    return response.data;
  },

  updateProfile: async (data: FormData): Promise<CurrentUserResponse> => {
    const response = await axios.post<CurrentUserResponse>('/user-profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Permission checking utility
  hasPermission: (userData: CurrentUserResponse | null, menuCode: string): boolean => {
    // If no menuCode provided, allow access (no permission check needed)
    if (!menuCode) {
      return true;
    }

    if (!userData || !userData.access) {
      return false;
    }

    return userData.access.some((access) => access.menu.code === menuCode && access.is_allowed === 1);
  }
};

export const useCurrentUser = () => {
  const token = authService.getStoredToken();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: !!token,
    retry: false
  });
};

// Hook to easily check permissions in components
export const usePermissions = () => {
  const { data: currentUser } = useCurrentUser();
  const userData = currentUser || authService.getStoredUserData();

  const hasPermission = (menuCode: string): boolean => {
    return authService.hasPermission(userData, menuCode);
  };

  const getUserData = (): CurrentUserResponse | null => {
    return userData;
  };

  return {
    hasPermission,
    getUserData,
    userData
  };
};

// Mutation hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData): Promise<CurrentUserResponse> => {
      return authService.updateProfile(data);
    },
    onSuccess: (data) => {
      // Update stored user data
      authService.storeUserData(data);
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });
};
