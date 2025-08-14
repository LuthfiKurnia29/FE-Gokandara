export type NotificationKind = 'chat' | 'konsumen';

export interface NotificationItem {
  id: number;
  type: NotificationKind;
  is_read: boolean | number;
  message?: string;
  created_at: string;
  // Optional relations/payloads from backend
  pengirim?: import('./user').UserWithRelations;
  konsumen?: import('./konsumen').KonsumenData;
  phone?: string;
  payload?: Record<string, any>;
}

export interface NotificationPaginationResponse {
  current_page?: number;
  data: NotificationItem[];
  last_page?: number;
  total?: number;
}
