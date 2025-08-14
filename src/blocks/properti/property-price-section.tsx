'use client';

import { useState } from 'react';

import BookingForm from '@/blocks/transaksi/booking-form';
import PropertyTypeModal from '@/blocks/transaksi/form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreatePenjualan } from '@/services/penjualan';
import { CreatePenjualanData, UpdatePenjualanData } from '@/types/penjualan';
import { PropertyData } from '@/types/properti';

import { toast } from 'react-toastify';

interface PropertyPriceSectionProps {
  property?: PropertyData;
}

export const PropertyPriceSection = ({ property }: PropertyPriceSectionProps) => {
  const [open, setOpen] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const createPenjualan = useCreatePenjualan();
  const propertyPrice = property?.harga ? `Rp ${property.harga.toLocaleString('id-ID')}` : 'Harga tidak tersedia';
  const priceInMillion = property?.harga ? (property.harga / 1000000).toFixed(1) : '0';

  const handleProceedToBooking = (data: any) => {
    setFormData(data);
    setShowBookingForm(true);
  };

  const handleBackToTypeSelection = () => {
    setShowBookingForm(false);
  };

  const handleFormSubmit = async (data: CreatePenjualanData | UpdatePenjualanData) => {
    try {
      const submitData: CreatePenjualanData = {
        no_transaksi: Number((data as any).no_transaksi),
        konsumen_id: data.konsumen_id!,
        properti_id: data.properti_id!,
        blok_id: data.blok_id!,
        tipe_id: data.tipe_id!,
        unit_id: data.unit_id!,
        diskon: data.diskon ?? null,
        tipe_diskon: (data as any).tipe_diskon || 'percent',
        skema_pembayaran: (data as any).skema_pembayaran || 'Cash Keras',
        dp: (data as any).dp ?? null,
        jangka_waktu: (data as any).jangka_waktu ?? null,
        grand_total: (data as any).grand_total,
        status: 'Pending'
      };

      await createPenjualan.mutateAsync(submitData);
      toast.success('Data transaksi berhasil ditambahkan');
      setOpen(false);
      setShowBookingForm(false);
      setFormData(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Terjadi kesalahan saat menambahkan data');
    }
  };

  return (
    <div className='mt-8 px-4'>
      <h2 className='mb-4 text-[20px] font-bold text-[#0C0C0C]'>Harga</h2>

      <div className='mb-4 rounded-lg bg-[#2563EB] p-6 text-center text-white'>
        <p className='mb-1 text-sm opacity-90'>Harga</p>
        <p className='mb-1 text-2xl font-bold'>Rp {priceInMillion} M</p>
        <p className='text-sm opacity-90'>{propertyPrice}</p>
      </div>
      <Button
        onClick={() => setOpen(true)}
        className='h-12 w-full rounded-lg bg-[#FF8500] font-medium hover:bg-[#FF8500]/90'>
        Pemesanan
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setShowBookingForm(false);
            setFormData(null);
          }
        }}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Tambah Data Transaksi</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambahkan data transaksi baru ke dalam sistem.
            </DialogDescription>
          </DialogHeader>
          {!showBookingForm ? (
            <PropertyTypeModal
              onClose={() => setOpen(false)}
              selectedId={null}
              defaultPropertiId={property?.id ?? ''}
              onProceedToBooking={handleProceedToBooking}
            />
          ) : (
            formData && (
              <BookingForm
                initialData={formData}
                selectedId={selectedId}
                onBack={handleBackToTypeSelection}
                onSubmit={handleFormSubmit}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
