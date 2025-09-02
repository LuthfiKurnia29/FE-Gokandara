'use client';

import { memo, useEffect, useMemo } from 'react';

import { ClientContainer } from '@/calendar/components/client-container';
import { useCalendar } from '@/calendar/contexts/calendar-context';
import { IEvent, KonsumenFollowup } from '@/calendar/interfaces';
import { TCalendarView, TEventColor } from '@/calendar/types';
import { usePermissions } from '@/services/auth';
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
  setSelectedDate,
  selectedMemberId
}: {
  setEvents: (events: IEvent[]) => void;
  setView: (view: TCalendarView) => void;
  setSelectedDate: (date: Date) => void;
  selectedMemberId?: number | null;
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

  // Get current user data for role checking
  const { getUserData } = usePermissions();
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;
  const userId = userData?.user?.id || 0;

  // Determine sales_id filter based on user role
  const getSalesIdFilter = () => {
    // If Admin/Supervisor has selected a member filter, use that
    if (
      (userRole === 'Administrator' ||
        userRole === 'Admin' ||
        userRole === 'Supervisor' ||
        userRoleId === 1 ||
        userRoleId === 2) &&
      selectedMemberId
    ) {
      return selectedMemberId;
    }

    // If user is Sales/Mitra/Telemarketing, automatically filter by their own data
    if (
      userRole === 'Sales' ||
      userRole === 'Mitra' ||
      userRole === 'Telemarketing' ||
      userRoleId === 3 ||
      userRoleId === 4
    ) {
      return userId;
    }

    // If Admin/Supervisor and no filter selected, show all data
    return undefined;
  };

  const { data: items, refetch } = useCalendarList({
    startDay,
    endDay,
    sales_id: getSalesIdFilter()
  });

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
      sales: item.sales as UserWithRelations,
      status: item.status
    }));

    setEvents(events);
    setView(view);
  }, [items, setEvents, setView, view, selectedMemberId]);

  return <ClientContainer view={view} />;
});

export default KalenderContainer;
