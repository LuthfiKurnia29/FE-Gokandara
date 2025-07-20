'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useKonsumenList } from '@/services/konsumen';
import { usePenjualanById } from '@/services/penjualan';
import { usePropertyList } from '@/services/property';
import { CreatePenjualanData, PenjualanStatus } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod validation schema
const penjualanSchema = z.object({
  konsumenId: z.number().min(1, 'Konsumen wajib dipilih'),
  propertiId: z.number().min(1, 'Properti wajib dipilih'),
  diskon: z.number().min(0, 'Diskon tidak boleh negatif'),
  grandTotal: z.number().min(1, 'Grand Total wajib diisi'),
  status: z.enum(['Negotiation', 'Pending', 'Approved'])
});

type PenjualanFormData = z.infer<typeof penjualanSchema>;

interface PenjualanFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreatePenjualanData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PenjualanForm = memo(function PenjualanForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: PenjualanFormProps) {
  const { data: penjualan, isFetching } = usePenjualanById(selectedId || null, ['konsumen', 'property']);
  const { data: konsumenData } = useKonsumenList({ per_page: 100 });
  const { data: propertyData } = usePropertyList({ perPage: 100 });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PenjualanFormData>({
    resolver: zodResolver(penjualanSchema),
    defaultValues: {
      konsumenId: 0,
      propertiId: 0,
      diskon: 0,
      grandTotal: 0,
      status: 'Negotiation'
    }
  });

  const watchedPropertyId = watch('propertiId');
  const watchedDiskon = watch('diskon');

  // Calculate grand total when property or discount changes
  useEffect(() => {
    if (watchedPropertyId && propertyData?.data) {
      const selectedProperty = propertyData.data.find((p) => p.id === watchedPropertyId);
      if (selectedProperty) {
        const finalPrice = selectedProperty.price - (watchedDiskon || 0);
        setValue('grandTotal', Math.max(0, finalPrice));
      }
    }
  }, [watchedPropertyId, watchedDiskon, propertyData, setValue]);

  // Reset form when penjualan data changes
  useEffect(() => {
    if (penjualan) {
      reset({
        konsumenId: penjualan.konsumenId,
        propertiId: penjualan.propertiId,
        diskon: penjualan.diskon,
        grandTotal: penjualan.grandTotal,
        status: penjualan.status
      });
    } else {
      reset({
        konsumenId: 0,
        propertiId: 0,
        diskon: 0,
        grandTotal: 0,
        status: 'Negotiation'
      });
    }
  }, [penjualan, reset]);

  const handleFormSubmit = (data: PenjualanFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset({
      konsumenId: 0,
      propertiId: 0,
      diskon: 0,
      grandTotal: 0,
      status: 'Negotiation'
    });
    onCancel();
  };

  // Show skeleton while fetching penjualan data for edit mode
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
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
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
        <Label htmlFor='konsumenId'>Konsumen *</Label>
        <Controller
          name='konsumenId'
          control={control}
          render={({ field }) => (
            <Select
              options={
                konsumenData?.data?.map((konsumen) => ({
                  value: konsumen.id.toString(),
                  label: konsumen.name
                })) || []
              }
              value={field.value.toString()}
              onChange={(value) => field.onChange(Number(value))}
              placeholder='Pilih konsumen'
              disabled={isLoading}
            />
          )}
        />
        {errors.konsumenId && <p className='text-sm text-red-600'>{errors.konsumenId.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='propertiId'>Properti *</Label>
        <Controller
          name='propertiId'
          control={control}
          render={({ field }) => (
            <Select
              options={
                propertyData?.data?.map((property) => ({
                  value: property.id.toString(),
                  label: `${property.name} - ${property.code} (Rp ${property.price.toLocaleString('id-ID')})`
                })) || []
              }
              value={field.value.toString()}
              onChange={(value) => field.onChange(Number(value))}
              placeholder='Pilih properti'
              disabled={isLoading}
            />
          )}
        />
        {errors.propertiId && <p className='text-sm text-red-600'>{errors.propertiId.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='diskon'>Diskon</Label>
        <Input
          id='diskon'
          type='number'
          {...register('diskon', { valueAsNumber: true })}
          placeholder='Masukkan diskon'
          disabled={isLoading}
        />
        {errors.diskon && <p className='text-sm text-red-600'>{errors.diskon.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='grandTotal'>Grand Total *</Label>
        <Input
          id='grandTotal'
          type='number'
          {...register('grandTotal', { valueAsNumber: true })}
          placeholder='Grand total akan dihitung otomatis'
          disabled={isLoading}
        />
        {errors.grandTotal && <p className='text-sm text-red-600'>{errors.grandTotal.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='status'>Status *</Label>
        <Controller
          name='status'
          control={control}
          render={({ field }) => (
            <Select
              options={[
                { value: 'Negotiation', label: 'Negotiation' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' }
              ]}
              value={field.value}
              onChange={field.onChange}
              placeholder='Pilih status'
              disabled={isLoading}
            />
          )}
        />
        {errors.status && <p className='text-sm text-red-600'>{errors.status.message}</p>}
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
