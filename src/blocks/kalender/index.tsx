'use client';

import { memo, useMemo, useState } from 'react';

import { MemberFilterModal } from '@/blocks/home/member-filter-modal';
import { ChangeBadgeVariantInput } from '@/calendar/components/change-badge-variant-input';
import { ChangeVisibleHoursInput } from '@/calendar/components/change-visible-hours-input';
import { ChangeWorkingHoursInput } from '@/calendar/components/change-working-hours-input';
import { CalendarProvider, useCalendar } from '@/calendar/contexts/calendar-context';
import type { IEvent, IUser } from '@/calendar/interfaces';
import { TCalendarView, TEventColor } from '@/calendar/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/services/auth';

import KalenderContainer from './container';
import { Filter, Settings, X } from 'lucide-react';

const KalenderPage = memo(function KalenderPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [view, setView] = useState<TCalendarView>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMemberFilter, setShowMemberFilter] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const { getUserData } = usePermissions();

  // Get current user data for role checking
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;

  // Check if user can see filter button (Admin and Supervisor only)
  const canSeeFilterButton = () => {
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRoleId === 1 ||
      userRoleId === 2
    );
  };

  // Handle member filter selection
  const handleSelectMember = (userId: number, userName: string) => {
    setSelectedMemberId(userId);
    setSelectedMemberName(userName);
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setSelectedMemberId(null);
    setSelectedMemberName('');
  };

  // Remount provider if the list of event ids changes to sync internal state
  const providerKey = useMemo(() => JSON.stringify(events.map((e) => `${e.id}-${e.updated_at}`)), [events]);

  return (
    <CalendarProvider key={providerKey} users={[]} events={events} defaultView={view} defaultDate={selectedDate}>
      <div className='mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4'>
        {/* Member Filter Section - Only show for Admin and Supervisor */}
        {canSeeFilterButton() && (
          <div className='flex flex-wrap items-center gap-2'>
            {selectedMemberId && (
              <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-3 py-1'>
                <span className='text-sm font-medium'>Filter: {selectedMemberName}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleClearFilter}
                  className='hover:bg-primary/20 h-6 w-6 p-0'>
                  <X className='h-3 w-3' />
                </Button>
              </div>
            )}
            <Button variant='outline' onClick={() => setShowMemberFilter(true)} className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              Filter Berdasarkan Member
            </Button>
          </div>
        )}

        <KalenderContainer
          setEvents={setEvents}
          setView={setView}
          setSelectedDate={setSelectedDate}
          selectedMemberId={selectedMemberId}
        />

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

        {/* Member Filter Modal */}
        <MemberFilterModal
          open={showMemberFilter}
          onOpenChange={setShowMemberFilter}
          onSelectMember={handleSelectMember}
        />
      </div>
    </CalendarProvider>
  );
});

export default KalenderPage;
