'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useKonsumenById } from '@/services/konsumen';
import { KonsumenData } from '@/types/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod validation schema
const konsumenSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  description: z.string().optional(),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  address: z.string().min(1, 'Alamat wajib diisi')
});

type KonsumenFormData = z.infer<typeof konsumenSchema>;

interface KonsumenFormProps {
  selectedId?: number | null;
  onSubmit: (data: Omit<KonsumenData, 'id' | 'no'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const KonsumenForm = memo(function KonsumenForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: KonsumenFormProps) {
  const { data: konsumen, isFetching } = useKonsumenById(selectedId || null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<KonsumenFormData>({
    resolver: zodResolver(konsumenSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      address: ''
    }
  });

  // Reset form when konsumen data changes
  useEffect(() => {
    if (konsumen) {
      reset({
        name: konsumen.name,
        description: konsumen.description || '',
        phone: konsumen.phone,
        email: konsumen.email,
        address: konsumen.address
      });
    } else {
      reset({
        name: '',
        description: '',
        phone: '',
        email: '',
        address: ''
      });
    }
  }, [konsumen, reset]);

  const handleFormSubmit = (data: KonsumenFormData) => {
    // Convert optional description to required string for the API
    const submissionData = {
      ...data,
      description: data.description || ''
    };
    onSubmit(submissionData);
  };

  const handleCancel = () => {
    reset({
      name: '',
      description: '',
      phone: '',
      email: '',
      address: ''
    });
    onCancel();
  };

  // Show skeleton while fetching konsumen data for edit mode
  if (selectedId && isFetching) {
    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-10 w-full' />
        </div>
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
        <Label htmlFor='name'>Nama *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama konsumen' disabled={isLoading} />
        {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Deskripsi</Label>
        <Input
          id='description'
          type='text'
          {...register('description')}
          placeholder='Masukkan deskripsi (opsional)'
          disabled={isLoading}
        />
        {errors.description && <p className='text-sm text-red-600'>{errors.description.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone'>Nomor Telepon *</Label>
        <Input id='phone' type='tel' {...register('phone')} placeholder='Masukkan nomor telepon' disabled={isLoading} />
        {errors.phone && <p className='text-sm text-red-600'>{errors.phone.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email *</Label>
        <Input
          id='email'
          type='email'
          {...register('email')}
          placeholder='Masukkan alamat email'
          disabled={isLoading}
        />
        {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='address'>Alamat *</Label>
        <Input
          id='address'
          type='text'
          {...register('address')}
          placeholder='Masukkan alamat lengkap'
          disabled={isLoading}
        />
        {errors.address && <p className='text-sm text-red-600'>{errors.address.message}</p>}
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
