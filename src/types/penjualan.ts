export type PenjualanStatus = 'Pending' | 'Negotiation' | 'Approved' | 'Rejected';

// PropertyData interface matching the seeder structure
export interface PropertyData {
  id: number;
  name: string;
  code: string;
  project_id: number;
  blok_id: number;
  unit_id: number;
  tipe_id: number;
  luas_bangunan: string;
  luas_tanah: string;
  kelebihan: string;
  lokasi: string;
  harga: number;
}

export interface PenjualanData {
  id: number;
  konsumen_id: number;
  properti_id: number;
  blok_id: number;
  tipe_id: number;
  unit_id: number;
  diskon: number | null;
  tipe_diskon: 'percent' | 'fixed' | null;
  grand_total: number;
  status: PenjualanStatus;
  created_at: string;
  updated_at: string;
}

// Enhanced interface with optional relations
export interface PenjualanWithRelations extends PenjualanData {
  konsumen?: import('./konsumen').KonsumenData;
  properti?: PropertyData;
  blok?: import('./blok').BlokData;
  tipe?: import('./tipe').TipeData;
  unit?: import('./unit').UnitData;
}

export interface PenjualanResponse {
  current_page: number;
  data: PenjualanWithRelations[];
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

export interface PenjualanApiResponse {
  message: string;
  data: PenjualanWithRelations;
}

export interface CreatePenjualanData {
  konsumen_id: number;
  properti_id: number;
  blok_id: number;
  tipe_id: number;
  unit_id: number;
  diskon?: number | null;
  tipe_diskon?: 'percent' | 'fixed' | null;
  grand_total?: number;
  status?: PenjualanStatus;
}

export interface UpdatePenjualanData {
  konsumen_id?: number;
  properti_id?: number;
  blok_id?: number;
  tipe_id?: number;
  unit_id?: number;
  diskon?: number | null;
  tipe_diskon?: 'percent' | 'fixed' | null;
  grand_total?: number;
}

export interface UpdatePenjualanStatusData {
  status: PenjualanStatus;
}

export interface UsePenjualanListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: PenjualanStatus;
  konsumen_id?: number;
  properti_id?: number;
  include?: string[]; // Array of relations to include: ['konsumen', 'properti', 'blok', 'tipe', 'unit']
}
