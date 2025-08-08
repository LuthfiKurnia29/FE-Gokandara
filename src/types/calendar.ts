import { KonsumenData } from './konsumen';
import { ProspekData } from './prospek';
import { UserWithRelations } from './user';

export interface FollowupMonitoring {
  id: number;
  followup_date: string; // ISO or datetime string
  followup_note: string;
  followup_result: string;
  konsumen_id: number;
  followup_last_day: string; // ISO or datetime string
  prospek_id: number;
  sales_id: number;
  konsumen: KonsumenData;
  prospek: ProspekData;
  sales: UserWithRelations;
  updated_at: string;
}

export interface CalendarListResponse {
  success: boolean;
  message: string;
  data: FollowupMonitoring[];
}

export interface CalendarItemResponse {
  success: boolean;
  message: string;
  data: FollowupMonitoring;
}

export interface CreateCalendarPayload {
  followup_date: string;
  followup_note: string;
  followup_result: string;
  konsumen_id: number;
  followup_last_day: string;
  prospek_id: number;
}

export type UpdateCalendarPayload = CreateCalendarPayload;
