'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { currency, uncurrency } from '@/lib/utils';
import { RiwayatPembayaranData } from '@/types/riwayat-pembayaran';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  nominal: z
    .string()
    .min(1, 'Nominal wajib diisi')
    .refine((value) => {
      const num = uncurrency(String(value ?? ''));
      return !isNaN(num) && num > 0;
    }, 'Nominal harus berupa angka positif'),
  keterangan: z.string().optional()
});

export type PaymentHistoryFormData = z.infer<typeof schema>;

interface PaymentHistoryFormProps {
  selectedData?: RiwayatPembayaranData | null;
  onSubmit: (data: PaymentHistoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PaymentHistoryForm = memo(function PaymentHistoryForm({
  selectedData,
  onSubmit,
  onCancel,
  isLoading = false
}: PaymentHistoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PaymentHistoryFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { tanggal: '', nominal: '', keterangan: '' }
  });

  useEffect(() => {
    if (selectedData) {
      reset({
        tanggal: selectedData.tanggal ?? '',
        nominal: selectedData.nominal != null ? currency(selectedData.nominal) : '',
        keterangan: selectedData.keterangan ?? ''
      });
    } else {
      reset({ tanggal: '', nominal: '', keterangan: '' });
    }
  }, [selectedData, reset]);

  const tanggalValue = watch('tanggal');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='tanggal'>Tanggal</Label>
        <DatePicker
          value={tanggalValue ? new Date(tanggalValue) : undefined}
          onChange={(date: Date | undefined) => setValue('tanggal', date ? date.toISOString().slice(0, 10) : '')}
          placeholder='Pilih tanggal'
          format='dd/MM/yyyy'
          className='h-12'
          withInput={false}
        />
        {errors.tanggal && <p className='text-sm text-red-600'>{errors.tanggal.message}</p>}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='nominal'>Nominal</Label>
        <Input id='nominal' type='currency' {...register('nominal')} disabled={isLoading} />
        {errors.nominal && <p className='text-sm text-red-600'>{errors.nominal.message as any}</p>}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='keterangan'>Keterangan</Label>
        <Input id='keterangan' type='text' placeholder='Opsional' {...register('keterangan')} disabled={isLoading} />
        {errors.keterangan && <p className='text-sm text-red-600'>{errors.keterangan.message}</p>}
      </div>
      <div className='flex justify-end gap-2 pt-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' className='text-white' disabled={isLoading}>
          {selectedData ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});

export default PaymentHistoryForm;
