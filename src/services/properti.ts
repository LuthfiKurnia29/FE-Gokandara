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

interface MasterDataItem {
  id: number;
  name: string;
}

export const propertyService = {
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

  getById: async (id: number, include?: string[]): Promise<PropertyData> => {
    const params = new URLSearchParams();
    if (include && include.length > 0) {
      params.append('include', include.join(','));
    }

    const url = `/properti/${id}${params.toString() ? `?${params}` : ''}`;

    const response = await axios.get<PropertyApiResponse>(url);

    if (response.data.data) {
      return response.data.data;
    } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      return response.data as unknown as PropertyData;
    } else {
      throw new Error('Invalid response format from API');
    }
  },

  create: async (data: CreatePropertyData): Promise<PropertyData> => {
    const formData = new FormData();

    formData.append('project_id', data.project_id.toString());
    formData.append('luas_bangunan', data.luas_bangunan);
    formData.append('luas_tanah', data.luas_tanah);
    formData.append('kelebihan', data.kelebihan);
    formData.append('lokasi', data.lokasi);
    formData.append('harga', data.harga.toString());

    if (data.daftar_harga && data.daftar_harga.length > 0) {
      data.daftar_harga.forEach((harga, index) => {
        formData.append(`daftar_harga[${index}][tipe_id]`, harga.tipe_id.toString());
        formData.append(`daftar_harga[${index}][unit_id]`, harga.unit_id.toString());
        formData.append(`daftar_harga[${index}][harga]`, harga.harga.toString());
      });
    }

    if (data.fasilitas && data.fasilitas.length > 0) {
      data.fasilitas.forEach((fasilitas, index) => {
        formData.append(`fasilitas[${index}][name]`, fasilitas.name);
      });
    }

    data.properti__gambars.forEach((file, index) => {
      formData.append(`properti__gambars[${index}]`, file);
    });

    if (data.unit_ids && data.unit_ids.length > 0) {
      data.unit_ids.forEach((unit_id, index) => {
        formData.append(`unit_ids[${index}]`, unit_id.toString());
      });
    }

    if (data.tipe_ids && data.tipe_ids.length > 0) {
      data.tipe_ids.forEach((tipe_id, index) => {
        formData.append(`tipe_ids[${index}]`, tipe_id.toString());
      });
    }

    if (data.blok_ids && data.blok_ids.length > 0) {
      data.blok_ids.forEach((blok_id, index) => {
        formData.append(`blok_ids[${index}]`, blok_id.toString());
      });
    }

    const response = await axios.post<PropertyApiResponse>('/properti', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  update: async (id: number, data: UpdatePropertyData): Promise<PropertyData> => {
    const formData = new FormData();

    formData.append('_method', 'PUT');

    formData.append('project_id', data.project_id?.toString() || '');
    formData.append('luas_bangunan', data.luas_bangunan || '');
    formData.append('luas_tanah', data.luas_tanah || '');
    formData.append('kelebihan', data.kelebihan || '');
    formData.append('lokasi', data.lokasi || '');
    formData.append('harga', data.harga?.toString() || '');

    if (data.daftar_harga && data.daftar_harga.length > 0) {
      data.daftar_harga.forEach((harga, index) => {
        formData.append(`daftar_harga[${index}][tipe_id]`, harga.tipe_id.toString());
        formData.append(`daftar_harga[${index}][unit_id]`, harga.unit_id.toString());
        formData.append(`daftar_harga[${index}][harga]`, harga.harga.toString());
      });
    }

    if (data.fasilitas && data.fasilitas.length > 0) {
      data.fasilitas.forEach((fasilitas, index) => {
        formData.append(`fasilitas[${index}][nama]`, fasilitas.name);
      });
    }

    // FIXED: Always send properti__gambars as array of files
    if (data.properti__gambars && data.properti__gambars.length > 0) {
      data.properti__gambars.forEach((file, index) => {
        formData.append(`properti__gambars[${index}]`, file);
      });
    }

    if (data.unit_ids && data.unit_ids.length > 0) {
      data.unit_ids.forEach((unit_id, index) => {
        formData.append(`unit_ids[${index}]`, unit_id.toString());
      });
    }

    if (data.tipe_ids && data.tipe_ids.length > 0) {
      data.tipe_ids.forEach((tipe_id, index) => {
        formData.append(`tipe_ids[${index}]`, tipe_id.toString());
      });
    }

    if (data.blok_ids && data.blok_ids.length > 0) {
      data.blok_ids.forEach((blok_id, index) => {
        formData.append(`blok_ids[${index}]`, blok_id.toString());
      });
    }

    const response = await axios.post<PropertyApiResponse>(`/properti/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<PropertyData> => {
    const response = await axios.delete<PropertyApiResponse>(`/properti/${id}`);
    return response.data.data;
  },

  getAllProjects: async (): Promise<MasterDataItem[]> => {
    const response = await axios.get('/all-projek');
    return response.data.data || response.data || [];
  },

  getAllProperti: async (): Promise<PropertyData[]> => {
    const response = await axios.get('/all-properti?include=projek');
    return response.data.data || response.data || [];
  }
};

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
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useAllProjects = () => {
  return useQuery({
    queryKey: ['/all-projek'],
    queryFn: propertyService.getAllProjects,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
};

export const useAllProperti = () => {
  return useQuery({
    queryKey: ['/all-properti'],
    queryFn: propertyService.getAllProperti,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyData): Promise<PropertyData> => {
      return propertyService.create(data);
    },
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: ['/properti'] });
    }
  });
};
