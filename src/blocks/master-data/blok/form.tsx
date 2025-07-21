'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBlok } from '@/services/blok';
import { BlokData, CreateBlokData } from '@/types/blok';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const blokSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type BlokFormData = z.infer<typeof blokSchema>;

interface BlokFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateBlokData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BlokForm = memo(function BlokForm({ selectedId, onSubmit, onCancel, isLoading = false }: BlokFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BlokFormData>({
    resolver: zodResolver(blokSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (selectedId) {
        try {
          const blok = await getBlok(selectedId);
          reset({ name: blok.name });
        } catch (error) {
          console.error('Error fetching blok:', error);
        }
      } else {
        reset({ name: '' });
      }
    };

    fetchData();
  }, [selectedId, reset]);

  const handleFormSubmit = (data: BlokFormData) => {
    onSubmit({ name: data.name });
  };

  const handleCancel = () => {
    reset({ name: '' });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama Blok *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama blok' disabled={isLoading} />
        {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
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
