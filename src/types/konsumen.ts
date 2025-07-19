export interface KonsumenData {
  id: number;
  no: number;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  ktp_number: string;
}

export interface KonsumenResponse {
  current_page: number;
  data: KonsumenData[];
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

export interface KonsumenApiResponse {
  message: string;
  data: KonsumenData;
}

export interface CreateKonsumenData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  ktp_number: string;
}

export interface UseKonsumenListParams {
  page?: number;
  perPage?: number;
  search?: string;
}
