'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useAllBlok, useAllKonsumen, useAllTipe, useAllUnit, usePenjualanById } from '@/services/penjualan';
import { useAllProperti, usePropertyById } from '@/services/properti';
import { CreatePenjualanData, UpdatePenjualanData } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeft, DollarSign, Percent } from 'lucide-react';
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
        return !isNaN(numValue) && numValue >= 0;
      },
      { message: 'Diskon harus berupa angka positif' }
    )
    .transform((value) => {
      // Transform empty string to undefined
      if (!value || value.trim() === '') return undefined;
      return value;
    }),
  tipe_diskon: z.enum(['percent', 'fixed']).optional()
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
  selectedId?: number | null;
  onBack: () => void;
  onSubmit: (data: CreatePenjualanData | UpdatePenjualanData) => Promise<void>;
}

const BookingForm = ({ initialData, selectedId, onBack, onSubmit }: BookingFormProps) => {
  const [selectedProperti, setSelectedProperti] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  // Fetch master data from APIs
  const { data: konsumenOptions = [], isLoading: isLoadingKonsumen } = useAllKonsumen();
  const { data: propertiOptions = [], isLoading: isLoadingProperti } = useAllProperti();
  const { data: blokOptions = [], isLoading: isLoadingBlok } = useAllBlok();
  const { data: unitOptions = [], isLoading: isLoadingUnit } = useAllUnit();
  const { data: tipeOptions = [], isLoading: isLoadingTipe } = useAllTipe();

  // Fetch transaction data by ID for editing
  const { data: transactionData, isLoading: isLoadingTransaction } = usePenjualanById(selectedId || null, [
    'konsumen',
    'properti',
    'blok',
    'tipe',
    'unit'
  ]);

  // Fetch property details when properti_id changes
  const { data: propertyDetails } = usePropertyById(selectedProperti?.id || null, [
    'projek',
    'properti_gambar',
    'daftar_harga'
  ]);

  // Function to find price from daftar_harga based on tipe_id and unit_id
  const findPriceFromDaftarHarga = (tipeId: string, unitId: string) => {
    if (!propertyDetails?.daftar_harga || !tipeId || !unitId) return null;

    const matchingPrice = propertyDetails.daftar_harga.find(
      (harga) => harga.tipe_id.toString() === tipeId && harga.unit_id.toString() === unitId
    );

    return matchingPrice?.harga || null;
  };

  // Ensure initialData is not null, prioritize user input over API data
  const safeInitialData = initialData || {
    konsumen_id: '',
    properti_id: '',
    blok_id: '',
    tipe_id: '',
    unit_id: '',
    diskon: '',
    tipe_diskon: 'percent' as const
  };

  // Helper function to format display value
  const getDisplayValue = (value: string) => {
    if (!value || value.trim() === '') return '';

    if (tipeDiskon === 'fixed') {
      const numValue = parseFloat(value.replace(/\./g, ''));
      if (!isNaN(numValue) && numValue > 0) {
        return formatRupiah(numValue).replace('Rp ', '');
      }
    }

    return value;
  };

  // Helper function to get raw value for calculations
  const getRawValue = (value: string) => {
    if (!value || value.trim() === '') return '';

    if (tipeDiskon === 'fixed') {
      return value.replace(/\./g, '');
    }

    return value;
  };

  // Calculate final price with discount
  const calculateFinalPrice = () => {
    if (!selectedPrice) {
      return {
        basePrice: 0,
        discountAmount: 0,
        finalPrice: 0,
        discountPercent: 0
      };
    }

    const basePrice = selectedPrice;
    let discountAmount = 0;
    let discountPercent = 0;

    if (diskon && diskon.trim() !== '') {
      const rawDiscountValue = getRawValue(diskon);
      const parsedDiscount = parseFloat(rawDiscountValue);
      if (!isNaN(parsedDiscount) && parsedDiscount >= 0) {
        if (tipeDiskon === 'percent') {
          // Percentage discount
          const maxPercent = Math.min(parsedDiscount, 100);
          discountPercent = maxPercent;
          discountAmount = (basePrice * maxPercent) / 100;
        } else if (tipeDiskon === 'fixed') {
          // Fixed amount discount - use the nominal value directly
          const maxFixed = Math.min(parsedDiscount, basePrice);
          discountAmount = maxFixed;
          discountPercent = (maxFixed / basePrice) * 100;
        }
      }
    }

    const finalPrice = Math.max(basePrice - discountAmount, 0);

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
    reset,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      ...safeInitialData,
      tipe_diskon: safeInitialData.tipe_diskon || 'percent' // Ensure default is set
    }
  });

  // Watch form values
  const konsumenId = watch('konsumen_id');
  const propertiId = watch('properti_id');
  const blokId = watch('blok_id');
  const tipeId = watch('tipe_id');
  const unitId = watch('unit_id');
  const diskon = watch('diskon');
  const tipeDiskon = watch('tipe_diskon') || 'percent';

  // Update selectedProperti when properti_id changes
  useEffect(() => {
    if (propertiId && propertiOptions.length > 0) {
      const properti = propertiOptions.find((p) => p.id?.toString() === propertiId);
      setSelectedProperti(properti);
      setSelectedPrice(null); // Reset price when property changes
    }
  }, [propertiId, propertiOptions]);

  // Update selectedPrice when tipe_id and unit_id change
  useEffect(() => {
    if (tipeId && unitId && propertyDetails) {
      const price = findPriceFromDaftarHarga(tipeId, unitId);
      setSelectedPrice(price);
    } else {
      setSelectedPrice(null);
    }
  }, [tipeId, unitId, propertyDetails]);

  // Monitor discount value and ensure it's within bounds
  useEffect(() => {
    if (diskon && diskon.trim() !== '') {
      const value = getRawValue(diskon);
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (tipeDiskon === 'percent' && numValue > 100) {
          setValue('diskon', '100');
          setDiscountError('Diskon maksimal 100%');
          toast.warning('Diskon telah dibatasi maksimal 100%');
        } else if (numValue < 0) {
          setValue('diskon', '0');
          setDiscountError('Diskon tidak boleh negatif');
        } else if (tipeDiskon === 'fixed' && selectedPrice && selectedPrice > 0 && numValue > selectedPrice) {
          setValue('diskon', selectedPrice.toString());
          setDiscountError('Diskon tidak boleh melebihi harga properti');
          toast.warning('Diskon telah dibatasi maksimal harga properti');
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
  }, [diskon, tipeDiskon, selectedPrice, setValue]);

  // Initialize discount validation on mount
  useEffect(() => {
    if (diskon && diskon.trim() !== '') {
      const value = getRawValue(diskon);
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
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

    // For fixed amount, remove formatting first
    let rawValue = value;
    if (tipeDiskon === 'fixed') {
      rawValue = value.replace(/\./g, ''); // Remove thousand separators
    }

    // Check if value contains only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(rawValue)) {
      setDiscountError('Hanya angka dan titik desimal yang diperbolehkan');
      return;
    }

    const numValue = parseFloat(rawValue);

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

    // Apply limits based on discount type
    if (tipeDiskon === 'percent' && numValue > 100) {
      e.target.value = '100';
      setValue('diskon', '100');
      setDiscountError('Diskon maksimal 100%');
      toast.warning('Diskon telah dibatasi maksimal 100%');
      return;
    }

    if (tipeDiskon === 'fixed' && selectedPrice && selectedPrice > 0 && numValue > selectedPrice) {
      e.target.value = selectedPrice.toString();
      setValue('diskon', selectedPrice.toString());
      setDiscountError('Diskon tidak boleh melebihi harga properti');
      toast.warning('Diskon telah dibatasi maksimal harga properti');
      return;
    }

    // Format value for display
    let displayValue = rawValue;
    if (tipeDiskon === 'fixed' && numValue > 0) {
      displayValue = formatRupiah(numValue).replace('Rp ', '');
    }

    // Valid value, update form
    setValue('diskon', displayValue);
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

  // Helper function to format currency consistently
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Update selectedProperti when properti_id changes
  useEffect(() => {
    if (selectedId && transactionData && !initialData) {
      // Only use API data if no user input is available (fallback for direct edit)
      reset({
        konsumen_id: transactionData.konsumen_id?.toString() || '',
        properti_id: transactionData.properti_id?.toString() || '',
        blok_id: transactionData.blok_id?.toString() || '',
        tipe_id: transactionData.tipe_id?.toString() || '',
        unit_id: transactionData.unit_id?.toString() || '',
        diskon: transactionData.diskon?.toString() || '',
        tipe_diskon: transactionData.tipe_diskon || 'percent'
      });

      // Update selected properti
      if (transactionData.properti_id && propertiOptions.length > 0) {
        const properti = propertiOptions.find((p) => p.id?.toString() === transactionData.properti_id?.toString());
        setSelectedProperti(properti);
      }
    } else if (initialData) {
      // Use user input data from previous form
      reset({
        konsumen_id: initialData.konsumen_id || '',
        properti_id: initialData.properti_id || '',
        blok_id: initialData.blok_id || '',
        tipe_id: initialData.tipe_id || '',
        unit_id: initialData.unit_id || '',
        diskon: initialData.diskon || '',
        tipe_diskon: initialData.tipe_diskon || 'percent'
      });

      // Update selected properti based on user input
      if (initialData.properti_id && propertiOptions.length > 0) {
        const properti = propertiOptions.find((p) => p.id?.toString() === initialData.properti_id);
        setSelectedProperti(properti);
      }
    }
  }, [transactionData, selectedId, initialData, reset, propertiOptions]);

  const handleFormSubmit = async (data: BookingFormData) => {
    // Validate discount with strict checking
    if (data.diskon && data.diskon.trim() !== '') {
      const rawDiscountValue = getRawValue(data.diskon);
      const discountValue = parseFloat(rawDiscountValue);
      if (isNaN(discountValue) || discountValue < 0) {
        setDiscountError('Diskon harus berupa angka positif');
        toast.error('Diskon harus berupa angka positif');
        return;
      }

      if (data.tipe_diskon === 'percent' && discountValue > 100) {
        setDiscountError('Diskon maksimal 100%');
        toast.error('Diskon maksimal 100%');
        return;
      }

      if (data.tipe_diskon === 'fixed' && selectedPrice && selectedPrice > 0 && discountValue > selectedPrice) {
        setDiscountError('Diskon tidak boleh melebihi harga properti');
        toast.error('Diskon tidak boleh melebihi harga properti');
        return;
      }
    }

    // Clear any existing discount errors
    setDiscountError('');

    // Get validated discount
    const validatedDiscount =
      data.diskon && data.diskon.trim() !== ''
        ? (() => {
            const rawValue = getRawValue(data.diskon);
            const discountValue = parseFloat(rawValue);
            return !isNaN(discountValue) && discountValue >= 0 ? rawValue : '';
          })()
        : '';

    const submitData = {
      // Use data from previous form (initialData) for fields not in this form
      konsumen_id: parseInt(safeInitialData.konsumen_id),
      properti_id: parseInt(safeInitialData.properti_id),
      tipe_id: parseInt(safeInitialData.tipe_id),
      // Use data from current form for fields that can be changed
      blok_id: data.blok_id ? parseInt(data.blok_id) : 1,
      unit_id: data.unit_id ? parseInt(data.unit_id) : 1,
      diskon: validatedDiscount ? parseFloat(validatedDiscount) : null,
      tipe_diskon: data.tipe_diskon || 'percent',
      // Keep existing status when editing, use default for new transactions
      status: selectedId && transactionData ? transactionData.status : 'Negotiation'
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

  // Show loading skeleton when fetching transaction data for editing
  if (selectedId && isLoadingTransaction) {
    return (
      <div className='flex h-full w-full items-center justify-center p-2'>
        <div className='w-full max-w-6xl'>
          <div className='text-center'>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>Loading Transaction Data...</h2>
            <p className='text-sm text-gray-600'>Please wait while we fetch the transaction details</p>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Discount Section - Full Width Below */}
            <div>
              <Label className='mb-1 block text-sm font-medium text-gray-700'>Diskon (Opsional)</Label>
              <div className='space-y-3'>
                {/* Discount Type Button Group */}
                <ButtonGroup
                  value={tipeDiskon}
                  onValueChange={(value) => {
                    if (value === 'fixed') {
                      setValue('tipe_diskon', 'fixed');
                    } else if (value === 'percent') {
                      setValue('tipe_diskon', 'percent');
                    } else {
                      setValue('tipe_diskon', 'percent'); // fallback
                    }

                    // Clear discount value when switching types to avoid confusion
                    setValue('diskon', '');
                    setDiscountError('');
                  }}
                  className='w-auto'>
                  <ButtonGroupItem value='percent' className='px-6'>
                    <Percent className='h-4 w-4' />
                    Persen
                  </ButtonGroupItem>
                  <ButtonGroupItem value='fixed' className='px-6'>
                    <DollarSign className='h-4 w-4' />
                    Nominal
                  </ButtonGroupItem>
                </ButtonGroup>

                {/* Discount Input */}
                <div className='relative w-full max-w-xs'>
                  <Input
                    id='diskon'
                    type='text'
                    inputMode='decimal'
                    placeholder={tipeDiskon === 'percent' ? '0' : '0'}
                    value={getDisplayValue(diskon || '')}
                    className={`h-10 border-gray-300 pr-8 focus:border-teal-500 focus:ring-teal-500 ${
                      discountError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
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

                      // For fixed amount, prevent decimal points
                      if (tipeDiskon === 'fixed' && e.key === '.') {
                        e.preventDefault();
                        setDiscountError('Nominal tidak boleh menggunakan desimal');
                        return;
                      }

                      // Prevent typing values over limits
                      const currentValue = e.currentTarget.value;
                      const selectionStart = e.currentTarget.selectionStart || 0;
                      const selectionEnd = e.currentTarget.selectionEnd || 0;
                      const newValue =
                        currentValue.substring(0, selectionStart) + e.key + currentValue.substring(selectionEnd);

                      if (newValue && newValue !== '.') {
                        const rawNewValue = tipeDiskon === 'fixed' ? newValue.replace(/\./g, '') : newValue;
                        const numValue = parseFloat(rawNewValue);
                        if (!isNaN(numValue)) {
                          if (tipeDiskon === 'percent' && numValue > 100) {
                            e.preventDefault();
                            setDiscountError('Diskon tidak boleh lebih dari 100%');
                            toast.warning('Diskon tidak boleh lebih dari 100%');
                            return;
                          }
                          // Only prevent if selectedPrice exists and is greater than 0
                          if (
                            tipeDiskon === 'fixed' &&
                            selectedPrice &&
                            selectedPrice > 0 &&
                            numValue > selectedPrice
                          ) {
                            e.preventDefault();
                            setDiscountError('Diskon tidak boleh melebihi harga properti');
                            toast.warning('Diskon telah dibatasi maksimal harga properti');
                            return;
                          }
                        }
                      }
                    }}
                    onChange={handleDiscountChange}
                    onBlur={(e) => {
                      // Validate on blur
                      const value = e.target.value;
                      if (value && value.trim() !== '') {
                        const rawValue = getRawValue(value);
                        const numValue = parseFloat(rawValue);
                        if (isNaN(numValue) || numValue < 0) {
                          e.target.value = '0';
                          setValue('diskon', '0');
                          setDiscountError('Diskon tidak boleh negatif');
                        } else if (tipeDiskon === 'percent' && numValue > 100) {
                          e.target.value = '100';
                          setValue('diskon', '100');
                          setDiscountError('Diskon maksimal 100%');
                          toast.warning('Diskon telah dibatasi maksimal 100%');
                        } else if (
                          tipeDiskon === 'fixed' &&
                          selectedPrice &&
                          selectedPrice > 0 &&
                          numValue > selectedPrice
                        ) {
                          const formattedValue = formatRupiah(selectedPrice).replace('Rp ', '');
                          e.target.value = formattedValue;
                          setValue('diskon', formattedValue);
                          setDiscountError('Diskon maksimal harga properti');
                          toast.warning('Diskon telah dibatasi maksimal harga properti');
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
                      const rawPastedText = tipeDiskon === 'fixed' ? pastedText.replace(/\./g, '') : pastedText;
                      const numValue = parseFloat(rawPastedText);

                      if (!isNaN(numValue) && numValue >= 0) {
                        if (tipeDiskon === 'percent' && numValue <= 100) {
                          setValue('diskon', pastedText);
                          setDiscountError(''); // Clear error
                        } else if (
                          tipeDiskon === 'fixed' &&
                          selectedPrice &&
                          selectedPrice > 0 &&
                          numValue <= selectedPrice
                        ) {
                          const formattedValue = formatRupiah(numValue).replace('Rp ', '');
                          setValue('diskon', formattedValue);
                          setDiscountError(''); // Clear error
                        } else {
                          setDiscountError(
                            `Nilai yang di-paste tidak valid (${tipeDiskon === 'percent' ? '0-100%' : '0-harga properti'})`
                          );
                          toast.warning(
                            `Nilai yang di-paste tidak valid (${tipeDiskon === 'percent' ? '0-100%' : '0-harga properti'})`
                          );
                        }
                      } else {
                        setDiscountError('Nilai yang di-paste tidak valid');
                        toast.warning('Nilai yang di-paste tidak valid');
                      }
                    }}
                  />
                  <span className='absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500'>
                    {tipeDiskon === 'percent' ? '%' : 'Rp'}
                  </span>
                </div>
                {errors.diskon && <p className='text-xs text-red-500'>{errors.diskon.message}</p>}
                {discountError && <p className='text-xs text-red-500'>{discountError}</p>}
                <p className='text-xs text-gray-500'>
                  Maksimal: {tipeDiskon === 'percent' ? '100%' : selectedPrice ? formatRupiah(selectedPrice) : 'Rp 0'}
                </p>
              </div>
            </div>

            {/* Transaction Details - Read Only */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Konsumen</span>
                <span className='text-right text-sm font-medium text-gray-900'>
                  {konsumenOptions.find(
                    (k) => k.id.toString() === (initialData?.konsumen_id || safeInitialData.konsumen_id)
                  )?.name || '-'}
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Properti</span>
                <span className='text-right text-sm font-medium text-gray-900'>
                  {propertiOptions.find(
                    (p) => p.id?.toString() === (initialData?.properti_id || safeInitialData.properti_id)
                  )?.lokasi || '-'}
                </span>
              </div>
              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Tipe</span>
                <span className='text-right text-sm font-medium text-gray-900'>
                  {tipeOptions?.find((t: any) => t.id.toString() === (initialData?.tipe_id || safeInitialData.tipe_id))
                    ?.name || '-'}
                </span>
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
              {/* Price Availability Message */}
              {!selectedProperti ? (
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
                  <p className='text-sm font-medium text-gray-600'>
                    ℹ️ Pilih properti terlebih dahulu untuk melihat harga
                  </p>
                </div>
              ) : !blokId || !unitId ? (
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                  <p className='text-sm font-medium text-blue-600'>
                    ℹ️ Silakan pilih blok dan unit untuk melihat harga
                  </p>
                </div>
              ) : !selectedPrice && tipeId && unitId ? (
                <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                  <p className='text-sm font-medium text-red-600'>
                    ⚠️ Harga tidak tersedia atau belum diatur untuk kombinasi Tipe dan Unit yang dipilih
                  </p>
                  <p className='mt-1 text-xs text-red-500'>
                    Silakan pilih kombinasi Tipe dan Unit lain, atau hubungi admin untuk mengatur harga
                  </p>
                </div>
              ) : null}

              <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                <span className='text-sm text-gray-600'>Harga Dasar</span>
                <span className='text-right text-sm font-medium text-gray-900'>
                  {!selectedProperti ? (
                    <span className='text-gray-500'>Pilih properti terlebih dahulu</span>
                  ) : !blokId || !unitId ? (
                    <span className='text-blue-600'>Silakan pilih blok dan unit</span>
                  ) : selectedPrice ? (
                    formatRupiah(priceCalculation.basePrice)
                  ) : (
                    <span className='text-red-500'>Harga tidak tersedia</span>
                  )}
                </span>
              </div>
              {priceCalculation.discountAmount > 0 && (
                <div className='flex items-center justify-between border-b border-gray-200 pb-2'>
                  <span className='text-sm text-gray-600'>
                    Diskon ({tipeDiskon === 'percent' ? `${priceCalculation.discountPercent.toFixed(1)}%` : 'Nominal'})
                  </span>
                  <span className='text-right text-sm font-medium text-red-600'>
                    -{formatRupiah(priceCalculation.discountAmount)}
                  </span>
                </div>
              )}
              <div className='flex items-center justify-between pt-2'>
                <span className='text-lg font-semibold text-gray-700'>Harga Akhir</span>
                <span className='text-2xl font-bold text-green-600'>
                  {!selectedProperti ? (
                    <span className='text-lg text-gray-500'>Pilih properti terlebih dahulu</span>
                  ) : !blokId || !unitId ? (
                    <span className='text-lg text-blue-600'>Silakan pilih blok dan unit</span>
                  ) : selectedPrice ? (
                    formatRupiah(priceCalculation.finalPrice)
                  ) : (
                    <span className='text-lg text-red-500'>Harga tidak tersedia</span>
                  )}
                </span>
              </div>
              {priceCalculation.discountAmount === 0 && diskon && diskon.trim() !== '' && discountError && (
                <div className='mt-2 text-xs text-orange-500'>* Nilai diskon tidak valid, menggunakan 0</div>
              )}
              {priceCalculation.discountAmount === 0 && (!diskon || diskon.trim() === '') && selectedPrice && (
                <div className='mt-2 text-xs text-gray-500'>
                  * Maksimal diskon {tipeDiskon === 'percent' ? '100%' : 'harga properti'}
                </div>
              )}
            </div>

            {/* Booking Button */}
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={!selectedProperti || !blokId || !unitId || !selectedPrice}
              className='mt-6 h-12 w-full rounded-lg bg-green-500 text-base font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500'>
              {!selectedProperti
                ? 'Pilih Properti Dulu'
                : !blokId || !unitId
                  ? 'Pilih Blok & Unit Dulu'
                  : selectedPrice
                    ? 'Pesan'
                    : 'Harga Tidak Tersedia'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
