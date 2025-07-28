'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAllBlok,
  useAllKonsumen,
  useAllProperti,
  useAllTipe,
  useAllUnit,
  usePenjualanById
} from '@/services/penjualan';
import { CreatePenjualanData, UpdatePenjualanData } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeft, Check, Home, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Form validation schema sesuai dengan Laravel controller validation
const transaksiSchema = z.object({
  konsumen_id: z.string().min(1, 'Konsumen harus dipilih'),
  properti_id: z.string().min(1, 'Properti harus dipilih'),
  blok_id: z.string().min(1, 'Blok harus dipilih'),
  tipe_id: z.string().min(1, 'Tipe harus dipilih'),
  unit_id: z.string().min(1, 'Unit harus dipilih'),
  diskon: z.string().optional()
});

type TransaksiFormData = z.infer<typeof transaksiSchema>;

interface PropertyTypeModalProps {
  onClose?: () => void;
  selectedId?: number | null;
  onSubmit?: (data: CreatePenjualanData | UpdatePenjualanData) => Promise<void>;
}

interface BookingDetails {
  blok: string;
  unit: string;
  lbLt: string;
  kelebihanTanah: string;
  lokasi: string;
  harga: number;
  propertyImage?: string;
}

const PropertyTypeModal = ({ onClose, selectedId, onSubmit }: PropertyTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedProperti, setSelectedProperti] = useState<any>(null);

  // Fetch master data from APIs
  const { data: konsumenOptions = [], isLoading: isLoadingKonsumen } = useAllKonsumen();
  const { data: propertiOptions = [], isLoading: isLoadingProperti } = useAllProperti();
  const { data: blokOptions = [], isLoading: isLoadingBlok } = useAllBlok();
  const { data: tipeOptions = [], isLoading: isLoadingTipe } = useAllTipe();
  const { data: unitOptions = [], isLoading: isLoadingUnit } = useAllUnit();

  // Get existing data for edit mode
  const { data: existingData } = usePenjualanById(selectedId || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TransaksiFormData>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      konsumen_id: '',
      properti_id: '',
      blok_id: '',
      tipe_id: '',
      unit_id: '',
      diskon: ''
    }
  });

  // Watch form values
  const konsumenId = watch('konsumen_id');
  const propertiId = watch('properti_id');
  const blokId = watch('blok_id');
  const tipeId = watch('tipe_id');
  const unitId = watch('unit_id');
  const diskon = watch('diskon');

  // Safe option mapping
  const safeKonsumenOptions = konsumenOptions.map((konsumen) => ({
    value: konsumen.id.toString(),
    label: konsumen.name
  }));

  const safePropertiOptions = propertiOptions.map((properti) => ({
    value: properti.id.toString(),
    label: properti.name
  }));

  const safeBlokOptions = blokOptions.map((blok) => ({
    value: blok.id.toString(),
    label: blok.name
  }));

  const safeTipeOptions = tipeOptions.map((tipe) => ({
    value: tipe.id.toString(),
    label: tipe.name
  }));

  const safeUnitOptions = unitOptions.map((unit) => ({
    value: unit.id.toString(),
    label: unit.name
  }));

  // Update selected properti when properti_id changes
  useEffect(() => {
    if (propertiId) {
      const properti = propertiOptions.find((p) => p.id.toString() === propertiId);
      setSelectedProperti(properti);
    } else {
      setSelectedProperti(null);
    }
  }, [propertiId, propertiOptions]);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (existingData) {
      reset({
        konsumen_id: existingData.konsumen_id?.toString() || '',
        properti_id: existingData.properti_id?.toString() || '',
        blok_id: existingData.blok_id?.toString() || '',
        tipe_id: existingData.tipe_id?.toString() || '',
        unit_id: existingData.unit_id?.toString() || '',
        diskon: existingData.diskon?.toString() || ''
      });
    }
  }, [existingData, reset]);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setValue('tipe_id', typeId);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChoose = () => {
    if (!selectedType) {
      toast.error('Silakan pilih tipe terlebih dahulu');
      return;
    }
    console.log('Selected type:', selectedType);
    setShowBookingForm(true);
  };

  const handleBack = () => {
    setShowBookingForm(false);
  };

  const handleFormSubmit = async (data: TransaksiFormData) => {
    if (!onSubmit) return;

    const submitData = {
      konsumen_id: parseInt(data.konsumen_id),
      properti_id: parseInt(data.properti_id),
      blok_id: parseInt(data.blok_id),
      tipe_id: parseInt(data.tipe_id),
      unit_id: parseInt(data.unit_id),
      diskon: data.diskon ? parseFloat(data.diskon) : null
    };

    await onSubmit(submitData);
  };

  const handleBooking = () => {
    handleSubmit(handleFormSubmit)();
  };

  // Mock data - replace with actual data from your form/API
  const bookingDetails: BookingDetails = {
    blok: blokOptions.find((b) => b.id.toString() === blokId)?.name || '-',
    unit: unitOptions.find((u) => u.id.toString() === unitId)?.name || '-',
    lbLt: selectedProperti?.lb_lt || '0m²/0m²',
    kelebihanTanah: selectedProperti?.kelebihan_tanah || '0m²',
    lokasi: selectedProperti?.location || 'Lorem Ipsum',
    harga: selectedProperti?.price || 0
  };

  // Dynamic property types based on actual tipe data
  const propertyTypes = tipeOptions.map((tipe) => ({
    id: tipe.id.toString(),
    name: tipe.name,
    features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'], // You can add more features if available in API
    selected: selectedType === tipe.id.toString()
  }));

  // Booking Form
  if (showBookingForm) {
    return (
      <div className='flex h-full w-full items-center justify-center p-2'>
        <div className='w-full max-w-6xl'>
          {/* Back Button */}
          <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4 p-0 hover:bg-transparent'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Kembali
          </Button>

          {/* Title */}
          <h1 className='mb-6 text-3xl font-bold text-gray-900'>Pemesanan</h1>

          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Property Image */}
            <div className='overflow-hidden rounded-xl bg-gray-300'>
              <div className='aspect-[4/3] w-full bg-gray-300' />
            </div>

            {/* Booking Details */}
            <div className='space-y-4'>
              {/* Form Fields */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label className='mb-1 block text-sm font-medium text-gray-700'>Konsumen</Label>
                  <Select
                    options={safeKonsumenOptions}
                    value={konsumenId}
                    onChange={(value) => setValue('konsumen_id', value as string)}
                    placeholder={isLoadingKonsumen ? 'Loading...' : 'Pilih Konsumen'}
                    disabled={isLoadingKonsumen}
                    className='h-10'
                  />
                  {errors.konsumen_id && <p className='text-xs text-red-500'>{errors.konsumen_id.message}</p>}
                </div>
                <div>
                  <Label className='mb-1 block text-sm font-medium text-gray-700'>Properti</Label>
                  <Select
                    options={safePropertiOptions}
                    value={propertiId}
                    onChange={(value) => setValue('properti_id', value as string)}
                    placeholder={isLoadingProperti ? 'Loading...' : 'Pilih Properti'}
                    disabled={isLoadingProperti}
                    className='h-10'
                  />
                  {errors.properti_id && <p className='text-xs text-red-500'>{errors.properti_id.message}</p>}
                </div>
                <div>
                  <Label className='mb-1 block text-sm font-medium text-gray-700'>Blok</Label>
                  <Select
                    options={safeBlokOptions}
                    value={blokId}
                    onChange={(value) => setValue('blok_id', value as string)}
                    placeholder={isLoadingBlok ? 'Loading...' : 'Pilih Blok'}
                    disabled={isLoadingBlok}
                    className='h-10'
                  />
                  {errors.blok_id && <p className='text-xs text-red-500'>{errors.blok_id.message}</p>}
                </div>
                <div>
                  <Label className='mb-1 block text-sm font-medium text-gray-700'>Tipe</Label>
                  <Select
                    options={safeTipeOptions}
                    value={tipeId}
                    onChange={(value) => setValue('tipe_id', value as string)}
                    placeholder={isLoadingTipe ? 'Loading...' : 'Pilih Tipe'}
                    disabled={isLoadingTipe}
                    className='h-10'
                  />
                  {errors.tipe_id && <p className='text-xs text-red-500'>{errors.tipe_id.message}</p>}
                </div>
                <div>
                  <Label className='mb-1 block text-sm font-medium text-gray-700'>Unit</Label>
                  <Select
                    options={safeUnitOptions}
                    value={unitId}
                    onChange={(value) => setValue('unit_id', value as string)}
                    placeholder={isLoadingUnit ? 'Loading...' : 'Pilih Unit'}
                    disabled={isLoadingUnit}
                    className='h-10'
                  />
                  {errors.unit_id && <p className='text-xs text-red-500'>{errors.unit_id.message}</p>}
                </div>
                <div>
                  <Label className='mb-1 block text-sm font-medium text-gray-700'>Diskon (Opsional)</Label>
                  <Input
                    type='number'
                    placeholder='0'
                    {...register('diskon')}
                    className='h-10 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                  <span className='text-sm text-gray-600'>LB/LT</span>
                  <span className='text-right text-sm font-medium text-gray-900'>{bookingDetails.lbLt}</span>
                </div>
                <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                  <span className='text-sm text-gray-600'>Kelebihan Tanah</span>
                  <span className='text-right text-sm font-medium text-gray-900'>{bookingDetails.kelebihanTanah}</span>
                </div>
                <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                  <span className='text-sm text-gray-600'>Lokasi</span>
                  <span className='text-right text-sm font-medium text-gray-900'>{bookingDetails.lokasi}</span>
                </div>
              </div>

              {/* Price */}
              <div className='flex items-center justify-between pt-2'>
                <span className='text-sm text-gray-600'>Harga</span>
                <span className='text-2xl font-bold text-red-500'>
                  Rp {bookingDetails.harga.toLocaleString('id-ID')} M
                </span>
              </div>

              {/* Booking Button */}
              <Button
                onClick={handleBooking}
                className='mt-6 h-12 w-full rounded-lg bg-green-500 text-base font-semibold text-white hover:bg-green-600'>
                Pesan
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Property Type Selection Form
  return (
    <div className='flex h-full w-full items-center justify-center p-2'>
      <div className='max-h-[80vh] w-full max-w-2xl overflow-auto'>
        {/* Header */}
        <div className='p-4 pb-3'>
          <div className='text-center'>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>Lorem Ipsum</h2>
            <p className='text-sm text-gray-600'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </div>
        </div>

        {/* Transaction Form Fields */}
        <div className='px-4 pb-4'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <div className='space-y-1'>
              <Label htmlFor='konsumen' className='text-sm'>
                Konsumen
              </Label>
              <Select
                options={safeKonsumenOptions}
                value={konsumenId}
                onChange={(value) => setValue('konsumen_id', value as string)}
                placeholder={isLoadingKonsumen ? 'Loading...' : 'Pilih Konsumen'}
                disabled={isLoadingKonsumen}
                className='h-10'
              />
              {errors.konsumen_id && <p className='text-xs text-red-500'>{errors.konsumen_id.message}</p>}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='properti' className='text-sm'>
                Properti
              </Label>
              <Select
                options={safePropertiOptions}
                value={propertiId}
                onChange={(value) => setValue('properti_id', value as string)}
                placeholder={isLoadingProperti ? 'Loading...' : 'Pilih Properti'}
                disabled={isLoadingProperti}
                className='h-10'
              />
              {errors.properti_id && <p className='text-xs text-red-500'>{errors.properti_id.message}</p>}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='blok' className='text-sm'>
                Blok
              </Label>
              <Select
                options={safeBlokOptions}
                value={blokId}
                onChange={(value) => setValue('blok_id', value as string)}
                placeholder={isLoadingBlok ? 'Loading...' : 'Pilih Blok'}
                disabled={isLoadingBlok}
                className='h-10'
              />
              {errors.blok_id && <p className='text-xs text-red-500'>{errors.blok_id.message}</p>}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='tipe' className='text-sm'>
                Tipe
              </Label>
              <Select
                options={safeTipeOptions}
                value={tipeId}
                onChange={(value) => setValue('tipe_id', value as string)}
                placeholder={isLoadingTipe ? 'Loading...' : 'Pilih Tipe'}
                disabled={isLoadingTipe}
                className='h-10'
              />
              {errors.tipe_id && <p className='text-xs text-red-500'>{errors.tipe_id.message}</p>}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='unit' className='text-sm'>
                Unit
              </Label>
              <Select
                options={safeUnitOptions}
                value={unitId}
                onChange={(value) => setValue('unit_id', value as string)}
                placeholder={isLoadingUnit ? 'Loading...' : 'Pilih Unit'}
                disabled={isLoadingUnit}
                className='h-10'
              />
              {errors.unit_id && <p className='text-xs text-red-500'>{errors.unit_id.message}</p>}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='diskon' className='text-sm'>
                Diskon (Opsional)
              </Label>
              <Input
                id='diskon'
                type='number'
                placeholder='0'
                {...register('diskon')}
                className='h-10 border-gray-300 focus:border-teal-500 focus:ring-teal-500'
              />
            </div>
          </div>
        </div>

        {/* Property Type Cards */}
        <div className='px-4 pb-4'>
          {isLoadingTipe ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {[1, 2].map((index) => (
                <div key={index} className='rounded-xl border-2 border-gray-200 bg-white p-4'>
                  <div className='mb-4 flex justify-center'>
                    <Skeleton className='h-12 w-12 rounded-lg' />
                  </div>
                  <Skeleton className='mx-auto mb-4 h-6 w-24' />
                  <div className='mb-4 space-y-2'>
                    <Skeleton className='h-3 w-full' />
                    <Skeleton className='h-3 w-full' />
                  </div>
                  <Skeleton className='h-10 w-full rounded-lg' />
                </div>
              ))}
            </div>
          ) : propertyTypes.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {propertyTypes.map((type) => (
                <div
                  key={type.id}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                    type.selected
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleTypeSelect(type.id)}>
                  {/* House Icon */}
                  <div className='mb-4 flex justify-center'>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        type.selected ? 'bg-teal-600' : 'bg-teal-600'
                      }`}>
                      <Home className='h-6 w-6 text-white' />
                    </div>
                  </div>

                  {/* Type Name */}
                  <h3 className='mb-4 text-center text-lg font-bold text-teal-700'>{type.name}</h3>

                  {/* Features */}
                  <div className='mb-4 space-y-2'>
                    {type.features.map((feature, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <div className='flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100'>
                          <Check className='h-2.5 w-2.5 text-green-600' />
                        </div>
                        <span className='text-xs text-gray-600'>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    className={`w-full rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${
                      type.selected
                        ? 'bg-green-500 text-white shadow-lg hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 hover:bg-gray-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeSelect(type.id);
                      handleChoose();
                    }}>
                    Pilih
                  </Button>

                  {/* Selection Indicator */}
                  {type.selected && (
                    <div className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500'>
                      <Check className='h-3 w-3 text-white' />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='py-4 text-center'>
              <p className='text-sm text-gray-500'>Tidak ada data tipe tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeModal;
