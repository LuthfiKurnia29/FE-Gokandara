'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useAllBlok, useAllKonsumen, useAllUnit } from '@/services/penjualan';
import { useAllProperti } from '@/services/properti';
import { CreatePenjualanData, UpdatePenjualanData } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema
const bookingSchema = z.object({
  konsumen_id: z.string().min(1, 'Konsumen harus dipilih'),
  properti_id: z.string().min(1, 'Properti harus dipilih'),
  blok_id: z.string().min(1, 'Blok harus dipilih'),
  tipe_id: z.string().min(1, 'Tipe harus dipilih'),
  unit_id: z.string().min(1, 'Unit harus dipilih'),
  diskon: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingDetails {
  blok: string;
  unit: string;
  lbLt: string; // luas_bangunan/luas_tanah
  kelebihanTanah: string; // kelebihan
  lokasi: string;
  harga: number;
  propertyImage?: string;
}

interface BookingFormProps {
  initialData?: BookingFormData | null;
  onBack: () => void;
  onSubmit: (data: CreatePenjualanData | UpdatePenjualanData) => Promise<void>;
}

const BookingForm = ({ initialData, onBack, onSubmit }: BookingFormProps) => {
  const [selectedProperti, setSelectedProperti] = useState<any>(null);

  // Fetch master data from APIs
  const { data: konsumenOptions = [], isLoading: isLoadingKonsumen } = useAllKonsumen();
  const { data: propertiOptions = [], isLoading: isLoadingProperti } = useAllProperti();
  const { data: blokOptions = [], isLoading: isLoadingBlok } = useAllBlok();
  const { data: unitOptions = [], isLoading: isLoadingUnit } = useAllUnit();

  // Ensure initialData is not null
  const safeInitialData = initialData || {
    konsumen_id: '',
    properti_id: '',
    blok_id: '',
    tipe_id: '',
    unit_id: '',
    diskon: ''
  };

  // Calculate final price with discount
  const calculateFinalPrice = () => {
    if (!selectedProperti?.harga) {
      return {
        basePrice: 0,
        discountAmount: 0,
        finalPrice: 0,
        discountPercent: 0
      };
    }

    const basePrice = selectedProperti.harga;
    const discountPercent = parseFloat(safeInitialData.diskon || '0') || 0;
    const discountAmount = (basePrice * discountPercent) / 100;
    const finalPrice = basePrice - discountAmount;

    return {
      basePrice,
      discountAmount,
      finalPrice,
      discountPercent
    };
  };

  const priceCalculation = calculateFinalPrice();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: safeInitialData
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
    value: properti.id?.toString() ?? '',
    label: `${properti.lokasi ?? 'Lokasi'} - ${properti.id ?? 'ID'}`
  }));

  const safeBlokOptions = blokOptions.map((blok) => ({
    value: blok.id.toString(),
    label: blok.name
  }));

  const safeUnitOptions = unitOptions.map((unit) => ({
    value: unit.id.toString(),
    label: unit.name
  }));

  // Update selected properti when properti_id changes
  useEffect(() => {
    if (propertiId && propertiOptions.length > 0) {
      const properti = propertiOptions.find((p) => p.id?.toString() === propertiId);
      setSelectedProperti(properti);

      // Note: blok_id, tipe_id, unit_id are not available in API response
      // These fields need to be selected manually by user
    }
  }, [propertiId, propertiOptions]);

  const handleFormSubmit = async (data: BookingFormData) => {
    const submitData = {
      konsumen_id: parseInt(safeInitialData.konsumen_id), // Use from safeInitialData
      properti_id: parseInt(safeInitialData.properti_id), // Use from safeInitialData
      blok_id: data.blok_id ? parseInt(data.blok_id) : 1, // From user input
      tipe_id: parseInt(safeInitialData.tipe_id), // Use from safeInitialData
      unit_id: data.unit_id ? parseInt(data.unit_id) : 1, // From user input
      diskon: safeInitialData.diskon ? parseFloat(safeInitialData.diskon) : null // Store as percentage
    };

    await onSubmit(submitData);
  };

  // Booking details from selected property
  const bookingDetails: BookingDetails = {
    blok: blokOptions.find((b) => b.id.toString() === blokId)?.name || 'A',
    unit: unitOptions.find((u) => u.id.toString() === unitId)?.name || '1',
    lbLt: selectedProperti ? `${selectedProperti.luas_bangunan}/${selectedProperti.luas_tanah}` : '0m²/0m²',
    kelebihanTanah: selectedProperti?.kelebihan || '0m²',
    lokasi: selectedProperti?.lokasi || 'Lorem Ipsum',
    harga: selectedProperti?.harga || 0
  };

  return (
    <div className='flex h-full w-full items-center justify-center p-2'>
      <div className='w-full max-w-6xl'>
        {/* Back Button */}
        <Button variant='ghost' size='sm' onClick={onBack} className='mb-4 p-0 hover:bg-transparent'>
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
            {/* Form Fields - Only Blok and Unit */}
            <div className='grid grid-cols-2 gap-3'>
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
            </div>

            {/* Property Details - Read Only */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>LB/LT</span>
                <span className='text-right text-sm font-medium text-gray-900'>{bookingDetails.lbLt}</span>
              </div>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Kelebihan</span>
                <span className='text-right text-sm font-medium text-gray-900'>{bookingDetails.kelebihanTanah}</span>
              </div>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Lokasi</span>
                <span className='text-right text-sm font-medium text-gray-900'>{bookingDetails.lokasi}</span>
              </div>
            </div>

            {/* Price */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Harga Dasar</span>
                <span className='text-right text-sm font-medium text-gray-900'>
                  Rp {priceCalculation.basePrice.toLocaleString('id-ID')}
                </span>
              </div>
              {priceCalculation.discountPercent > 0 && (
                <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                  <span className='text-sm text-gray-600'>Diskon ({priceCalculation.discountPercent}%)</span>
                  <span className='text-right text-sm font-medium text-red-600'>
                    -Rp {priceCalculation.discountAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className='flex items-center justify-between pt-2'>
                <span className='text-lg font-semibold text-gray-700'>Harga Akhir</span>
                <span className='text-2xl font-bold text-green-600'>
                  Rp {priceCalculation.finalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Booking Button */}
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              className='mt-6 h-12 w-full rounded-lg bg-green-500 text-base font-semibold text-white hover:bg-green-600'>
              Pesan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
