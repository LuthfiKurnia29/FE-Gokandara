'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllKonsumen, useAllTipe } from '@/services/penjualan';
import { useAllProperti } from '@/services/properti';
import { CreatePenjualanData, UpdatePenjualanData } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { Check, Home } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Form validation schema sesuai dengan Laravel controller validation
const transaksiSchema = z.object({
  konsumen_id: z.string().min(1, 'Konsumen harus dipilih'),
  properti_id: z.string().min(1, 'Properti harus dipilih'),
  tipe_id: z.string().min(1, 'Tipe harus dipilih'),
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

type TransaksiFormData = z.infer<typeof transaksiSchema>;

interface PropertyTypeModalProps {
  onClose?: () => void;
  selectedId?: number | null;
  onSubmit?: (data: CreatePenjualanData | UpdatePenjualanData) => Promise<void>;
  onProceedToBooking?: (formData: TransaksiFormData) => void;
}

const PropertyTypeModal = ({ onClose, selectedId, onSubmit, onProceedToBooking }: PropertyTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProperti, setSelectedProperti] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string>('');

  // Fetch master data from APIs
  const { data: konsumenOptions = [], isLoading: isLoadingKonsumen } = useAllKonsumen();
  const { data: propertiOptions = [], isLoading: isLoadingProperti } = useAllProperti();
  const { data: tipeOptions = [], isLoading: isLoadingTipe } = useAllTipe();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<TransaksiFormData>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      konsumen_id: '',
      properti_id: '',
      tipe_id: '',
      diskon: ''
    },
    mode: 'onChange'
  });

  // Watch form values
  const konsumenId = watch('konsumen_id');
  const propertiId = watch('properti_id');
  const tipeId = watch('tipe_id');
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

  // Safe option mapping
  const safeKonsumenOptions = konsumenOptions.map((konsumen) => ({
    value: konsumen.id.toString(),
    label: konsumen.name
  }));

  const safePropertiOptions = propertiOptions.map((properti) => ({
    value: properti.id?.toString() ?? '',
    label: `#${properti.id} ${properti.projek?.name} - ${properti.lokasi ?? 'Lokasi'}`
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

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setValue('tipe_id', typeId);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChoose = (typeId: string) => {
    // Validate all required fields
    if (!konsumenId) {
      toast.error('Silakan pilih konsumen');
      return;
    }
    if (!propertiId) {
      toast.error('Silakan pilih properti');
      return;
    }
    // if (!blokId) {
    //   toast.error('Silakan pilih blok');
    //   return;
    // }
    if (!selectedType && !typeId) {
      toast.error('Silakan pilih tipe terlebih dahulu');
      return;
    }
    // if (!unitId) {
    //   toast.error('Silakan pilih unit');
    //   return;
    // }

    // Validate discount with strict checking
    if (diskon && diskon.trim() !== '') {
      const discountValue = parseFloat(diskon);
      if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        setDiscountError('Diskon harus antara 0-100%');
        toast.error('Diskon harus antara 0-100%');
        return;
      }
    }

    // Clear any existing discount errors
    setDiscountError('');

    // Get current form data with validated discount
    const validatedDiscount =
      diskon && diskon.trim() !== ''
        ? (() => {
            const discountValue = parseFloat(diskon);
            return !isNaN(discountValue) && discountValue >= 0 && discountValue <= 100 ? diskon : '';
          })()
        : '';

    const formData = {
      konsumen_id: konsumenId,
      properti_id: propertiId,
      tipe_id: typeId || tipeId,
      diskon: validatedDiscount // Store as percentage string only if valid
    };

    if (onProceedToBooking) {
      onProceedToBooking(formData);
    }
  };

  // Dynamic property types based on actual tipe data
  const propertyTypes = tipeOptions.map((tipe) => ({
    id: tipe.id.toString(),
    name: tipe.name,
    features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'],
    selected: selectedType === tipe.id.toString()
  }));

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
            {/* <div className='space-y-1'>
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
            </div> */}
            <div className='space-y-1'>
              <Label htmlFor='diskon' className='text-sm'>
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

          {/* Price Calculation Display */}
          {selectedProperti?.harga && (
            <div className='mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <h4 className='mb-3 text-sm font-semibold text-gray-700'>Kalkulasi Harga</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Harga Dasar:</span>
                  <span className='font-medium'>Rp {priceCalculation.basePrice.toLocaleString('id-ID')}</span>
                </div>
                {priceCalculation.discountPercent > 0 && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Diskon ({priceCalculation.discountPercent}%):</span>
                      <span className='font-medium text-red-600'>
                        -Rp {priceCalculation.discountAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className='border-t border-gray-200 pt-2'>
                      <div className='flex justify-between'>
                        <span className='font-semibold text-gray-700'>Harga Akhir:</span>
                        <span className='text-lg font-bold text-green-600'>
                          Rp {priceCalculation.finalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {priceCalculation.discountPercent === 0 && diskon && diskon.trim() !== '' && discountError && (
                  <div className='mt-2 text-xs text-orange-500'>* Nilai diskon tidak valid, menggunakan 0%</div>
                )}
                {priceCalculation.discountPercent === 0 && (!diskon || diskon.trim() === '') && (
                  <div className='mt-2 text-xs text-gray-500'>* Maksimal diskon 100%</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Property Type Cards */}
        <div className='px-4 pb-4'>
          {isLoadingTipe ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {[1, 2, 3].map((index) => (
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
                    } hover:bg-green-600 hover:text-white hover:shadow-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTypeSelect(type.id);
                      handleChoose(type.id);
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
