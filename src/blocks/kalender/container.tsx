'use client';

import { memo, useEffect, useMemo } from 'react';

import { ClientContainer } from '@/calendar/components/client-container';
import { useCalendar } from '@/calendar/contexts/calendar-context';
import { IEvent, KonsumenFollowup } from '@/calendar/interfaces';
import { TCalendarView, TEventColor } from '@/calendar/types';
import { useCalendarList } from '@/services/calendar';
import { UserWithRelations } from '@/types/user';

import {
  addDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatDate,
  startOfMonth,
  startOfWeek,
  startOfYear
} from 'date-fns';

const KalenderContainer = memo(function KalenderContainer({
  setEvents,
  setView,
  setSelectedDate
}: {
  setEvents: (events: IEvent[]) => void;
  setView: (view: TCalendarView) => void;
  setSelectedDate: (date: Date) => void;
}) {
  const { view, selectedDate } = useCalendar();

  const startDay = useMemo(() => {
    if (view === 'day') return formatDate(selectedDate, 'yyyy-MM-dd');
    if (view === 'week') return formatDate(startOfWeek(selectedDate), 'yyyy-MM-dd');
    if (view === 'month') return formatDate(startOfMonth(selectedDate), 'yyyy-MM-dd');
    if (view === 'year') return formatDate(startOfYear(selectedDate), 'yyyy-MM-dd');
    if (view === 'agenda') return formatDate(startOfYear(selectedDate), 'yyyy-MM-dd');

    return null;
  }, [view, selectedDate]);

  const endDay = useMemo(() => {
    if (view === 'day') return formatDate(addDays(selectedDate, 1), 'yyyy-MM-dd');
    if (view === 'week') return formatDate(endOfWeek(selectedDate), 'yyyy-MM-dd');
    if (view === 'month') return formatDate(endOfMonth(selectedDate), 'yyyy-MM-dd');
    if (view === 'year') return formatDate(endOfYear(selectedDate), 'yyyy-MM-dd');
    if (view === 'agenda') return formatDate(endOfYear(selectedDate), 'yyyy-MM-dd');

    return null;
  }, [view, selectedDate]);

  useEffect(() => {
    setSelectedDate(selectedDate);
  }, [selectedDate, setSelectedDate]);

  const { data: items, refetch } = useCalendarList({ startDay, endDay });

  useEffect(() => {
    if (!items) return;
    const events = items.map((item) => ({
      id: item.id,
      startDate: new Date(item.followup_date).toISOString(),
      endDate: new Date(item.followup_last_day || item.followup_date).toISOString(),
      title: item.followup_note,
      color: item.prospek.color as TEventColor,
      description: item.followup_result,
      konsumen: item.konsumen as KonsumenFollowup,
      prospek: item.prospek,
      updated_at: item.updated_at,
      sales: item.sales as UserWithRelations
    }));

    setEvents(events);
    setView(view);
  }, [items, setEvents, setView, view]);

  return <ClientContainer view={view} />;
});

export default KalenderContainer;
