'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useKonsumenById } from '@/services/konsumen';
import { CreateKonsumenData, KonsumenData } from '@/types/konsumen';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema
const konsumenSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  ktp_number: z.string().min(1, 'No. KTP/SIM harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  phone: z.string().min(1, 'Nomor telepon harus diisi'),
  email: z.string().email('Format email tidak valid'),
  description: z.string().optional(),
  referensi: z.string().optional(),
  kesiapan_dana: z.string().optional(),
  prospek: z.string().optional(),
  proyek_diminati: z.string().optional(),
  pengalaman_pelanggan: z.string().optional(),
  rencana_followup: z.string().optional(),
  tanggal_followup: z.string().optional()
});

type KonsumenFormData = z.infer<typeof konsumenSchema>;

interface KonsumenFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateKonsumenData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const referensiOptions = [
  { value: 'sosial_media', label: 'Sosial Media' },
  { value: 'teman', label: 'Teman/Keluarga' },
  { value: 'iklan', label: 'Iklan' },
  { value: 'website', label: 'Website' },
  { value: 'lainnya', label: 'Lainnya' }
];

const prospekOptions = [
  { value: 'new', label: 'New' },
  { value: 'existing', label: 'Existing' },
  { value: 'potential', label: 'Potential' }
];

const proyekOptions = [
  { value: 'proyek_a', label: 'Proyek A' },
  { value: 'proyek_b', label: 'Proyek B' },
  { value: 'proyek_c', label: 'Proyek C' }
];

export const KonsumenForm = memo(function KonsumenForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: KonsumenFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

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
      referensi: '',
      kesiapan_dana: '',
      prospek: 'new',
      proyek_diminati: '',
      pengalaman_pelanggan: '',
      rencana_followup: '',
      tanggal_followup: ''
    }
  });

  // Watch form values for Select components
  const referensi = watch('referensi');
  const prospek = watch('prospek');
  const proyekDiminati = watch('proyek_diminati');

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
        referensi: '',
        kesiapan_dana: '',
        prospek: 'new',
        proyek_diminati: '',
        pengalaman_pelanggan: '',
        rencana_followup: '',
        tanggal_followup: ''
      });
    }
  }, [existingData, reset]);

  const onFormSubmit = async (data: KonsumenFormData) => {
    const submitData: CreateKonsumenData = {
      name: data.name,
      ktp_number: data.ktp_number,
      address: data.address,
      phone: data.phone,
      email: data.email,
      description: data.description || ''
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
            {/* Tab Content Container - Optimized Height for all tabs */}
            <div className='pb-4' style={{ height: '380px', minHeight: '380px', maxHeight: '380px' }}>
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='nama' className='font-medium text-gray-900'>
                        Nama
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
                        No. KTP/SIM
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
                        Nomor Telepon
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
                        Email
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
                        Alamat
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

              {/* Preferensi Tab */}
              {activeTab === 'preferensi' && (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Referensi</Label>
                      <Select
                        options={referensiOptions}
                        value={referensi}
                        onChange={(value) => setValue('referensi', value as string)}
                        placeholder='Pilih referensi'
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Kesiapan Dana</Label>
                      <Input
                        type='text'
                        placeholder='0,000,000'
                        {...register('kesiapan_dana')}
                        onChange={handleCurrencyChange}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Prospek</Label>
                      <Select
                        options={prospekOptions}
                        value={prospek}
                        onChange={(value) => setValue('prospek', value as string)}
                        placeholder='Pilih prospek'
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Proyek yang Diminati</Label>
                      <Select
                        options={proyekOptions}
                        value={proyekDiminati}
                        onChange={(value) => setValue('proyek_diminati', value as string)}
                        placeholder='Pilih proyek'
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label className='font-medium text-gray-900'>Pengalaman Pelanggan</Label>
                      <Input
                        {...register('pengalaman_pelanggan')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Follow up Tab */}
              {activeTab === 'followup' && (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='font-medium text-gray-900'>Rencana Follow Up</Label>
                    <Textarea
                      {...register('rencana_followup')}
                      className='h-12 min-h-[100px] border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                      rows={4}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='font-medium text-gray-900'>Tanggal Follow Up</Label>
                    <div className='relative'>
                      <Input
                        type='date'
                        {...register('tanggal_followup')}
                        className='h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
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
                    disabled={isLoading}
                    className='h-12 rounded-lg bg-green-500 px-8 py-2 text-white hover:bg-green-600'>
                    {isLoading ? 'Menyimpan...' : 'Submit'}
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
