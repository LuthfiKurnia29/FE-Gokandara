'use client';

import { memo, useMemo, useState } from 'react';

import { ChangeBadgeVariantInput } from '@/calendar/components/change-badge-variant-input';
import { ChangeVisibleHoursInput } from '@/calendar/components/change-visible-hours-input';
import { ChangeWorkingHoursInput } from '@/calendar/components/change-working-hours-input';
import { CalendarProvider, useCalendar } from '@/calendar/contexts/calendar-context';
import type { IEvent, IUser } from '@/calendar/interfaces';
import { TCalendarView, TEventColor } from '@/calendar/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCurrentUser } from '@/services/auth';
import { useCalendarList } from '@/services/calendar';

import KalenderContainer from './container';
import { Settings } from 'lucide-react';

const KalenderPage = memo(function KalenderPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [view, setView] = useState<TCalendarView>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Remount provider if the list of event ids changes to sync internal state
  const providerKey = useMemo(() => JSON.stringify(events.map((e) => `${e.id}-${e.updated_at}`)), [events]);

  return (
    <CalendarProvider key={providerKey} users={[]} events={events} defaultView={view} defaultDate={selectedDate}>
      <div className='mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4'>
        <KalenderContainer setEvents={setEvents} setView={setView} setSelectedDate={setSelectedDate} />

        <Accordion type='single' collapsible>
          <AccordionItem value='item-1' className='border-none'>
            <AccordionTrigger className='flex-none gap-2 py-0 hover:no-underline'>
              <div className='flex items-center gap-2'>
                <Settings className='size-4' />
                <p className='text-base font-semibold'>Calendar settings</p>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className='mt-4 flex flex-col gap-6'>
                <ChangeBadgeVariantInput />
                <ChangeVisibleHoursInput />
                <ChangeWorkingHoursInput />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </CalendarProvider>
  );
});

export default KalenderPage;
