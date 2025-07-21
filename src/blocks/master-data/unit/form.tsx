'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUnit } from '@/services/unit';
import { CreateUnitData, UnitData } from '@/types/unit';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const unitSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter')
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateUnitData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UnitForm = memo(function UnitForm({ selectedId, onSubmit, onCancel, isLoading = false }: UnitFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (selectedId) {
        try {
          const unit = await getUnit(selectedId);
          reset({ name: unit.name });
        } catch (error) {
          console.error('Error fetching unit:', error);
        }
      } else {
        reset({ name: '' });
      }
    };

    fetchData();
  }, [selectedId, reset]);

  const handleFormSubmit = (data: UnitFormData) => {
    onSubmit({ name: data.name });
  };

  const handleCancel = () => {
    reset({ name: '' });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama Unit *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama unit' disabled={isLoading} />
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
