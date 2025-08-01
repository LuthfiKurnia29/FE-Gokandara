import axios from '@/lib/axios';
import {
  CreatePropertyData,
  PropertyApiResponse,
  PropertyData,
  PropertyResponse,
  UpdatePropertyData,
  UsePropertyListParams
} from '@/types/properti';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Master Data Interfaces for form dropdowns
interface MasterDataItem {
  id: number;
  name: string;
}

export const propertyService = {
  // Get paginated list of properties
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    project_id,
    include
  }: UsePropertyListParams = {}): Promise<PropertyResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(project_id && { project_id: project_id.toString() }),
      ...(include && include.length > 0 && { include: include.join(',') })
    });

    const response = await axios.get(`/properti?${params}`);
    return response.data;
  },

  // Get property by ID
  getById: async (id: number, include?: string[]): Promise<PropertyData> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/properti/${id}${params.toString() ? `?${params}` : ''}`;
    console.log('🔍 Fetching property by ID:', { id, url, include });

    const response = await axios.get<PropertyApiResponse>(url);
    console.log('📡 API Response for property:', {
      status: response.status,
      data: response.data,
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });

    // Handle different response formats
    if (response.data.data) {
      console.log('✅ Using response.data.data format');
      return response.data.data; // Format: { message: "...", data: {...} }
    } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      console.log('✅ Using direct response.data format');
      return response.data as unknown as PropertyData; // Format: { ... } (direct data)
    } else {
      console.error('❌ Invalid response format:', response.data);
      throw new Error('Invalid response format from API');
    }
  },

  // Create new property
  create: async (data: CreatePropertyData): Promise<PropertyData> => {
    const formData = new FormData();

    // Add basic fields
    formData.append('project_id', data.project_id.toString());
    formData.append('luas_bangunan', data.luas_bangunan);
    formData.append('luas_tanah', data.luas_tanah);
    formData.append('kelebihan', data.kelebihan);
    formData.append('lokasi', data.lokasi);
    formData.append('harga', data.harga.toString());

    // Add images
    data.properti__gambars.forEach((file, index) => {
      formData.append(`properti__gambars[${index}]`, file);
    });

    const response = await axios.post<PropertyApiResponse>('/properti', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Update property by ID
  update: async (id: number, data: UpdatePropertyData): Promise<PropertyData> => {
    const formData = new FormData();

    // Add _method for Laravel to handle PUT request via POST
    formData.append('_method', 'PUT');

    // Always add all required fields (don't use conditional checks)
    formData.append('project_id', data.project_id?.toString() || '');
    formData.append('luas_bangunan', data.luas_bangunan || '');
    formData.append('luas_tanah', data.luas_tanah || '');
    formData.append('kelebihan', data.kelebihan || '');
    formData.append('lokasi', data.lokasi || '');
    formData.append('harga', data.harga?.toString() || '');

    // Add images if provided
    if (data.properti__gambars && data.properti__gambars.length > 0) {
      data.properti__gambars.forEach((file, index) => {
        formData.append(`properti__gambars[${index}]`, file);
      });
    }

    console.log('📤 Properti Update - FormData entries:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });

    console.log('📤 Properti Update - Request details:', {
      url: `/properti/${id}`,
      method: 'POST',
      hasFormData: !!formData,
      formDataEntries: Array.from(formData.entries()).length,
      data: data
    });

    // Debug: Check if FormData is properly constructed
    const formDataCheck = {
      _method: formData.get('_method'),
      project_id: formData.get('project_id'),
      luas_bangunan: formData.get('luas_bangunan'),
      luas_tanah: formData.get('luas_tanah'),
      kelebihan: formData.get('kelebihan'),
      lokasi: formData.get('lokasi'),
      harga: formData.get('harga'),
      hasImages: formData.getAll('properti__gambars').length > 0
    };
    console.log('📤 Properti Update - FormData Check:', formDataCheck);

    const response = await axios.post<PropertyApiResponse>(`/properti/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Delete property by ID
  delete: async (id: number): Promise<PropertyData> => {
    const response = await axios.delete<PropertyApiResponse>(`/properti/${id}`);
    return response.data.data;
  },

  // Master Data Services for form dropdowns
  getAllProjects: async (): Promise<MasterDataItem[]> => {
    const response = await axios.get('/all-projek');
    return response.data.data || response.data || [];
  },

  // Get all properties for dropdown (used in transaksi)
  getAllProperti: async (): Promise<PropertyData[]> => {
    const response = await axios.get('/all-properti?include=projek');
    return response.data.data || response.data || [];
  }
};

// Query hooks
export const usePropertyList = ({
  page = 1,
  perPage = 10,
  search = '',
  project_id,
  include
}: UsePropertyListParams = {}) => {
  return useQuery({
    queryKey: ['/properti', { page, perPage, search, project_id, include }],
    queryFn: (): Promise<PropertyResponse> => {
      return propertyService.getList({ page, perPage, search, project_id, include });
    }
  });
};

export const usePropertyById = (id: number | null, include?: string[]) => {
  return useQuery({
    queryKey: ['/properti', 'by-id', id, { include }],
    queryFn: async (): Promise<PropertyData> => {
      if (!id) throw new Error('ID is required');
      try {
        return await propertyService.getById(id, include);
      } catch (error) {
        console.error('Error fetching property by ID:', error);
        throw new Error(
          `Failed to fetch property with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
    enabled: id !== null && id !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry 2 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
  });
};

// Master Data Hooks for form dropdowns
export const useAllProjects = () => {
  return useQuery({
    queryKey: ['/all-projek'],
    queryFn: propertyService.getAllProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useAllProperti = () => {
  return useQuery({
    queryKey: ['/all-properti'],
    queryFn: propertyService.getAllProperti,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
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
      queryClient.invalidateQueries({ queryKey: ['/properti'] });
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
      queryClient.invalidateQueries({ queryKey: ['/properti'] });
      queryClient.invalidateQueries({ queryKey: ['/properti', 'by-id', id] });
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
      queryClient.invalidateQueries({ queryKey: ['/properti'] });
    }
  });
};
