'use client';

import { memo, useEffect, useState } from 'react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useKonsumenById, useProjekList, useProspekList, useReferensiList } from '@/services/konsumen';
import { CreateKonsumenData, KonsumenData } from '@/types/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema sesuai dengan Laravel migration
const konsumenSchema = z.object({
  // Required fields (sesuai migration - tanpa nullable())
  name: z.string().min(1, 'Nama harus diisi'),
  ktp_number: z.string().min(1, 'No. KTP/SIM harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  phone: z.string().min(1, 'Nomor telepon harus diisi'),
  email: z.string().email('Format email tidak valid'),
  refrensi_id: z.string().min(1, 'Referensi harus dipilih'),
  project_id: z.string().min(1, 'Proyek harus dipilih'),

  description: z.string().optional(),
  kesiapan_dana: z
    .string()
    .min(1, 'Kesiapan dana harus diisi')
    .refine(
      (value) => {
        // Remove commas and check if it's a valid number
        const numericValue = value.replace(/,/g, '');
        return !isNaN(parseFloat(numericValue)) && parseFloat(numericValue) >= 0;
      },
      { message: 'Kesiapan dana harus berupa angka positif' }
    ),
  pengalaman: z.string().optional(),
  materi_fu: z.string().optional(),
  tgl_fu: z.string().optional(),

  prospek_id: z.string().min(1, 'Prospek harus dipilih')
});

type KonsumenFormData = z.infer<typeof konsumenSchema>;

interface KonsumenFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateKonsumenData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const KonsumenForm = memo(function KonsumenForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: KonsumenFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch master data from APIs with improved error handling
  const { data: referensiOptions = [], isLoading: isLoadingReferensi, error: errorReferensi } = useReferensiList();

  const { data: proyekOptions = [], isLoading: isLoadingProyek, error: errorProyek } = useProjekList();

  const { data: prospekOptions = [], isLoading: isLoadingProspek, error: errorProspek } = useProspekList();

  // Safe option mapping to prevent Select component errors
  const safeReferensiOptions = React.useMemo(() => {
    if (!Array.isArray(referensiOptions)) return [];
    return referensiOptions
      .filter((ref) => ref && ref.id && ref.name)
      .map((ref) => ({
        value: ref.id.toString(),
        label: ref.name
      }));
  }, [referensiOptions]);

  const safeProspekOptions = React.useMemo(() => {
    if (!Array.isArray(prospekOptions)) return [];
    return prospekOptions
      .filter((prospek) => prospek && prospek.id && prospek.name)
      .map((prospek) => ({
        value: prospek.id.toString(),
        label: prospek.name
      }));
  }, [prospekOptions]);

  const safeProjekOptions = React.useMemo(() => {
    if (!Array.isArray(proyekOptions)) return [];
    return proyekOptions
      .filter((proyek) => proyek && proyek.id && proyek.name)
      .map((proyek) => ({
        value: proyek.id.toString(),
        label: proyek.name
      }));
  }, [proyekOptions]);

  // Debug information for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Konsumen Form - Master Data Status');
      console.log('📊 Referensi:', {
        data: referensiOptions,
        loading: isLoadingReferensi,
        error: errorReferensi,
        safeOptions: safeReferensiOptions.length
      });
      console.log('📊 Prospek:', {
        data: prospekOptions,
        loading: isLoadingProspek,
        error: errorProspek,
        safeOptions: safeProspekOptions.length
      });
      console.log('📊 Proyek:', {
        data: proyekOptions,
        loading: isLoadingProyek,
        error: errorProyek,
        safeOptions: safeProjekOptions.length
      });
      console.groupEnd();
    }
  }, [
    referensiOptions,
    isLoadingReferensi,
    errorReferensi,
    safeReferensiOptions,
    prospekOptions,
    isLoadingProspek,
    errorProspek,
    safeProspekOptions,
    proyekOptions,
    isLoadingProyek,
    errorProyek,
    safeProjekOptions
  ]);

  // Get existing data for edit mode
  const { data: existingData } = useKonsumenById(selectedId || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<KonsumenFormData>({
    resolver: zodResolver(konsumenSchema),
    defaultValues: {
      name: '',
      ktp_number: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      refrensi_id: '',
      kesiapan_dana: '0',
      prospek_id: '',
      project_id: '',
      pengalaman: '',
      materi_fu: '',
      tgl_fu: ''
    }
  });

  // Watch form values for Select components
  const referensiId = watch('refrensi_id');
  const prospekId = watch('prospek_id');
  const projectId = watch('project_id');
  const tglFu = watch('tgl_fu');

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (existingData) {
      reset({
        name: existingData.name || '',
        ktp_number: existingData.ktp_number || '',
        address: existingData.address || '',
        phone: existingData.phone || '',
        email: existingData.email || '',
        description: existingData.description || '',
        refrensi_id: existingData.refrensi_id?.toString() || '',
        kesiapan_dana: existingData.kesiapan_dana?.toString() || '',
        prospek_id: existingData.prospek_id?.toString() || '',
        project_id: existingData.project_id?.toString() || '',
        pengalaman: existingData.pengalaman || '',
        materi_fu: existingData.materi_fu || '',
        tgl_fu: existingData.tgl_fu || ''
      });
    }
  }, [existingData, reset]);

  const onFormSubmit = async (data: KonsumenFormData) => {
    // Convert string IDs to numbers and format data for Laravel
    const submitData: CreateKonsumenData = {
      name: data.name,
      ktp_number: data.ktp_number,
      address: data.address,
      phone: data.phone,
      email: data.email,
      description: data.description || '',
      refrensi_id: parseInt(data.refrensi_id),
      prospek_id: parseInt(data.prospek_id),
      project_id: parseInt(data.project_id),
      kesiapan_dana: data.kesiapan_dana ? parseFloat(data.kesiapan_dana.replace(/,/g, '')) : null,
      pengalaman: data.pengalaman || null,
      materi_fu: data.materi_fu || null,
      tgl_fu: data.tgl_fu || null
    };

    await onSubmit(submitData);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValue('kesiapan_dana', formatted);
  };

  // Enhanced error handling messages
  const getMasterDataErrorMessage = () => {
    const errors = [];
    if (errorReferensi) errors.push('Referensi');
    if (errorProspek) errors.push('Prospek');
    if (errorProyek) errors.push('Proyek');

    if (errors.length === 0) return null;

    return `Gagal memuat data: ${errors.join(', ')}. Silakan refresh halaman atau hubungi administrator.`;
  };

  const masterDataError = getMasterDataErrorMessage();

  return (
    <div className='flex h-full w-full flex-col'>
      <form onSubmit={handleSubmit(onFormSubmit)} className='flex h-full w-full flex-col'>
        <Card className='flex h-full w-full flex-col border-0 shadow-none'>
          {/* Fixed Header */}
          <CardHeader className='flex-shrink-0 px-6 pt-6 pb-0'>
            <h1 className='mb-6 text-2xl font-bold text-gray-900'>
              {selectedId ? 'Edit Data Konsumen' : 'Tambah Data Konsumen'}
            </h1>

            {/* Tabs */}
            <div className='flex space-x-8 border-b border-gray-200'>
              <button
                type='button'
                onClick={() => setActiveTab('basic')}
                className={`border-b-2 pb-3 ${activeTab === 'basic' ? 'border-teal-600' : 'border-transparent'}`}>
                <span className={activeTab === 'basic' ? 'font-medium text-teal-600' : 'text-gray-500'}>
                  Basic Information
                </span>
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('preferensi')}
                className={`border-b-2 pb-3 ${activeTab === 'preferensi' ? 'border-teal-600' : 'border-transparent'}`}>
                <span className={activeTab === 'preferensi' ? 'font-medium text-teal-600' : 'text-gray-500'}>
                  Preferensi
                </span>
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('followup')}
                className={`border-b-2 pb-3 ${activeTab === 'followup' ? 'border-teal-600' : 'border-transparent'}`}>
                <span className={activeTab === 'followup' ? 'font-medium text-teal-600' : 'text-gray-500'}>
                  Follow up
                </span>
              </button>
            </div>
          </CardHeader>

          {/* Scrollable Content Area */}
          <CardContent
            className='flex-1 px-6 pt-4'
            style={{ overflow: 'auto', minHeight: 0, maxHeight: 'calc(100% - 140px)' }}>
            {/* Master Data Error Display */}
            {masterDataError && (
              <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4'>
                <div className='flex items-center'>
                  <svg className='mr-2 h-5 w-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <div>
                    <p className='text-sm font-medium text-red-700'>{masterDataError}</p>
                    <p className='mt-1 text-xs text-red-600'>
                      Silakan refresh halaman atau hubungi administrator jika masalah berlanjut.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content Container - Optimized Height for all tabs */}
            <div className='pb-4'>
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='nama' className='font-medium text-gray-900'>
                        Nama *
                      </Label>
                      <Input
                        id='nama'
                        {...register('name')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='ktp' className='font-medium text-gray-900'>
                        No. KTP/SIM *
                      </Label>
                      <Input
                        id='ktp'
                        {...register('ktp_number')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.ktp_number && <p className='text-sm text-red-500'>{errors.ktp_number.message}</p>}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='phone' className='font-medium text-gray-900'>
                        Nomor Telepon *
                      </Label>
                      <Input
                        id='phone'
                        {...register('phone')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.phone && <p className='text-sm text-red-500'>{errors.phone.message}</p>}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='email' className='font-medium text-gray-900'>
                        Email *
                      </Label>
                      <Input
                        id='email'
                        type='email'
                        {...register('email')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='alamat' className='font-medium text-gray-900'>
                        Alamat *
                      </Label>
                      <Textarea
                        id='alamat'
                        {...register('address')}
                        className='min-h-[140px] resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        rows={6}
                      />
                      {errors.address && <p className='text-sm text-red-500'>{errors.address.message}</p>}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='description' className='font-medium text-gray-900'>
                        Deskripsi (Opsional)
                      </Label>
                      <Textarea
                        id='description'
                        {...register('description')}
                        className='min-h-[80px] resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferensi Tab - Updated Layout sesuai Design */}
              {activeTab === 'preferensi' && (
                <div className='space-y-6'>
                  {/* Baris Utama: Referensi | Kesiapan Dana | Prospek (3 kolom sejajar) */}
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Kolom 1: Referensi */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Referensi *</Label>
                      <Select
                        options={safeReferensiOptions}
                        value={referensiId}
                        onChange={(value) => setValue('refrensi_id', value as string)}
                        placeholder={isLoadingReferensi ? 'Loading...' : 'Pilih referensi'}
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        disabled={isLoadingReferensi}
                      />
                      {errors.refrensi_id && <p className='text-sm text-red-500'>{errors.refrensi_id.message}</p>}
                    </div>

                    {/* Kolom 2: Kesiapan Dana */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Kesiapan Dana *</Label>
                      <Input
                        type='text'
                        placeholder='0,000,000'
                        {...register('kesiapan_dana')}
                        onChange={handleCurrencyChange}
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>

                    {/* Kolom 3: Prospek */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Prospek *</Label>
                      <Select
                        options={safeProspekOptions}
                        value={prospekId}
                        onChange={(value) => setValue('prospek_id', value as string)}
                        placeholder={isLoadingProspek ? 'Loading...' : 'Pilih prospek'}
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        disabled={isLoadingProspek}
                      />
                      {errors.prospek_id && <p className='text-sm text-red-500'>{errors.prospek_id.message}</p>}
                    </div>
                  </div>

                  {/* Baris Kedua: Proyek yang Diminati | Pengalaman Pelanggan (2 kolom sejajar) */}
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Kolom 1: Proyek yang Diminati */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Proyek yang Diminati *</Label>
                      <Select
                        options={safeProjekOptions}
                        value={projectId}
                        onChange={(value) => setValue('project_id', value as string)}
                        placeholder={isLoadingProyek ? 'Loading...' : 'Pilih proyek'}
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        disabled={isLoadingProyek}
                      />
                      {errors.project_id && <p className='text-sm text-red-500'>{errors.project_id.message}</p>}
                    </div>

                    {/* Kolom 2: Pengalaman Pelanggan */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Pengalaman Pelanggan (Opsional)</Label>
                      <Input
                        {...register('pengalaman')}
                        placeholder='Masukkan pengalaman pelanggan...'
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Follow up Tab */}
              {activeTab === 'followup' && (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Materi Follow Up (Opsional)</Label>
                      <Input
                        {...register('materi_fu')}
                        placeholder='Masukkan materi follow up...'
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Tanggal Follow Up (Opsional)</Label>
                      <DatePicker
                        value={tglFu ? new Date(tglFu) : undefined}
                        onChange={(date) => setValue('tgl_fu', date ? date.toISOString().split('T')[0] : '')}
                        placeholder='Pilih tanggal follow up...'
                        format='dd/MM/yyyy'
                        className='h-12'
                        withInput={false}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Fixed Footer with Action Buttons */}
          <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <div className='flex justify-end space-x-4'>
              {activeTab === 'basic' && (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel}
                    disabled={isLoading}
                    className='h-12 border-gray-300 bg-transparent px-8 py-2 text-gray-700 hover:bg-gray-50'>
                    Batalkan
                  </Button>
                  <Button
                    type='button'
                    onClick={() => setActiveTab('preferensi')}
                    disabled={isLoading}
                    className='h-12 rounded-lg bg-orange-400 px-8 py-2 text-white hover:bg-orange-500'>
                    Selanjutnya
                  </Button>
                </>
              )}

              {activeTab === 'preferensi' && (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setActiveTab('basic')}
                    disabled={isLoading}
                    className='h-12 border-gray-300 bg-transparent px-8 py-2 text-gray-700 hover:bg-gray-50'>
                    Kembali
                  </Button>
                  <Button
                    type='button'
                    onClick={() => setActiveTab('followup')}
                    disabled={isLoading}
                    className='h-12 rounded-lg bg-orange-400 px-8 py-2 text-white hover:bg-orange-500'>
                    Selanjutnya
                  </Button>
                </>
              )}

              {activeTab === 'followup' && (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setActiveTab('preferensi')}
                    disabled={isLoading}
                    className='h-12 border-gray-300 bg-transparent px-8 py-2 text-gray-700 hover:bg-gray-50'>
                    Kembali
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading || isLoadingReferensi || isLoadingProspek || isLoadingProyek}
                    className='h-12 rounded-lg bg-green-500 px-8 py-2 text-white hover:bg-green-600'>
                    {isLoading ? 'Menyimpan...' : selectedId ? 'Update' : 'Simpan'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
});
