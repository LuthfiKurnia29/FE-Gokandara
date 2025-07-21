'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateProjekData, ProjekData } from '@/types/projek';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const projekSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type ProjekFormData = z.infer<typeof projekSchema>;

interface ProjekFormProps {
  selectedData?: ProjekData | null;
  onSubmit: (data: CreateProjekData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProjekForm = memo(function ProjekForm({
  selectedData,
  onSubmit,
  onCancel,
  isLoading = false
}: ProjekFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProjekFormData>({
    resolver: zodResolver(projekSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    if (selectedData) {
      reset({ name: selectedData.name });
    } else {
      reset({ name: '' });
    }
  }, [selectedData, reset]);

  const handleFormSubmit = (data: ProjekFormData) => {
    onSubmit({ name: data.name });
  };

  const handleCancel = () => {
    reset({ name: '' });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama Projek *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama projek' disabled={isLoading} />
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
