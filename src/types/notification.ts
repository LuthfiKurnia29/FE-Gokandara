import { KonsumenData } from './konsumen';
import { PesanData } from './pesan';
import { Target } from './target';
import { UserWithRelations } from './user';

export type NotificationKind = 'chat' | 'konsumen' | 'claim';

export interface NotificationItem {
  id: number;
  jenis_notifikasi: NotificationKind;
  is_read: boolean | number;
  message?: string;
  created_at: string;
  // Optional relations/payloads from backend
  pengirim?: UserWithRelations;
  konsumen?: KonsumenData;
  phone?: string;
  chatting: PesanData;
  payload?: Record<string, any>;
  user?: UserWithRelations;
  target?: Target;
}

export interface NotificationPaginationResponse {
  current_page?: number;
  data: NotificationItem[];
  last_page?: number;
  total?: number;
}
