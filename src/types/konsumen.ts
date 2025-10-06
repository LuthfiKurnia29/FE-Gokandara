import { ProjekData } from './projek';
import { ProspekData } from './prospek';
import { ReferensiData } from './referensi';
import { UserData } from './user';

export interface KonsumenData {
  id: number;
  no: number;
  name: string;
  description: string;
  phone: string;
  email?: string;
  address: string;
  ktp_number: string;
  status_delete?: number | string | null;
  kesiapan_dana?: number | null;
  pengalaman?: string | null;
  materi_fu_1?: string | null;
  tgl_fu_1?: string | null;
  materi_fu_2?: string | null;
  tgl_fu_2?: string | null;
  project_id: number;
  refrensi_id: number;
  prospek_id: number;
  created_id?: number | null; // ID of the supervisor/sales user
  created_at?: string; // Timestamp pembuatan data
  gambar?: string | null; // URL gambar untuk existing data
  gambar_url?: string | null; // Full URL gambar untuk menampilkan
  // Relations (optional when included)
  project?: ProjekData;
  refrensi?: ReferensiData;
  prospek?: ProspekData;
  created_by?: UserData;
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
  email?: string;
  address: string;
  ktp_number?: string;
  kesiapan_dana?: number | null;
  pengalaman?: string | null;
  materi_fu_1?: string | null;
  tgl_fu_1?: string | null;
  materi_fu_2?: string | null;
  tgl_fu_2?: string | null;
  project_id: number;
  refrensi_id: number;
  prospek_id: number;
  created_id?: number | null; // ID of the supervisor/sales user
  gambar?: File[]; // File array untuk upload gambar
}

export interface UseKonsumenListParams {
  search?: string;
  page?: number;
  per_page?: number;
  created_id?: number;
}
