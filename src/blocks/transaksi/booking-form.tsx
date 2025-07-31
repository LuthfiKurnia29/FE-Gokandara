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
import { toast } from 'react-toastify';
import { z } from 'zod';

// Form validation schema
const bookingSchema = z.object({
  konsumen_id: z.string().min(1, 'Konsumen harus dipilih'),
  properti_id: z.string().min(1, 'Properti harus dipilih'),
  blok_id: z.string().min(1, 'Blok harus dipilih'),
  tipe_id: z.string().min(1, 'Tipe harus dipilih'),
  unit_id: z.string().min(1, 'Unit harus dipilih'),
  diskon: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true; // Allow empty
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
      },
      { message: 'Diskon harus antara 0-100%' }
    )
    .transform((value) => {
      // Transform empty string to undefined
      if (!value || value.trim() === '') return undefined;
      return value;
    })
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
  const [discountError, setDiscountError] = useState<string>('');

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
    // Ensure discount is between 0-100% with strict validation
    let rawDiscount = 0;
    if (diskon && diskon.trim() !== '') {
      const parsedDiscount = parseFloat(diskon);
      if (!isNaN(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 100) {
        rawDiscount = parsedDiscount;
      }
    }

    const discountPercent = Math.max(0, Math.min(100, rawDiscount));
    const discountAmount = (basePrice * discountPercent) / 100;
    const finalPrice = Math.max(basePrice - discountAmount, 0); // Ensure price doesn't go negative

    return {
      basePrice,
      discountAmount,
      finalPrice,
      discountPercent
    };
  };

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

  // Monitor discount value and ensure it's within bounds
  useEffect(() => {
    if (diskon && diskon.trim() !== '') {
      const numValue = parseFloat(diskon);
      if (!isNaN(numValue)) {
        if (numValue > 100) {
          setValue('diskon', '100');
          setDiscountError('Diskon maksimal 100%');
          toast.warning('Diskon telah dibatasi maksimal 100%');
        } else if (numValue < 0) {
          setValue('diskon', '0');
          setDiscountError('Diskon tidak boleh negatif');
        } else {
          setDiscountError(''); // Clear error if value is valid
        }
      } else {
        setDiscountError('Nilai tidak valid');
        setValue('diskon', ''); // Clear invalid value
      }
    } else {
      setDiscountError(''); // Clear error if empty
    }
  }, [diskon, setValue]);

  // Initialize discount validation on mount
  useEffect(() => {
    if (diskon && diskon.trim() !== '') {
      const numValue = parseFloat(diskon);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        setValue('diskon', '');
        setDiscountError('');
      } else {
        setDiscountError(''); // Clear any existing errors
      }
    } else {
      setDiscountError(''); // Clear error if empty
    }
  }, []); // Run only on mount

  const priceCalculation = calculateFinalPrice();

  // Helper function to handle discount input with strict validation
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear error state
    setDiscountError('');

    // Allow empty value
    if (value === '') {
      setValue('diskon', '');
      return;
    }

    // Check if value contains only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      setDiscountError('Hanya angka dan titik desimal yang diperbolehkan');
      return;
    }

    const numValue = parseFloat(value);

    // If not a valid number, don't update
    if (isNaN(numValue)) {
      setDiscountError('Nilai tidak valid');
      return;
    }

    // Prevent negative values
    if (numValue < 0) {
      e.target.value = '0';
      setValue('diskon', '0');
      setDiscountError('Diskon tidak boleh negatif');
      return;
    }

    // Strict cap at 100%
    if (numValue > 100) {
      e.target.value = '100';
      setValue('diskon', '100');
      setDiscountError('Diskon maksimal 100%');
      toast.warning('Diskon telah dibatasi maksimal 100%');
      return;
    }

    // Valid value, update form
    setValue('diskon', value);
    setDiscountError(''); // Clear any existing errors
  };

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
    // Validate discount with strict checking
    if (data.diskon && data.diskon.trim() !== '') {
      const discountValue = parseFloat(data.diskon);
      if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        setDiscountError('Diskon harus antara 0-100%');
        toast.error('Diskon harus antara 0-100%');
        return;
      }
    }

    // Clear any existing discount errors
    setDiscountError('');

    // Get validated discount
    const validatedDiscount =
      data.diskon && data.diskon.trim() !== ''
        ? (() => {
            const discountValue = parseFloat(data.diskon);
            return !isNaN(discountValue) && discountValue >= 0 && discountValue <= 100 ? data.diskon : '';
          })()
        : '';

    const submitData = {
      konsumen_id: parseInt(safeInitialData.konsumen_id), // Use from safeInitialData
      properti_id: parseInt(safeInitialData.properti_id), // Use from safeInitialData
      blok_id: data.blok_id ? parseInt(data.blok_id) : 1, // From user input
      tipe_id: parseInt(safeInitialData.tipe_id), // Use from safeInitialData
      unit_id: data.unit_id ? parseInt(data.unit_id) : 1, // From user input
      diskon: validatedDiscount ? parseFloat(validatedDiscount) : null, // Store as percentage only if valid
      status: 'Negotiation' as const // Set default status
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
            {/* Form Fields - Blok, Unit, and Discount */}
            <div className='grid grid-cols-3 gap-3'>
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
              <div>
                <Label htmlFor='diskon' className='mb-1 block text-sm font-medium text-gray-700'>
                  Diskon (Opsional)
                </Label>
                <div className='relative'>
                  <Input
                    id='diskon'
                    type='text'
                    inputMode='decimal'
                    placeholder='0'
                    value={diskon || ''}
                    className={`h-10 border-gray-300 pr-8 focus:border-teal-500 focus:ring-teal-500 ${
                      (diskon && parseFloat(diskon) > 100) || discountError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    onKeyDown={(e) => {
                      // Prevent invalid characters
                      const allowedKeys = [
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '9',
                        '.',
                        'Backspace',
                        'Delete',
                        'Tab',
                        'Enter',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown'
                      ];
                      if (!allowedKeys.includes(e.key)) {
                        e.preventDefault();
                        setDiscountError('Hanya angka dan titik desimal yang diperbolehkan');
                        return;
                      }

                      // Prevent multiple decimal points
                      if (e.key === '.' && e.currentTarget.value.includes('.')) {
                        e.preventDefault();
                        setDiscountError('Tidak boleh ada lebih dari satu titik desimal');
                        return;
                      }

                      // Prevent typing values over 100
                      const currentValue = e.currentTarget.value;
                      const selectionStart = e.currentTarget.selectionStart || 0;
                      const selectionEnd = e.currentTarget.selectionEnd || 0;
                      const newValue =
                        currentValue.substring(0, selectionStart) + e.key + currentValue.substring(selectionEnd);

                      if (newValue && newValue !== '.') {
                        const numValue = parseFloat(newValue);
                        if (!isNaN(numValue) && numValue > 100) {
                          e.preventDefault();
                          setDiscountError('Diskon tidak boleh lebih dari 100%');
                          toast.warning('Diskon tidak boleh lebih dari 100%');
                          return;
                        }
                      }
                    }}
                    onChange={handleDiscountChange}
                    onBlur={(e) => {
                      // Validate on blur
                      const value = e.target.value;
                      if (value && value.trim() !== '') {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue) || numValue < 0) {
                          e.target.value = '0';
                          setValue('diskon', '0');
                          setDiscountError('Diskon tidak boleh negatif');
                        } else if (numValue > 100) {
                          e.target.value = '100';
                          setValue('diskon', '100');
                          setDiscountError('Diskon maksimal 100%');
                          toast.warning('Diskon telah dibatasi maksimal 100%');
                        } else {
                          setDiscountError(''); // Clear error if valid
                        }
                      } else {
                        setDiscountError(''); // Clear error if empty
                      }
                    }}
                    onPaste={(e) => {
                      // Prevent pasting invalid values
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const numValue = parseFloat(pastedText);

                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                        setValue('diskon', pastedText);
                        setDiscountError(''); // Clear error
                      } else {
                        setDiscountError('Nilai yang di-paste tidak valid (0-100%)');
                        toast.warning('Nilai yang di-paste tidak valid (0-100%)');
                      }
                    }}
                  />
                  <span className='absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500'>%</span>
                </div>
                {errors.diskon && <p className='text-xs text-red-500'>{errors.diskon.message}</p>}
                {discountError && <p className='text-xs text-red-500'>{discountError}</p>}
                {diskon && parseFloat(diskon) > 100 && !discountError && (
                  <p className='text-xs text-red-500'>Nilai maksimal diskon adalah 100%</p>
                )}
                <p className='text-xs text-gray-500'>Maksimal: 100%</p>
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
              {priceCalculation.discountPercent === 0 && diskon && diskon.trim() !== '' && discountError && (
                <div className='mt-2 text-xs text-orange-500'>* Nilai diskon tidak valid, menggunakan 0%</div>
              )}
              {priceCalculation.discountPercent === 0 && (!diskon || diskon.trim() === '') && (
                <div className='mt-2 text-xs text-gray-500'>* Maksimal diskon 100%</div>
              )}
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
