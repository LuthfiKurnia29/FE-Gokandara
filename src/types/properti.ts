// Laravel Backend compatible Property structure
export interface PropertyData {
  id: number;
  project_id: number;
  luas_bangunan: string;
  luas_tanah: string;
  kelebihan: string;
  lokasi: string;
  harga: number;
  created_at: string;
  updated_at: string;
  // Relations (optional when included)
  projek?: {
    id: number;
    name: string;
  };
  properti_gambar?: PropertyImage[]; // ← Sesuaikan dengan response API (1 underscore)
  daftar_harga?: {
    tipe_id: number;
    unit_id: number;
    harga: number;
  }[];
}

export interface PropertyImage {
  id: number;
  properti_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyResponse {
  current_page: number;
  data: PropertyData[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PropertyApiResponse {
  message: string;
  data: PropertyData;
}

export interface PricingOption {
  tipe_id: number;
  unit_id: number;
  harga: number;
}

export interface CreatePropertyData {
  project_id: number;
  luas_bangunan: string;
  luas_tanah: string;
  kelebihan: string;
  lokasi: string;
  harga: number;
  properti__gambars: File[];
  daftar_harga?: PricingOption[]; // New optional field for multiple pricing options
}

export interface UpdatePropertyData {
  project_id?: number;
  luas_bangunan?: string;
  luas_tanah?: string;
  kelebihan?: string;
  lokasi?: string;
  harga?: number;
  properti__gambars?: File[];
  daftar_harga?: PricingOption[]; // New optional field for multiple pricing options
}

export interface UsePropertyListParams {
  page?: number;
  perPage?: number;
  search?: string;
  project_id?: number;
  include?: string[]; // Array of relations to include: ['project', 'properti_gambar']
}

// Legacy types for backward compatibility
export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  price: {
    start: number;
    end: number;
  };
  status: 'available' | 'sold' | 'pending';
  facilities: string[];
  images: string[];
  details: {
    bedrooms: number;
    bathrooms: number;
    hasWifi: boolean;
  };
  address: {
    street: string;
    district: string;
    city: string;
  };
}

export type PropertyStatus = 'available' | 'sold' | 'pending' | 'reserved';
