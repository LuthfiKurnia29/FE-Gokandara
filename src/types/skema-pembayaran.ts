export interface SkemaPembayaranDetail {
  nama: string;
  persentase: number;
}

export interface SkemaPembayaran {
  id: number;
  nama: string;
  details: SkemaPembayaranDetail[];
  created_at: string;
  updated_at: string;
}

export interface SkemaPembayaranResponse {
  current_page: number;
  data: SkemaPembayaran[];
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

export interface SkemaPembayaranApiResponse {
  success: boolean;
  message: string;
  data?: SkemaPembayaran;
}

export interface CreateSkemaPembayaranData {
  nama: string;
  details: SkemaPembayaranDetail[];
}

export interface UpdateSkemaPembayaranData {
  nama: string;
  details: SkemaPembayaranDetail[];
}

export interface UseSkemaPembayaranListParams {
  page?: number;
  perPage?: number;
  search?: string;
}
