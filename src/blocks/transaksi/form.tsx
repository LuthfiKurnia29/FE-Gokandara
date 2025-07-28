'use client';

import { memo, useEffect, useState } from 'react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useKonsumenList } from '@/services/konsumen';
import { usePenjualanById } from '@/services/penjualan';
import { usePropertyList } from '@/services/property';
import { CreatePenjualanData, PenjualanStatus } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { Check, Home, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod validation schema
const penjualanSchema = z.object({
  konsumenId: z.number().min(1, 'Konsumen wajib dipilih'),
  propertiId: z.number().min(1, 'Properti wajib dipilih'),
  diskon: z.number().min(0, 'Diskon tidak boleh negatif'),
  grandTotal: z.number().min(1, 'Grand Total wajib diisi'),
  status: z.enum(['Negotiation', 'Pending', 'Approved']),
  tanggal: z.string().optional(),
  sales: z.string().optional()
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
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);

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
      status: 'Negotiation',
      tanggal: '',
      sales: ''
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
        status: penjualan.status,
        tanggal: '',
        sales: ''
      });
    } else {
      reset({
        konsumenId: 0,
        propertiId: 0,
        diskon: 0,
        grandTotal: 0,
        status: 'Negotiation',
        tanggal: '',
        sales: ''
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
      status: 'Negotiation',
      tanggal: '',
      sales: ''
    });
    onCancel();
  };

  // Location options
  const locationOptions = [
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'surabaya', label: 'Surabaya' }
  ];

  // Sales options
  const salesOptions = [
    { value: 'sales-1', label: 'Sales 1' },
    { value: 'sales-2', label: 'Sales 2' },
    { value: 'sales-3', label: 'Sales 3' }
  ];

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
    <div className='flex h-full w-full flex-col'>
      <form onSubmit={handleSubmit(handleFormSubmit)} className='flex h-full w-full flex-col'>
        <Card className='flex h-full w-full flex-col border-0 shadow-none'>
          {/* Fixed Header */}
          <CardHeader className='flex-shrink-0 px-6 pt-6 pb-0'>
            <div className='mb-6 flex items-center justify-between'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {selectedId ? 'Edit Data Transaksi' : 'Tambah Data Transaksi'}
              </h1>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onCancel}
                className='h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50'>
                <X className='h-4 w-4 text-gray-400' />
              </Button>
            </div>
          </CardHeader>

          {/* Scrollable Content Area */}
          <CardContent
            className='flex-1 px-6 pt-4'
            style={{ overflow: 'auto', minHeight: 0, maxHeight: 'calc(100% - 140px)' }}>
            <div className='space-y-8 pb-4'>
              {/* Form Inputs - Yellow highlighted area */}
              <div className='rounded-lg border-2 border-orange-400 bg-white p-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='properti'>Properti</Label>
                    <Controller
                      name='propertiId'
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={
                            propertyData?.data?.map((property) => ({
                              value: property.id.toString(),
                              label: `${property.name} - ${property.code}`
                            })) || []
                          }
                          value={field.value.toString()}
                          onChange={(value) => field.onChange(Number(value))}
                          placeholder='Pilih Properti'
                          inputPlaceholder='Cari properti...'
                          emptyPlaceholder='Tidak ada properti ditemukan'
                          disabled={isLoading}
                        />
                      )}
                    />
                    {errors.propertiId && <p className='text-sm text-red-500'>{errors.propertiId.message}</p>}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='lokasi'>Lokasi</Label>
                    <Select
                      options={locationOptions}
                      placeholder='Pilih Lokasi'
                      inputPlaceholder='Cari lokasi...'
                      emptyPlaceholder='Tidak ada lokasi ditemukan'
                      disabled={isLoading}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='konsumen'>Konsumen</Label>
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
                          placeholder='Pilih Konsumen'
                          disabled={isLoading}
                        />
                      )}
                    />
                    {errors.konsumenId && <p className='text-sm text-red-500'>{errors.konsumenId.message}</p>}
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='tanggal'>Tanggal</Label>
                    <DatePicker
                      value={watch('tanggal') && watch('tanggal') !== '' ? new Date(watch('tanggal')!) : undefined}
                      onChange={(date) => setValue('tanggal', date ? date.toISOString().split('T')[0] : '')}
                      placeholder='Pilih tanggal transaksi...'
                      format='dd/MM/yyyy'
                      className='h-12'
                      withInput={false}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='sales'>Sales</Label>
                    <Controller
                      name='sales'
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={salesOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='Pilih Sales'
                          inputPlaceholder='Cari sales...'
                          emptyPlaceholder='Tidak ada sales ditemukan'
                          disabled={isLoading}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Status Selection */}
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
                {errors.status && <p className='text-sm text-red-500'>{errors.status.message}</p>}
              </div>

              {/* Pricing Cards */}
              <div className='grid gap-6 md:grid-cols-2'>
                {/* Tipe 12 - Selected */}
                <Card
                  className={`relative cursor-pointer transition-all ${
                    selectedPropertyType === 'tipe-12'
                      ? 'border-2 border-teal-500 bg-white shadow-lg'
                      : 'border border-gray-200 bg-white hover:shadow-md'
                  }`}>
                  <CardContent className='p-8'>
                    <div className='mb-6 text-center'>
                      <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600'>
                        <Home className='h-6 w-6 text-white' />
                      </div>
                      <h3 className='text-2xl font-bold text-teal-600'>Tipe 12</h3>
                    </div>

                    <div className='mb-8 space-y-4'>
                      <div className='flex items-center gap-3'>
                        <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                        <span className='text-gray-600'>Luas 12x12 meter</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                        <span className='text-gray-600'>2 Kamar Tidur</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                        <span className='text-gray-600'>1 Kamar Mandi</span>
                      </div>
                    </div>

                    <Button
                      type='button'
                      onClick={() => setSelectedPropertyType('tipe-12')}
                      className={`w-full rounded-full py-3 font-medium ${
                        selectedPropertyType === 'tipe-12'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}>
                      {selectedPropertyType === 'tipe-12' ? 'Dipilih' : 'Pilih'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Tipe 16 - Unselected */}
                <Card
                  className={`relative cursor-pointer transition-all ${
                    selectedPropertyType === 'tipe-16'
                      ? 'border-2 border-teal-500 bg-white shadow-lg'
                      : 'border border-gray-200 bg-white hover:shadow-md'
                  }`}>
                  <CardContent className='p-8'>
                    <div className='mb-6 text-center'>
                      <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600'>
                        <Home className='h-6 w-6 text-white' />
                      </div>
                      <h3 className='text-2xl font-bold text-teal-600'>Tipe 16</h3>
                    </div>

                    <div className='mb-8 space-y-4'>
                      <div className='flex items-center gap-3'>
                        <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                        <span className='text-gray-600'>Luas 16x16 meter</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                        <span className='text-gray-600'>3 Kamar Tidur</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                        <span className='text-gray-600'>2 Kamar Mandi</span>
                      </div>
                    </div>

                    <Button
                      type='button'
                      onClick={() => setSelectedPropertyType('tipe-16')}
                      className={`w-full rounded-full py-3 font-medium ${
                        selectedPropertyType === 'tipe-16'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}>
                      {selectedPropertyType === 'tipe-16' ? 'Dipilih' : 'Pilih'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing Details */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='diskon'>Diskon</Label>
                  <Input
                    id='diskon'
                    type='number'
                    {...register('diskon', { valueAsNumber: true })}
                    placeholder='Masukkan diskon'
                    className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                    disabled={isLoading}
                  />
                  {errors.diskon && <p className='text-sm text-red-500'>{errors.diskon.message}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='grandTotal'>Grand Total *</Label>
                  <Input
                    id='grandTotal'
                    type='number'
                    {...register('grandTotal', { valueAsNumber: true })}
                    placeholder='Grand total akan dihitung otomatis'
                    className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                    disabled={isLoading}
                  />
                  {errors.grandTotal && <p className='text-sm text-red-500'>{errors.grandTotal.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Fixed Footer with Action Buttons */}
          <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={isLoading}
                className='h-12 border-gray-300 bg-transparent px-8 py-2 text-gray-700 hover:bg-gray-50'>
                Batalkan
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='h-12 rounded-lg bg-green-500 px-8 py-2 text-white hover:bg-green-600'>
                {isLoading ? 'Menyimpan...' : selectedId ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
});
