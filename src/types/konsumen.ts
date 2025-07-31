import { ProjekData } from './projek';
import { ProspekData } from './prospek';
import { ReferensiData } from './referensi';

export interface KonsumenData {
  id: number;
  no: number;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  ktp_number: string;
  kesiapan_dana?: number | null;
  pengalaman?: string | null;
  materi_fu?: string | null;
  tgl_fu?: string | null;
  materi_fu_2?: string | null;
  tgl_fu_2?: string | null;
  project_id: number;
  refrensi_id: number;
  prospek_id: number;
  // Relations (optional when included)
  project?: ProjekData;
  refrensi?: ReferensiData;
  prospek?: ProspekData;
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
  kesiapan_dana?: number | null;
  pengalaman?: string | null;
  materi_fu?: string | null;
  tgl_fu?: string | null;
  materi_fu_2?: string | null;
  tgl_fu_2?: string | null;
  project_id: number;
  refrensi_id: number;
  prospek_id: number;
}

export interface UseKonsumenListParams {
  search?: string;
  page?: number;
  per_page?: number;
}
