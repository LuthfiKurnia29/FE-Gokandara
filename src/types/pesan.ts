export interface SalespersonData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  position: string;
  department: string;
  status: 'online' | 'offline' | 'busy';
  created_at: string;
  updated_at: string;
}

export interface PesanData {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  sender: SalespersonData;
  receiver: SalespersonData;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationData {
  id: number;
  participant_1_id: number;
  participant_2_id: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  participant_1: SalespersonData;
  participant_2: SalespersonData;
  created_at: string;
  updated_at: string;
}

export interface PesanResponse {
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

export interface SalespersonApiResponse {
  message: string;
  data: SalespersonData;
}

export interface CreatePesanData {
  receiver_id: number;
  message: string;
  message_type?: 'text' | 'image' | 'file';
}

export interface UsePesanListParams {
  page?: number;
  perPage?: number;
  search?: string;
  sender_id?: number;
  receiver_id?: number;
  conversation_id?: number;
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
  status?: 'online' | 'offline' | 'busy';
}
