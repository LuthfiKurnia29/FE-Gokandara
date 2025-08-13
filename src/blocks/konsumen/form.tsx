'use client';

import { memo, useEffect, useState } from 'react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { currency, uncurrency } from '@/lib/utils';
import { useCurrentUser } from '@/services/auth';
import { useKonsumenById, useProjekList, useProspekList, useReferensiList } from '@/services/konsumen';
import { CreateKonsumenData, KonsumenData } from '@/types/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import { addDays, startOfDay } from 'date-fns';
import { FilePondFile } from 'filepond';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema sesuai dengan Laravel migration
const konsumenSchema = z
  .object({
    // Required fields (sesuai migration - tanpa nullable())
    name: z.string().min(1, 'Nama harus diisi'),
    ktp_number: z
      .string()
      .optional()
      .refine((val) => !val || val === '' || /^\d{16}$/.test(val), {
        message: 'No. KTP harus 16 digit angka'
      }),
    address: z.string().min(1, 'Alamat harus diisi'),
    phone: z.string().min(1, 'Nomor telepon harus diisi'),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    refrensi_id: z.string().min(1, 'Referensi harus dipilih'),
    project_id: z.string().min(1, 'Proyek harus dipilih'),

    description: z.string().optional(),
    kesiapan_dana: z
      .string()
      .min(1, 'Kesiapan dana harus diisi')
      .refine(
        (value) => {
          const numericValue = uncurrency(value);
          return !isNaN(numericValue) && numericValue >= 0;
        },
        { message: 'Kesiapan dana harus berupa angka positif' }
      ),
    pengalaman: z.string().optional(),
    materi_fu_1: z.string().min(1, 'Materi follow up 1 harus diisi'),
    tgl_fu_1: z.string().min(1, 'Tanggal & waktu follow up 1 harus diisi'),
    materi_fu_2: z.string().min(1, 'Materi follow up 2 harus diisi'),
    tgl_fu_2: z.string().min(1, 'Tanggal & waktu follow up 2 harus diisi'),

    prospek_id: z.string().min(1, 'Prospek harus dipilih'),
    gambar: z.array(z.any()).optional()
  })
  .refine(
    (data) => {
      // Conditional validation: gambar wajib untuk Mitra
      // This will be checked in component based on user role
      return true;
    },
    {
      message: 'Gambar wajib diupload untuk user dengan role Mitra',
      path: ['gambar']
    }
  )
  .superRefine((data, ctx) => {
    const { tgl_fu_1, tgl_fu_2 } = data;
    if (!tgl_fu_1 || !tgl_fu_2) return;
    const first = new Date(tgl_fu_1);
    const second = new Date(tgl_fu_2);
    if (isNaN(first.getTime()) || isNaN(second.getTime())) return;
    const minSecond = addDays(first, 7);
    if (second < minSecond) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tgl_fu_2'],
        message: 'Tanggal follow up 2 minimal 7 hari setelah Tanggal & waktu follow up 1'
      });
    }
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Get current user to check role
  const { data: currentUser } = useCurrentUser();

  // Check if current user is Mitra
  const isMitra = React.useMemo(() => {
    if (!currentUser?.roles) return false;
    // Check if user has Mitra role based on roles array
    return currentUser.roles.some(
      (userRole) => userRole.role.name.toLowerCase() === 'mitra' || userRole.role.code.toLowerCase() === 'mitra'
    );
  }, [currentUser]);

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
      kesiapan_dana: '',
      prospek_id: '',
      project_id: '',
      pengalaman: '',
      materi_fu_1: '',
      tgl_fu_1: '',
      materi_fu_2: '',
      tgl_fu_2: '',
      gambar: []
    }
  });

  // Watch form values for Select components
  const referensiId = watch('refrensi_id');
  const prospekId = watch('prospek_id');
  const projectId = watch('project_id');
  const tglFu = watch('tgl_fu_1');
  const tglFu2 = watch('tgl_fu_2');

  const minDateFollowUp2 = React.useMemo(() => {
    const today = startOfDay(new Date());
    if (!tglFu) return today;
    const first = startOfDay(new Date(tglFu));
    const sevenDaysAfter = addDays(first, 7);
    return sevenDaysAfter > today ? sevenDaysAfter : today;
  }, [tglFu]);

  // Ensure follow up 2 is cleared if it becomes invalid compared to follow up 1
  useEffect(() => {
    if (!tglFu || !tglFu2) return;
    const first = new Date(tglFu);
    const second = new Date(tglFu2);
    const minSecond = addDays(first, 7);
    if (second < minSecond) {
      setValue('tgl_fu_2', '');
    }
  }, [tglFu, tglFu2, setValue]);

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
        kesiapan_dana: existingData.kesiapan_dana ? currency(existingData.kesiapan_dana) : '',
        prospek_id: existingData.prospek_id?.toString() || '',
        project_id: existingData.project_id?.toString() || '',
        pengalaman: existingData.pengalaman || '',
        materi_fu_1: existingData.materi_fu_1 || '',
        tgl_fu_1: existingData.tgl_fu_1 || '',
        materi_fu_2: existingData.materi_fu_2 || '',
        tgl_fu_2: existingData.tgl_fu_2 || '',
        gambar: [] // Reset gambar field for new uploads
      });
    }
  }, [existingData, reset]);

  // Handle file upload change
  const handleFileUploadChange = (file: FilePondFile[] | null) => {
    if (file && file.length > 0) {
      const files = file.map((f) => f.file as File);
      setUploadedFiles(files);
      setValue('gambar', files);
    } else {
      setUploadedFiles([]);
      setValue('gambar', []);
    }
  };

  const onFormSubmit = async (data: KonsumenFormData) => {
    // Validate gambar upload for Mitra role
    if (isMitra) {
      const hasNewFiles = uploadedFiles.length > 0;
      const hasExistingImage = existingData?.gambar_url;

      if (!hasNewFiles && !hasExistingImage) {
        alert('Gambar wajib diupload untuk user dengan role Mitra');
        return;
      }
    }

    // Convert string IDs to numbers and format data for Laravel
    const submitData: CreateKonsumenData = {
      name: data.name,
      ktp_number: data.ktp_number,
      address: data.address,
      phone: data.phone,
      email: data.email || undefined,
      description: data.description || '',
      refrensi_id: parseInt(data.refrensi_id),
      prospek_id: parseInt(data.prospek_id),
      project_id: parseInt(data.project_id),
      kesiapan_dana: data.kesiapan_dana ? uncurrency(data.kesiapan_dana) : null,
      pengalaman: data.pengalaman || null,
      materi_fu_1: data.materi_fu_1 || null,
      tgl_fu_1: data.tgl_fu_1 || null,
      materi_fu_2: data.materi_fu_2 || null,
      tgl_fu_2: data.tgl_fu_2 || null,
      gambar: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    await onSubmit(submitData);
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
          <CardContent className='flex-1 px-6 pt-4' style={{ overflow: 'auto', minHeight: 0, maxHeight: 'calc(60vh)' }}>
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
                      {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='ktp' className='font-medium text-gray-900'>
                        No. KTP (Opsional)
                      </Label>
                      <Input
                        id='ktp'
                        inputMode='numeric'
                        pattern='\d*'
                        maxLength={16}
                        {...register('ktp_number')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.ktp_number && <p className='text-sm text-red-600'>{errors.ktp_number.message}</p>}
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
                      {errors.phone && <p className='text-sm text-red-600'>{errors.phone.message}</p>}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='email' className='font-medium text-gray-900'>
                        Email (Opsional)
                      </Label>
                      <Input
                        id='email'
                        type='email'
                        {...register('email')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
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
                      {errors.address && <p className='text-sm text-red-600'>{errors.address.message}</p>}
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

                    {/* Upload Gambar - Hanya untuk Mitra */}
                    {isMitra && (
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label className='font-medium text-gray-900'>
                            Upload Gambar {selectedId ? '(Opsional)' : '*'}
                          </Label>
                          {selectedId && existingData?.gambar_url && (
                            <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                              <p className='text-sm text-blue-800'>
                                💡 <strong>Petunjuk:</strong> Jika tidak ingin mengubah gambar, langsung update saja.
                                Upload gambar baru hanya jika ingin menambah atau mengganti gambar existing.
                              </p>
                            </div>
                          )}
                          <FileUpload
                            onChange={handleFileUploadChange}
                            acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                            allowMultiple={false}
                            maxFiles={1}
                            disabled={isLoading}
                            initialFiles={existingData?.gambar_url ? [existingData.gambar_url] : []}
                          />
                          {errors.gambar && <p className='text-sm text-red-600'>{errors.gambar.message}</p>}
                          {!selectedId && uploadedFiles.length === 0 && (
                            <p className='text-sm text-red-600'>Gambar wajib diupload untuk user dengan role Mitra</p>
                          )}
                          {selectedId && uploadedFiles.length === 0 && !existingData?.gambar_url && (
                            <p className='text-sm text-red-600'>
                              Gambar wajib ada (existing atau upload baru) untuk user dengan role Mitra
                            </p>
                          )}
                        </div>
                      </div>
                    )}
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
                      {errors.refrensi_id && <p className='text-sm text-red-600'>{errors.refrensi_id.message}</p>}
                    </div>

                    {/* Kolom 2: Kesiapan Dana */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Kesiapan Dana *</Label>
                      <Input
                        type='currency'
                        placeholder='Contoh: 100.000.000'
                        {...register('kesiapan_dana')}
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.kesiapan_dana && <p className='text-sm text-red-600'>{errors.kesiapan_dana.message}</p>}
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
                      {errors.prospek_id && <p className='text-sm text-red-600'>{errors.prospek_id.message}</p>}
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
                      {errors.project_id && <p className='text-sm text-red-600'>{errors.project_id.message}</p>}
                    </div>

                    {/* Kolom 2: Pengalaman Pelanggan */}
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Pengalaman Pelanggan (Opsional)</Label>
                      <Input
                        {...register('pengalaman')}
                        placeholder='Masukkan pengalaman pelanggan...'
                        className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                      {errors.pengalaman && <p className='text-sm text-red-600'>{errors.pengalaman.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Follow up Tab */}
              {activeTab === 'followup' && (
                <div className='space-y-6'>
                  {/* Follow Up 1 */}
                  <div className='space-y-4'>
                    <h3 className='border-b border-gray-200 pb-2 text-lg font-medium text-gray-900'>Follow Up 1</h3>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label className='font-medium text-gray-900'>Materi Follow Up *</Label>
                        <Input
                          {...register('materi_fu_1')}
                          placeholder='Masukkan materi follow up...'
                          className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        />
                        {errors.materi_fu_1 && <p className='text-sm text-red-600'>{errors.materi_fu_1.message}</p>}
                      </div>

                      <div className='space-y-2'>
                        <Label className='font-medium text-gray-900'>Tanggal & Waktu Follow Up *</Label>
                        <DateTimePicker
                          value={tglFu ? new Date(tglFu) : undefined}
                          onChange={(date: Date | undefined) => setValue('tgl_fu_1', date ? date.toISOString() : '')}
                          placeholder='Pilih tanggal & waktu follow up...'
                          format='dd/MM/yyyy HH:mm'
                          className='h-12'
                          withInput={false}
                        />
                        {errors.tgl_fu_1 && <p className='text-sm text-red-600'>{errors.tgl_fu_1.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Follow Up 2 */}
                  <div className='space-y-4'>
                    <h3 className='border-b border-gray-200 pb-2 text-lg font-medium text-gray-900'>Follow Up 2</h3>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label className='font-medium text-gray-900'>Materi Follow Up 2 *</Label>
                        <Input
                          {...register('materi_fu_2')}
                          placeholder='Masukkan materi follow up 2...'
                          className='h-12 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        />
                        {errors.materi_fu_2 && <p className='text-sm text-red-600'>{errors.materi_fu_2.message}</p>}
                      </div>

                      <div className='space-y-2'>
                        <Label className='font-medium text-gray-900'>Tanggal & Waktu Follow Up 2 *</Label>
                        <DateTimePicker
                          value={tglFu2 ? new Date(tglFu2) : undefined}
                          onChange={(date: Date | undefined) => setValue('tgl_fu_2', date ? date.toISOString() : '')}
                          placeholder='Pilih tanggal & waktu follow up 2...'
                          format='dd/MM/yyyy HH:mm'
                          className='h-12'
                          disabled={!tglFu}
                          minDate={minDateFollowUp2}
                          withInput={false}
                        />
                        {errors.tgl_fu_2 && <p className='text-sm text-red-600'>{errors.tgl_fu_2.message}</p>}
                        {!tglFu && <p className='text-sm text-orange-600'>Isi tanggal follow up pertama dulu</p>}
                      </div>
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
