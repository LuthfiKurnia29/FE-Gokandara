import { KonsumenData } from './konsumen';
import { ProspekData } from './prospek';
import { UserWithRelations } from './user';

// Follow-up history item interface
export interface FollowUpHistoryItem {
  id: number;
  followup_date: string;
  followup_note: string;
  followup_result: string;
  konsumen_id: number;
  followup_last_day: string;
  prospek_id: number;
  sales_id: number;
  konsumen: KonsumenData;
  prospek: ProspekData;
  sales: UserWithRelations;
  created_at: string;
  updated_at: string;
  status?: number;
}

// Create follow-up data interface
export interface CreateFollowUpData {
  konsumen_id: number;
  followup_date: string;
  followup_note: string;
  followup_result?: string;
  prospek_id: number;
}

// Follow-up history response interface
export interface FollowUpHistoryResponse {
  success: boolean;
  message: string;
  data: FollowUpHistoryItem[];
}
