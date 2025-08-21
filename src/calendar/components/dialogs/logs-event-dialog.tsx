import { memo } from 'react';

import { IEvent } from '@/calendar/interfaces';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useDisclosure } from '@/hooks/use-disclosure';
import { cn } from '@/lib/utils';
import { useDeleteCalendar, useUpdateCalendarStatus } from '@/services/calendar';

import { AddEventDialog } from './add-event-dialog';
import { EditEventDialog } from './edit-event-dialog';
import { format } from 'date-fns';
import { Calendar, Check, Clock, EllipsisVertical, MapPin, Pencil, Trash, User, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface IProps {
  children: React.ReactNode;
  event: IEvent;
  onClose: () => void;
}

export const LogsEventDialog = memo(({ children, event, onClose: onCloseParent }: IProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const followups = event.konsumen?.followups || [];

  const getStatusColor = (color?: string | null) => {
    if (!color) return 'bg-gray-200';
    const mapping: Record<string, string> = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      red: 'bg-red-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      gray: 'bg-gray-100'
    };
    return mapping[color] ?? 'bg-gray-100';
  };

  const { mutate: updateCalendarStatus, isLoading: isUpdatingCalendarStatus } = useUpdateCalendarStatus(() => {
    onClose();
    onCloseParent();
    toast.success('Jadwal berhasil ditandai selesai');
  });

  const { mutate: deleteCalendar, isLoading: isDeletingCalendar } = useDeleteCalendar(() => {
    onClose();
    onCloseParent();
    toast.success('Jadwal berhasil dihapus');
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='w-full !max-w-[calc(100vw-2rem)] md:w-[900px]'>
        <DialogHeader className='flex flex-row items-center justify-between'>
          <div className='text-left'>
            <DialogTitle>Detail Jadwal</DialogTitle>
            <DialogDescription>Riwayat survey untuk konsumen ini.</DialogDescription>
          </div>

          <AddEventDialog defaultKonsumenId={event.konsumen?.id}>
            <Button
              type='button'
              aria-label='Tambah Jadwal Baru'
              variant='outline'
              className='mr-5 ml-auto border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white lg:mr-10'>
              + Jadwal Baru
            </Button>
          </AddEventDialog>
        </DialogHeader>

        <div className='max-h-[calc(90vh-10rem)] space-y-4 overflow-y-auto'>
          {followups.length === 0 && <p className='text-muted-foreground text-sm'>Belum ada log survey.</p>}

          {followups.map((fu) => {
            const start = new Date(fu.followup_date);
            const end = fu.followup_last_day ? new Date(fu.followup_last_day) : undefined;

            const initials = fu.sales?.name
              ?.split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const thisEvent = {
              ...fu,
              description: fu.followup_result,
              title: fu.followup_note,
              startDate: fu.followup_date,
              endDate: fu.followup_last_day,
              konsumen: { id: fu.konsumen_id },
              prospek: { id: fu.prospek_id },
              sales: { id: fu.sales_id }
            };

            return (
              <Card key={fu.id} className='rounded-2xl border-gray-200'>
                <CardHeader className='flex flex-row items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full',
                        getStatusColor(fu.prospek.color)
                      )}>
                      <Calendar className='size-5 text-gray-800' />
                    </span>
                    <div>
                      {Boolean(fu.status) && <Badge className='bg-green-600 text-white'>Selesai</Badge>}
                      <CardTitle className='text-base'>{event.konsumen?.name}</CardTitle>
                    </div>
                  </div>

                  <div className='flex items-center gap-1'>
                    {/* <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Tandai Tidak Hadir'
                      className='cursor-pointer hover:bg-red-500/10'>
                      <X className='size-4 text-red-500' />
                    </Button> */}
                    {!fu.status && (
                      <Button
                        variant='outline'
                        aria-label='Tandai Hadir'
                        className='cursor-pointer border border-green-600 text-green-600 hover:bg-green-600/10'
                        onClick={() => updateCalendarStatus(fu.id)}
                        disabled={isUpdatingCalendarStatus}>
                        <Check className='size-4 text-green-600' />
                        Tandai Selesai
                      </Button>
                    )}

                    <EditEventDialog event={thisEvent as unknown as IEvent} simpleEdit>
                      <Button variant='ghost' size='icon' aria-label='Edit'>
                        <Pencil className='size-4' />
                      </Button>
                    </EditEventDialog>

                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Delete'
                      onClick={() => deleteCalendar(fu.id)}
                      disabled={isDeletingCalendar}>
                      <Trash className='size-4' />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='mb-5 grid gap-4 lg:grid-cols-2'>
                    <div>
                      <div className='text-sm font-medium'>Catatan:</div>
                      <CardDescription>{fu.followup_note}</CardDescription>
                    </div>
                    <div>
                      <div className='text-sm font-medium'>Hasil:</div>
                      <CardDescription>{fu.followup_result}</CardDescription>
                    </div>
                  </div>

                  <div className='border-t border-gray-200'></div>

                  <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div className='flex flex-1 flex-wrap items-center gap-x-10 gap-y-3'>
                      <div className='flex items-center gap-2'>
                        <Clock className='mt-0.5 size-4 shrink-0 text-gray-800' />
                        <div>
                          <p className='text-sm font-medium'>Jadwal</p>
                          <p className='text-muted-foreground text-sm'>
                            {format(start, 'MMM d, yyyy h:mm a')}
                            {end ? ` - ${format(end, 'MMM d, yyyy h:mm a')}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <User className='mt-0.5 size-4 shrink-0 text-gray-800' />
                        <div>
                          <p className='text-sm font-medium'>Sales</p>
                          <p className='text-muted-foreground text-sm'>{fu.sales?.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
});

LogsEventDialog.displayName = 'LogsEventDialog';
