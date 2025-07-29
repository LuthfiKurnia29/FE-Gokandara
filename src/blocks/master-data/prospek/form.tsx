'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useProspekById } from '@/services/prospek';
import { CreateProspekData, ProspekData } from '@/types/prospek';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const prospekSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type ProspekFormData = z.infer<typeof prospekSchema>;

interface ProspekFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateProspekData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProspekForm = memo(function ProspekForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: ProspekFormProps) {
  // Get existing data for edit mode using React Query hook
  const { data: existingData, isFetching } = useProspekById(selectedId || null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProspekFormData>({
    resolver: zodResolver(prospekSchema),
    defaultValues: { name: '' }
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (existingData && selectedId) {
      reset({ name: existingData.name });
    } else if (!selectedId) {
      reset({ name: '' });
    }
  }, [existingData, reset, selectedId]);

  const handleFormSubmit = (data: ProspekFormData) => {
    onSubmit({ name: data.name });
  };

  const handleCancel = () => {
    reset({ name: '' });
    onCancel();
  };

  // Show skeleton while fetching prospek data for edit mode
  if (selectedId && isFetching) {
    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='flex justify-end space-x-2 pt-4'>
          <Skeleton className='h-10 w-16' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama Prospek *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama prospek' disabled={isLoading} />
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
