import type { TEventColor } from '@/calendar/types';
import { KonsumenData } from '@/types/konsumen';
import { ProspekData } from '@/types/prospek';

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  user: KonsumenData | IUser;
  prospek: ProspekData;
  updated_at: string;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
