'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTipe } from '@/services/tipe';
import { CreateTipeData, TipeData } from '@/types/tipe';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const tipeSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type TipeFormData = z.infer<typeof tipeSchema>;

interface TipeFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateTipeData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TipeForm = memo(function TipeForm({ selectedId, onSubmit, onCancel, isLoading = false }: TipeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TipeFormData>({
    resolver: zodResolver(tipeSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (selectedId) {
        try {
          const tipe = await getTipe(selectedId);
          reset({ name: tipe.name });
        } catch (error) {
          console.error('Error fetching tipe:', error);
        }
      } else {
        reset({ name: '' });
      }
    };

    fetchData();
  }, [selectedId, reset]);

  const handleFormSubmit = (data: TipeFormData) => {
    onSubmit({ name: data.name });
  };

  const handleCancel = () => {
    reset({ name: '' });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama Tipe *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama tipe' disabled={isLoading} />
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
