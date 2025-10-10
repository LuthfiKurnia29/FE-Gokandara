'use client';

import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateSkemaPembayaranData, UpdateSkemaPembayaranData, SkemaPembayaranDetail } from '@/types/skema-pembayaran';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Trash2, Plus } from 'lucide-react';

// Zod validation schema
const skemaPembayaranSchema = z.object({
  nama: z.string().min(1, 'Nama skema pembayaran wajib diisi').min(2, 'Nama minimal 2 karakter'),
  details: z.array(
    z.object({
      nama: z.string().min(1, 'Nama detail wajib diisi'),
      persentase: z.number().min(1, 'Persentase minimal 1').max(100, 'Persentase maksimal 100')
    })
  ).min(1, 'Minimal harus ada 1 detail')
});

type SkemaPembayaranFormData = z.infer<typeof skemaPembayaranSchema>;

interface SkemaPembayaranFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateSkemaPembayaranData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: {
    nama: string;
    details: SkemaPembayaranDetail[];
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
    control,
    formState: { errors }
  } = useForm<SkemaPembayaranFormData>({
    resolver: zodResolver(skemaPembayaranSchema),
    defaultValues: {
      nama: defaultValues?.nama || '',
      details: defaultValues?.details || [{ nama: '', persentase: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details'
  });

  const handleFormSubmit = (data: SkemaPembayaranFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset({
      nama: '',
      details: [{ nama: '', persentase: 0 }]
    });
    onCancel();
  };

  const handleAddDetail = () => {
    append({ nama: '', persentase: 0 });
  };

  const handleRemoveDetail = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
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

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Detail Pembayaran *</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleAddDetail}
            disabled={isLoading}
            className='flex items-center gap-1'
          >
            <Plus className='h-4 w-4' />
            Tambah Detail
          </Button>
        </div>

        <div className='space-y-3'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex items-start gap-2 p-3 border rounded-lg'>
              <div className='flex-1 space-y-3 grid grid-cols-2 gap-2'>
                <div className='space-y-2'>
                  <Label htmlFor={`details.${index}.nama`}>Nama Detail *</Label>
                  <Input
                    id={`details.${index}.nama`}
                    type='text'
                    {...register(`details.${index}.nama`)}
                    placeholder='Masukkan nama detail'
                    disabled={isLoading}
                  />
                  {errors.details?.[index]?.nama && (
                    <p className='text-sm text-red-600'>{errors.details[index]?.nama?.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`details.${index}.persentase`}>Persentase (%) *</Label>
                  <Input
                    id={`details.${index}.persentase`}
                    type='number'
                    min='1'
                    max='100'
                    {...register(`details.${index}.persentase`, { valueAsNumber: true })}
                    placeholder='Masukkan persentase (1-100)'
                    disabled={isLoading}
                  />
                  {errors.details?.[index]?.persentase && (
                    <p className='text-sm text-red-600'>{errors.details[index]?.persentase?.message}</p>
                  )}
                </div>
              </div>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => handleRemoveDetail(index)}
                disabled={isLoading || fields.length === 1}
                className='mt-8'
              >
                <Trash2 className='h-4 w-4 text-red-600' />
              </Button>
            </div>
          ))}
        </div>

        {errors.details && typeof errors.details.message === 'string' && (
          <p className='text-sm text-red-600'>{errors.details.message}</p>
        )}
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
