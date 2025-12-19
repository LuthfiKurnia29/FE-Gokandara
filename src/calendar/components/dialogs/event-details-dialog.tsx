'use client';

import { EditEventDialog } from '@/calendar/components/dialogs/edit-event-dialog';
import type { IEvent } from '@/calendar/interfaces';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useUpdateCalendarStatus } from '@/services/calendar';



import { LogsEventDialog } from './logs-event-dialog';
import { format, parseISO } from 'date-fns';
import { Calendar, CheckCheck, Clock, Text, User, UserCircle } from 'lucide-react';





interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  const { mutate: updateCalendarStatus, isLoading: isUpdatingCalendarStatus } = useUpdateCalendarStatus();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className='h-[90vh] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {event.status && <Badge className='bg-green-600 text-white'>Selesai</Badge>}

            {/* Display Sales Name */}
            {event.sales && (
              <div className='flex items-start gap-2'>
                <UserCircle className='mt-1 size-4 shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Dibuat oleh</p>
                  <div className='mt-1 flex items-center gap-2'>
                    <Avatar className='size-6'>
                      <AvatarImage src={event.sales.image_url || undefined} alt={event.sales.name} />
                      <AvatarFallback className='text-xs'>{event.sales.name?.[0] || 'S'}</AvatarFallback>
                    </Avatar>
                    <p className='text-muted-foreground text-sm'>{event.sales.name}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='flex items-start gap-2'>
              <User className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Konsumen</p>
                <p className='text-muted-foreground text-sm'>{event.konsumen?.name}</p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Calendar className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Follow Up Awal</p>
                <p className='text-muted-foreground text-sm'>{format(startDate, 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Clock className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Follow Up Terakhir</p>
                <p className='text-muted-foreground text-sm'>{format(endDate, 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Text className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Hasil Follow Up</p>
                <p className='text-muted-foreground text-sm'>{event.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className='mt-8'>
            <LogsEventDialog event={event} onClose={onClose}>
              <Button type='button' variant='outline'>
                Log Survey
              </Button>
            </LogsEventDialog>
            <EditEventDialog event={event}>
              <Button type='button' className='bg-amber-400 hover:bg-amber-500'>
                Edit
              </Button>
            </EditEventDialog>
            {!event.status && (
              <Button
                type='button'
                className='ml-auto w-32 bg-green-600 text-white hover:bg-green-700'
                onClick={() => updateCalendarStatus(event.id)}
                disabled={isUpdatingCalendarStatus}>
                <CheckCheck />
                Selesai
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
