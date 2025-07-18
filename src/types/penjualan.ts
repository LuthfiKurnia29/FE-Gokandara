export type PenjualanStatus = 'Negotiation' | 'Pending' | 'Approved';

export interface PenjualanData {
  id: number;
  konsumenId: number;
  propertiId: number;
  diskon: number;
  grandTotal: number;
  status: PenjualanStatus;
  sales?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Enhanced interface with optional relations
export interface PenjualanWithRelations extends PenjualanData {
  konsumen?: import('./konsumen').KonsumenData;
  property?: import('./property').PropertyData;
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
  konsumenId: number;
  propertiId: number;
  diskon: number;
  grandTotal: number;
  status: PenjualanStatus;
}

export interface UpdatePenjualanData {
  konsumenId?: number;
  propertiId?: number;
  diskon?: number;
  grandTotal?: number;
  status?: PenjualanStatus;
}

export interface UpdatePenjualanStatusData {
  status: PenjualanStatus;
}

export interface UsePenjualanListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: PenjualanStatus;
  konsumenId?: number;
  include?: string[]; // Array of relations to include: ['konsumen', 'property']
}
