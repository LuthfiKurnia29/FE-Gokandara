'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateProspekData, ProspekData } from '@/types/prospek';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const prospekSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type ProspekFormData = z.infer<typeof prospekSchema>;

interface ProspekFormProps {
  selectedData?: ProspekData | null;
  onSubmit: (data: CreateProspekData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProspekForm = memo(function ProspekForm({
  selectedData,
  onSubmit,
  onCancel,
  isLoading = false
}: ProspekFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProspekFormData>({
    resolver: zodResolver(prospekSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    if (selectedData) {
      reset({ name: selectedData.name });
    } else {
      reset({ name: '' });
    }
  }, [selectedData, reset]);

  const handleFormSubmit = (data: ProspekFormData) => {
    onSubmit({ name: data.name });
  };

  const handleCancel = () => {
    reset({ name: '' });
    onCancel();
  };

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
          {isLoading ? 'Menyimpan...' : selectedData ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});
