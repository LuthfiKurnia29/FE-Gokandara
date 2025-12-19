'use client';

import { useCalendar } from '@/calendar/contexts/calendar-context';
import type { IEvent } from '@/calendar/interfaces';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitive-select';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useDeleteCalendar, useUpdateCalendar, useUpdateCalendarStatus } from '@/services/calendar';
import { useAllKonsumen, useProspekList } from '@/services/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import { LogsEventDialog } from './logs-event-dialog';
import { parseISO } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

interface IProps {
  children: React.ReactNode;
  event: IEvent;
  simpleEdit?: boolean;
}

export function EditEventDialog({ children, event, simpleEdit = false }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const { users, setLocalEvents } = useCalendar();

  const editCalendarSchema = z.object({
    konsumen_id: z.coerce.number({ required_error: 'Konsumen is required' }).optional(),
    prospek_id: z.coerce.number({ required_error: 'Prospek is required' }).optional(),
    followup_result: z.string().min(1, 'Result is required'),
    followup_note: z.string().min(1, 'Note is required'),
    followup_date: z.string().min(1, 'Follow Up Awal is required'),
    followup_last_day: z.string().min(1, 'Follow Up Terakhir is required')
  });

  type TEditCalendarFormData = z.infer<typeof editCalendarSchema>;

  const form = useForm<TEditCalendarFormData>({
    resolver: zodResolver(editCalendarSchema),
    defaultValues: {
      followup_result: event.description,
      followup_note: event.title,
      followup_date: event.startDate,
      followup_last_day: event.endDate,
      konsumen_id: event.konsumen?.id as number,
      prospek_id: event.prospek?.id as number
    }
  });

  const { mutateAsync: updateCalendar } = useUpdateCalendar();
  const { data: konsumen } = useAllKonsumen();
  const { data: prospek } = useProspekList();

  const onSubmit = async (values: TEditCalendarFormData) => {
    const start = new Date(values.followup_date);
    const end = new Date(values.followup_last_day);

    await updateCalendar({
      id: event.id,
      data: {
        followup_date: moment(start).format('YYYY-MM-DD HH:mm:ss'),
        followup_last_day: moment(end).format('YYYY-MM-DD HH:mm:ss'),
        followup_note: values.followup_note,
        followup_result: values.followup_result,
        konsumen_id: values.konsumen_id ?? 0,
        prospek_id: values.prospek_id ?? 0
      }
    });

    // Update local calendar item
    setLocalEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === event.id);
      if (idx === -1) return prev;
      const updated = {
        ...prev[idx],
        title: values.followup_note,
        description: values.followup_result,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      };
      return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
    });

    onClose();
  };

  const { mutate: updateCalendarStatus, isLoading: isUpdatingCalendarStatus } = useUpdateCalendarStatus(() => {
    toast.success('Jadwal berhasil ditandai selesai');
    onClose();
  });

  const { mutate: deleteCalendar, isLoading: isDeletingCalendar } = useDeleteCalendar(() => {
    toast.success('Jadwal berhasil dihapus');
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Jadwal</DialogTitle>
          <DialogDescription>Sesuaikan jadwal yang sudah ada agar tetap akurat dan up to date.</DialogDescription>
        </DialogHeader>

        {!event.status && !simpleEdit && (
          <Button
            type='button'
            className='ml-auto w-full bg-green-600 text-white hover:bg-green-700'
            onClick={() => updateCalendarStatus(event.id)}
            disabled={isUpdatingCalendarStatus}>
            <CheckCheck />
            Tandai Selesai
          </Button>
        )}

        <Form {...form}>
          <form
            id='event-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid max-h-[400px] gap-4 overflow-y-auto py-4'>
            {/* Display Sales Name */}
            {event.sales && (
              <div className='flex items-center gap-2 rounded-lg border bg-muted/50 p-3'>
                <Avatar className='size-8'>
                  <AvatarImage src={event.sales.image_url || undefined} alt={event.sales.name} />
                  <AvatarFallback className='text-xs'>{event.sales.name?.[0] || 'S'}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='text-xs text-muted-foreground'>Dibuat oleh</span>
                  <span className='text-sm font-medium'>{event.sales.name}</span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name='konsumen_id'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Konsumen</FormLabel>
                  <FormControl>
                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger data-invalid={fieldState.invalid} className='w-full'>
                        <SelectValue placeholder='Pilih konsumen' />
                      </SelectTrigger>
                      <SelectContent>
                        {konsumen?.map((k: any) => (
                          <SelectItem key={k.id} value={String(k.id)} className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <Avatar className='size-6'>
                                <AvatarImage src={undefined} alt={k.name} />
                                <AvatarFallback className='text-xxs'>{k.name?.[0] || 'K'}</AvatarFallback>
                              </Avatar>
                              <p className='truncate'>{k.name}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='prospek_id'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Prospek</FormLabel>
                  <FormControl>
                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger data-invalid={fieldState.invalid} className='w-full'>
                        <SelectValue placeholder='Pilih prospek' />
                      </SelectTrigger>
                      <SelectContent>
                        {prospek?.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)} className='flex-1'>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='followup_date'
              render={({ field, fieldState }) => (
                <FormItem className='flex-1'>
                  <FormLabel htmlFor='followup_date'>Follow Up Awal</FormLabel>

                  <FormControl>
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: Date | undefined) => field.onChange(date ? date.toISOString() : '')}
                      format='dd/MM/yyyy HH:mm'
                      className='h-12'
                      withInput={false}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='followup_last_day'
              render={({ field, fieldState }) => (
                <FormItem className='flex-1'>
                  <FormLabel htmlFor='followup_last_day'>Follow Up Terakhir</FormLabel>

                  <FormControl>
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: Date | undefined) => field.onChange(date ? date.toISOString() : '')}
                      format='dd/MM/yyyy HH:mm'
                      className='h-12'
                      withInput={false}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='followup_note'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>

                  <FormControl>
                    <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='followup_result'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor='followup_result'>Hasil Follow Up</FormLabel>

                  <FormControl>
                    <Textarea
                      id='followup_result'
                      placeholder='Masukkan hasil follow up'
                      data-invalid={fieldState.invalid}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          {!simpleEdit && (
            <LogsEventDialog event={event} onClose={onClose}>
              <Button type='button' variant='outline' className='mr-auto'>
                Log Survey
              </Button>
            </LogsEventDialog>
          )}

          {!simpleEdit && (
            <Button
              type='button'
              variant='outline'
              className='border-destructive text-destructive hover:bg-destructive/20'
              onClick={() => deleteCalendar(event.id)}
              disabled={isDeletingCalendar}>
              Hapus
            </Button>
          )}

          <Button form='event-form' type='submit'>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
