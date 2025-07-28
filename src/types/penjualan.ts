export type PenjualanStatus = 'Negotiation' | 'Pending' | 'Approved';

export interface PenjualanData {
  id: number;
  konsumen_id: number;
  properti_id: number;
  blok_id: number;
  tipe_id: number;
  unit_id: number;
  diskon: number | null;
  grand_total: number;
  status: PenjualanStatus;
  created_at: string;
  updated_at: string;
}

// Enhanced interface with optional relations
export interface PenjualanWithRelations extends PenjualanData {
  konsumen?: import('./konsumen').KonsumenData;
  properti?: import('./property').PropertyData;
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
}

export interface UpdatePenjualanData {
  konsumen_id?: number;
  properti_id?: number;
  blok_id?: number;
  tipe_id?: number;
  unit_id?: number;
  diskon?: number | null;
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
