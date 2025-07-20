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

export interface PropertyImage {
  url: string;
  alt: string;
  thumbnail?: boolean;
}

// Database-compatible Property structure for API operations
export type PropertyStatus = 'available' | 'sold' | 'pending' | 'reserved';

export interface PropertyData {
  id: number;
  code: string; // A1, B2, C3, etc.
  name: string;
  description: string;
  location: string;
  address: string;
  price: number;
  discountPrice?: number;
  status: PropertyStatus;
  type: string; // Apartment, House, Villa, etc.
  bedrooms: number;
  bathrooms: number;
  area: number; // in sqm
  facilities: string[];
  images: string[];
  hasWifi: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface CreatePropertyData {
  code: string;
  name: string;
  description: string;
  location: string;
  address: string;
  price: number;
  discountPrice?: number;
  status: PropertyStatus;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  facilities: string[];
  images: string[];
  hasWifi: boolean;
}

export interface UpdatePropertyData {
  code?: string;
  name?: string;
  description?: string;
  location?: string;
  address?: string;
  price?: number;
  discountPrice?: number;
  status?: PropertyStatus;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  facilities?: string[];
  images?: string[];
  hasWifi?: boolean;
}

export interface UsePropertyListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: PropertyStatus;
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}
