'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllKonsumen } from '@/services/konsumen';
import { useAllTipe, usePenjualanById } from '@/services/penjualan';
import { useAllProperti, usePropertyById } from '@/services/properti';
import { KonsumenData } from '@/types/konsumen';
import { CreatePenjualanData, UpdatePenjualanData } from '@/types/penjualan';
import { zodResolver } from '@hookform/resolvers/zod';

import { Check, Home } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const transaksiSchema = z.object({
  konsumen_id: z.string().min(1, 'Konsumen harus dipilih'),
  properti_id: z.string().min(1, 'Properti harus dipilih'),
  tipe_id: z.string().min(1, 'Tipe harus dipilih')
});

type TransaksiFormData = z.infer<typeof transaksiSchema> & {
  diskon?: string;
};

interface PropertyTypeModalProps {
  onClose?: () => void;
  selectedId?: number | null;
  onSubmit?: (data: CreatePenjualanData | UpdatePenjualanData) => Promise<void>;
  onProceedToBooking?: (formData: TransaksiFormData) => void;
  defaultPropertiId?: number | string;
}

const PropertyTypeModal = ({
  onClose,
  selectedId,
  onSubmit,
  onProceedToBooking,
  defaultPropertiId
}: PropertyTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProperti, setSelectedProperti] = useState<any>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const { data: konsumenOptions = [], isLoading: isLoadingKonsumen } = useAllKonsumen();
  const { data: propertiOptions = [], isLoading: isLoadingProperti } = useAllProperti();
  const { data: tipeOptions = [], isLoading: isLoadingTipe } = useAllTipe();

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
      konsumen_id: transactionData?.konsumen_id?.toString() || '',
      properti_id: transactionData?.properti_id?.toString() || '',
      tipe_id: transactionData?.tipe_id?.toString() || '',
      diskon: transactionData?.diskon?.toString() || ''
    },
    mode: 'onChange'
  });

  const konsumenId = watch('konsumen_id');
  const propertiId = watch('properti_id');
  const tipeId = watch('tipe_id');
  const isPropertiLocked = Boolean(defaultPropertiId);

  // Preselect property when invoked from property page
  useEffect(() => {
    if (defaultPropertiId && !propertiId) {
      setValue('properti_id', String(defaultPropertiId));
    }
  }, [defaultPropertiId, propertiId, setValue]);

  const safeKonsumenOptions = konsumenOptions.map((konsumen: KonsumenData) => ({
    value: konsumen.id.toString(),
    label: `#${konsumen.id} ${konsumen.name}`
  }));

  const safePropertiOptions = propertiOptions.map((properti) => ({
    value: properti.id?.toString() ?? '',
    label: `#${properti.id} ${properti.projek?.name} - ${properti.lokasi ?? 'Lokasi'}`
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

  // Function to find price from daftar_harga based on tipe_id and unit_id
  const findPriceFromDaftarHarga = (tipeId: string, unitId?: string) => {
    if (!propertyDetails?.daftar_harga || !tipeId) return null;

    const matchingPrice = propertyDetails.daftar_harga.find(
      (harga) => harga.tipe_id.toString() === tipeId && (!unitId || harga.unit_id.toString() === unitId)
    );

    return matchingPrice?.harga || null;
  };

  useEffect(() => {
    if (propertiId && propertiOptions.length > 0) {
      const properti = propertiOptions.find((p) => p.id?.toString() === propertiId);
      setSelectedProperti(properti);
      setSelectedPrice(null); // Reset price when property changes
    }
  }, [propertiId, propertiOptions]);

  useEffect(() => {
    if (transactionData && selectedId) {
      reset({
        konsumen_id: transactionData.konsumen_id?.toString() || '',
        properti_id: transactionData.properti_id?.toString() || '',
        tipe_id: transactionData.tipe_id?.toString() || '',
        diskon: transactionData.diskon?.toString() || ''
      });

      if (transactionData.tipe_id) {
        setSelectedType(transactionData.tipe_id.toString());
      }
    }
  }, [transactionData, selectedId, reset]);

  // Update price when tipe_id changes
  useEffect(() => {
    if (tipeId && propertyDetails) {
      const price = findPriceFromDaftarHarga(tipeId);
      setSelectedPrice(price);
    } else {
      setSelectedPrice(null);
    }
  }, [tipeId, propertyDetails]);

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
    if (!konsumenId) {
      toast.error('Silakan pilih konsumen');
      return;
    }
    if (!propertiId) {
      toast.error('Silakan pilih properti');
      return;
    }
    if (!selectedType && !typeId) {
      toast.error('Silakan pilih tipe terlebih dahulu');
      return;
    }

    const formData = {
      konsumen_id: konsumenId,
      properti_id: propertiId,
      tipe_id: typeId || tipeId,
      diskon: '',
      status: 'Negotiation' as const
    };

    if (onProceedToBooking) {
      onProceedToBooking(formData);
    }
  };

  const propertyTypes = tipeOptions.map((tipe) => {
    const price = findPriceFromDaftarHarga(tipe.id.toString());
    return {
      id: tipe.id.toString(),
      name: tipe.name,
      price: price,
      features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'],
      selected: selectedType === tipe.id.toString()
    };
  });

  if (selectedId && isLoadingTransaction) {
    return (
      <div className='flex h-full w-full items-center justify-center p-2'>
        <div className='max-h-[80vh] w-full max-w-2xl overflow-auto'>
          <div className='p-4 pb-3'>
            <div className='text-center'>
              <h2 className='mb-2 text-2xl font-bold text-gray-900'>Loading Transaction Data...</h2>
              <p className='text-sm text-gray-600'>Please wait while we fetch the transaction details</p>
            </div>
          </div>
          <div className='px-4 pb-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full items-center justify-center p-2'>
      <div className='max-h-[80vh] w-full max-w-2xl overflow-auto'>
        <div className='p-4 pb-3'>
          <div className='text-center'>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>
              {selectedId ? 'Edit Transaction' : 'Create Transaction'}
            </h2>
            <p className='text-sm text-gray-600'>
              {selectedId ? 'Edit transaction details below' : 'Create a new transaction below'}
            </p>
          </div>
        </div>

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
                onChange={(value) => {
                  if (isPropertiLocked) return;
                  setValue('properti_id', value as string);
                }}
                placeholder={isLoadingProperti ? 'Loading...' : 'Pilih Properti'}
                disabled={isLoadingProperti || isPropertiLocked}
                className='h-10'
              />
              {errors.properti_id && <p className='text-xs text-red-500'>{errors.properti_id.message}</p>}
            </div>
          </div>
        </div>

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
                  <div className='mb-4 flex justify-center'>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        type.selected ? 'bg-teal-600' : 'bg-teal-600'
                      }`}>
                      <Home className='h-6 w-6 text-white' />
                    </div>
                  </div>

                  <h3 className='mb-2 text-center text-lg font-bold text-teal-700'>{type.name}</h3>

                  {/* Price Display */}
                  <div className='mb-4 text-center'>
                    {!selectedProperti ? (
                      <div className='space-y-1'>
                        <p className='text-xs text-gray-500'>Harga</p>
                        <p className='text-sm font-medium text-gray-500'>Pilih properti terlebih dahulu</p>
                      </div>
                    ) : type.price ? (
                      <div className='space-y-1'>
                        <p className='text-xs text-gray-500'>Harga</p>
                        <p className='text-lg font-bold text-green-600'>{formatRupiah(type.price)}</p>
                      </div>
                    ) : (
                      <div className='space-y-1'>
                        <p className='text-xs text-gray-500'>Harga</p>
                        <p className='text-sm font-medium text-red-500'>Harga tidak tersedia atau belum diatur</p>
                      </div>
                    )}
                  </div>

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

                  <Button
                    className={`w-full rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${
                      type.selected
                        ? 'bg-green-500 text-white shadow-lg hover:bg-green-600'
                        : !selectedProperti
                          ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                          : type.price
                            ? 'bg-gray-300 text-gray-500 hover:bg-gray-400'
                            : 'cursor-not-allowed bg-gray-200 text-gray-400'
                    } hover:bg-green-600 hover:text-white hover:shadow-lg`}
                    disabled={!selectedProperti || !type.price}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedProperti && type.price) {
                        handleTypeSelect(type.id);
                        handleChoose(type.id);
                      }
                    }}>
                    {!selectedProperti ? 'Pilih Properti Dulu' : type.price ? 'Pilih' : 'Harga Tidak Tersedia'}
                  </Button>

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
