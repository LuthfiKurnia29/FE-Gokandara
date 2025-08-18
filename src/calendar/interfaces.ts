import type { TEventColor } from '@/calendar/types';
import { KonsumenData } from '@/types/konsumen';
import { ProspekData } from '@/types/prospek';
import { UserWithRelations } from '@/types/user';

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface IFollowup {
  id: number;
  created_at: string;
  updated_at: string;
  followup_date: string;
  followup_note: string;
  followup_result: string;
  sales_id: number;
  sales: UserWithRelations;
  konsumen_id: number;
  konsumen: KonsumenData;
  followup_last_day: string;
  color: string | null;
  prospek_id: number;
  prospek: ProspekData;
  status?: number;
}

export interface KonsumenFollowup extends KonsumenData {
  followups: IFollowup[];
}

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  konsumen: KonsumenFollowup;
  prospek: ProspekData;
  sales: UserWithRelations;
  updated_at: string;
  status?: number;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
