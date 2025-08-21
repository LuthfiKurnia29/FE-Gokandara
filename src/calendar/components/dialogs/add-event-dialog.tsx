'use client';

import { useEffect } from 'react';

import { useCalendar } from '@/calendar/contexts/calendar-context';
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
import { SingleDayPicker } from '@/components/ui/single-day-picker';
import { Textarea } from '@/components/ui/textarea';
import { TimeInput } from '@/components/ui/time-input';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useCreateCalendar } from '@/services/calendar';
import { useAllKonsumen, useProspekList } from '@/services/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import moment from 'moment';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  defaultKonsumenId?: number;
}

const createCalendarSchema = z.object({
  konsumen_id: z.coerce.number({ required_error: 'Konsumen is required' }),
  prospek_id: z.coerce.number({ required_error: 'Prospek is required' }),
  followup_result: z.string().min(1, 'Result is required'),
  followup_note: z.string().min(1, 'Note is required'),
  followup_date: z.string().min(1, 'Follow Up Awal is required'),
  followup_last_day: z.string().min(1, 'Follow Up Terakhir is required')
});

type TCreateCalendarFormData = z.infer<typeof createCalendarSchema>;

export function AddEventDialog({ children, startDate, startTime, defaultKonsumenId }: IProps) {
  const { setLocalEvents } = useCalendar();

  const { isOpen, onClose, onToggle } = useDisclosure();

  const form = useForm<TCreateCalendarFormData>({
    resolver: zodResolver(createCalendarSchema),
    defaultValues: {
      konsumen_id: defaultKonsumenId,
      prospek_id: undefined as unknown as number,
      followup_result: '',
      followup_note: '',
      followup_date: '',
      followup_last_day: ''
    }
  });

  const { mutateAsync: createCalendar } = useCreateCalendar();

  const onSubmit = async (values: TCreateCalendarFormData) => {
    const start = new Date(values.followup_date);
    const end = new Date(values.followup_last_day);

    const created = await createCalendar({
      followup_date: moment(start).format('YYYY-MM-DD HH:mm:ss'),
      followup_last_day: moment(end).format('YYYY-MM-DD HH:mm:ss'),
      followup_note: values.followup_note,
      followup_result: values.followup_result,
      konsumen_id: values.konsumen_id,
      prospek_id: values.prospek_id
    });

    // Optimistically add to local calendar view (must satisfy IEvent)
    // setLocalEvents((prev) => [
    //   {
    //     id: created.id,
    //     startDate: new Date(created.followup_date).toISOString(),
    //     endDate: new Date(created.followup_last_day || created.followup_date).toISOString(),
    //     title: created.followup_note,
    //     color: 'blue',
    //     description: created.followup_result,
    //     konsumen: { id: created.konsumen_id, name: '', followups: [] },
    //     prospek: { id: created.prospek_id, name: '', color: 'blue' },
    //     sales: { id: 'me', name: 'Me', picturePath: null },
    //     updated_at: new Date().toISOString()
    //   },
    //   ...prev
    // ]);

    onClose();
    form.reset();
  };

  useEffect(() => {
    form.reset({
      followup_date: '',
      followup_last_day: ''
    });
  }, [form.reset]);

  useEffect(() => {
    if (defaultKonsumenId) {
      form.setValue('konsumen_id', defaultKonsumenId);
    }
  }, [defaultKonsumenId]);

  const { data: konsumen } = useAllKonsumen();
  const { data: prospek } = useProspekList();

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Jadwal Baru</DialogTitle>
          <DialogDescription>
            Tambahkan acara baru ke kalender agar kamu tidak melewatkan hal penting.
          </DialogDescription>
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
                  <FormLabel htmlFor='startDate'>Follow Up Awal</FormLabel>

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
                  <FormLabel htmlFor='startDate'>Follow Up Terakhir</FormLabel>

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
                    <Textarea id='followup_result' data-invalid={fieldState.invalid} {...field} />
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
            Simpan Jadwal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
