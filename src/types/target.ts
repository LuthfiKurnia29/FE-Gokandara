export interface Target {
  id: number;
  role_id: number;
  tanggal_awal: string;
  tanggal_akhir: string;
  min_penjualan: number;
  hadiah: string;
  created_at: string;
  updated_at: string;
}

export interface TargetWithRelations extends Target {
  role?: {
    id: number;
    name: string;
    code: string;
  };
  // Additional fields for non-admin users (from backend)
  has_claimed?: boolean;
  is_achieved?: boolean;
  total_penjualan?: number;
  percentage?: number;
}

export interface TargetResponse {
  current_page: number;
  data: TargetWithRelations[];
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

export interface TargetApiResponse {
  message: string;
  data: TargetWithRelations;
}

export interface CreateTargetData {
  role_id: number;
  tanggal_awal: string;
  tanggal_akhir: string;
  min_penjualan: number;
  hadiah: string;
}

export interface UpdateTargetData {
  role_id?: number;
  tanggal_awal?: string;
  tanggal_akhir?: string;
  min_penjualan?: number;
  hadiah?: string;
}

export interface UseTargetListParams {
  page?: number;
  perPage?: number;
  search?: string;
  role_id?: number;
  created_id?: number;
  include?: string[];
}
