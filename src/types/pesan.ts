import { UserData, UserWithRelations } from './user';

export interface UserBasicData {
  id: number;
  name: string;
  email: string;
  nip?: string;
  email_verified_at?: string | null;
  parent_id?: number | null;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface PesanData {
  id: number;
  user_pengirim_id: number;
  user_penerima_id: number;
  pesan: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  penerima: UserBasicData;
  pengirim: UserBasicData;
}

export interface ChatConversationData extends UserWithRelations {
  id: number;
  last_message: PesanData;
  created_at: string;
  updated_at: string;
  unread_count: number;
}

export interface PesanPaginationResponse {
  current_page: number;
  data: PesanData[];
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

export interface ChatConversationResponse {
  current_page: number;
  data: ChatConversationData[];
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

export interface PesanApiResponse {
  message: string;
  data: PesanData;
}

export interface UsePesanListParams {
  page?: number;
  perPage?: number;
  id_user: number;
}

export interface UseChatConversationListParams {
  page?: number;
  perPage?: number;
  search?: string;
  participant_id?: number;
}

export interface UseSalespersonListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface CreatePesanData {
  user_penerima_id: number;
  pesan: string;
}
