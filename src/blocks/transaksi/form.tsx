'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllBlok, useAllKonsumen, useAllProperti, useAllTipe, useAllUnit } from '@/services/penjualan';
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
  onProceedToBooking?: (formData: TransaksiFormData) => void;
}

const PropertyTypeModal = ({ onClose, selectedId, onSubmit, onProceedToBooking }: PropertyTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProperti, setSelectedProperti] = useState<any>(null);

  // Fetch master data from APIs
  const { data: konsumenOptions = [], isLoading: isLoadingKonsumen } = useAllKonsumen();
  const { data: propertiOptions = [], isLoading: isLoadingProperti } = useAllProperti();
  const { data: blokOptions = [], isLoading: isLoadingBlok } = useAllBlok();
  const { data: unitOptions = [], isLoading: isLoadingUnit } = useAllUnit();
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
      blok_id: '',
      tipe_id: '',
      unit_id: '',
      diskon: ''
    },
    mode: 'onChange'
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
    const discountPercent = parseFloat(diskon || '0') || 0;
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
    // Validate all required fields
    if (!konsumenId) {
      toast.error('Silakan pilih konsumen');
      return;
    }
    if (!propertiId) {
      toast.error('Silakan pilih properti');
      return;
    }
    if (!blokId) {
      toast.error('Silakan pilih blok');
      return;
    }
    if (!selectedType) {
      toast.error('Silakan pilih tipe terlebih dahulu');
      return;
    }
    if (!unitId) {
      toast.error('Silakan pilih unit');
      return;
    }

    console.log('Selected type:', selectedType);

    // Get current form data
    const formData = {
      konsumen_id: konsumenId,
      properti_id: propertiId,
      blok_id: blokId,
      tipe_id: tipeId,
      unit_id: unitId,
      diskon: diskon || '' // Store as percentage string
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
              <div className='relative'>
                <Input
                  id='diskon'
                  type='number'
                  placeholder='0'
                  {...register('diskon')}
                  className='h-10 border-gray-300 pr-8 focus:border-teal-500 focus:ring-teal-500'
                />
                <span className='absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500'>%</span>
              </div>
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
