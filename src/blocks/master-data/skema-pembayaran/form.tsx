'use client';

import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateSkemaPembayaranData, UpdateSkemaPembayaranData } from '@/types/skema-pembayaran';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod validation schema
const skemaPembayaranSchema = z.object({
  nama: z.string().min(1, 'Nama skema pembayaran wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type SkemaPembayaranFormData = z.infer<typeof skemaPembayaranSchema>;

interface SkemaPembayaranFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateSkemaPembayaranData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: {
    nama: string;
  };
}

export const SkemaPembayaranForm = memo(function SkemaPembayaranForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues
}: SkemaPembayaranFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SkemaPembayaranFormData>({
    resolver: zodResolver(skemaPembayaranSchema),
    defaultValues: {
      nama: defaultValues?.nama || ''
    }
  });

  const handleFormSubmit = (data: SkemaPembayaranFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset({
      nama: ''
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='nama'>Nama Skema Pembayaran *</Label>
        <Input
          id='nama'
          type='text'
          {...register('nama')}
          placeholder='Masukkan nama skema pembayaran'
          disabled={isLoading}
        />
        {errors.nama && <p className='text-sm text-red-600'>{errors.nama.message}</p>}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : selectedId ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});
