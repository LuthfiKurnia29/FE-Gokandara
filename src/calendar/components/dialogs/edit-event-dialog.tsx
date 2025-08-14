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
import { useUpdateCalendar } from '@/services/calendar';
import { useAllKonsumen, useProspekList } from '@/services/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import { parseISO } from 'date-fns';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface IProps {
  children: React.ReactNode;
  event: IEvent;
}

export function EditEventDialog({ children, event }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const { users, setLocalEvents } = useCalendar();

  const editCalendarSchema = z.object({
    konsumen_id: z.coerce.number({ required_error: 'Konsumen is required' }).optional(),
    prospek_id: z.coerce.number({ required_error: 'Prospek is required' }).optional(),
    followup_result: z.string().min(1, 'Result is required'),
    followup_note: z.string().min(1, 'Note is required'),
    followup_date: z.date({ required_error: 'Follow up date is required' }),
    followup_last_day: z.date({ required_error: 'Follow up last day is required' })
  });

  type TEditCalendarFormData = z.infer<typeof editCalendarSchema>;

  const form = useForm<TEditCalendarFormData>({
    resolver: zodResolver(editCalendarSchema),
    defaultValues: {
      followup_result: event.description,
      followup_note: event.title,
      followup_date: parseISO(event.startDate),
      followup_last_day: parseISO(event.endDate),
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

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Jadwal</DialogTitle>
          <DialogDescription>Sesuaikan jadwal yang sudah ada agar tetap akurat dan up to date.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id='event-form' onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4 py-4'>
            <FormField
              control={form.control}
              name='konsumen_id'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Konsumen</FormLabel>
                  <FormControl>
                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
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
                      <SelectTrigger data-invalid={fieldState.invalid}>
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
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Batal
            </Button>
          </DialogClose>

          <Button form='event-form' type='submit'>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
