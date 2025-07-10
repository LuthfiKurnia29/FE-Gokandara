import axios from '@/lib/axios';
import {
  CreatePropertyData,
  PropertyApiResponse,
  PropertyData,
  PropertyResponse,
  UpdatePropertyData,
  UsePropertyListParams
} from '@/types/property';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const propertyService = {
  // Get paginated list of properties
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    status,
    type,
    location,
    minPrice,
    maxPrice
  }: UsePropertyListParams = {}): Promise<PropertyResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(type && { type }),
      ...(location && { location }),
      ...(minPrice && { min_price: minPrice.toString() }),
      ...(maxPrice && { max_price: maxPrice.toString() })
    });

    const response = await axios.get(`/property?${params}`);
    return response.data;
  },

  // Get property by ID
  getById: async (id: number): Promise<PropertyData> => {
    const response = await axios.get<PropertyApiResponse>(`/property/${id}`);
    return response.data.data;
  },

  // Create new property
  create: async (data: CreatePropertyData): Promise<PropertyData> => {
    const response = await axios.post<PropertyApiResponse>('/property', data);
    return response.data.data;
  },

  // Update property by ID
  update: async (id: number, data: UpdatePropertyData): Promise<PropertyData> => {
    const response = await axios.put<PropertyApiResponse>(`/property/${id}`, data);
    return response.data.data;
  },

  // Partial update property by ID
  partialUpdate: async (id: number, data: UpdatePropertyData): Promise<PropertyData> => {
    const response = await axios.patch<PropertyApiResponse>(`/property/${id}`, data);
    return response.data.data;
  },

  // Delete property by ID
  delete: async (id: number): Promise<PropertyData> => {
    const response = await axios.delete<PropertyApiResponse>(`/property/${id}`);
    return response.data.data;
  }
};

// Query hooks
export const usePropertyList = ({
  page = 1,
  perPage = 10,
  search = '',
  status,
  type,
  location,
  minPrice,
  maxPrice
}: UsePropertyListParams = {}) => {
  return useQuery({
    queryKey: ['/property', { page, perPage, search, status, type, location, minPrice, maxPrice }],
    queryFn: (): Promise<PropertyResponse> => {
      return propertyService.getList({ page, perPage, search, status, type, location, minPrice, maxPrice });
    }
  });
};

export const usePropertyById = (id: number | null) => {
  return useQuery({
    queryKey: ['/property', id],
    queryFn: (): Promise<PropertyData> => {
      if (!id) throw new Error('ID is required');
      return propertyService.getById(id);
    },
    enabled: !!id
  });
};

// Mutation hooks
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyData): Promise<PropertyData> => {
      return propertyService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch property list
      queryClient.invalidateQueries({ queryKey: ['/property'] });
    }
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePropertyData }): Promise<PropertyData> => {
      return propertyService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch property list and specific property
      queryClient.invalidateQueries({ queryKey: ['/property'] });
      queryClient.invalidateQueries({ queryKey: ['/property', id] });
    }
  });
};

export const usePartialUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePropertyData }): Promise<PropertyData> => {
      return propertyService.partialUpdate(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch property list and specific property
      queryClient.invalidateQueries({ queryKey: ['/property'] });
      queryClient.invalidateQueries({ queryKey: ['/property', id] });
    }
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<PropertyData> => {
      return propertyService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch property list
      queryClient.invalidateQueries({ queryKey: ['/property'] });
    }
  });
};
