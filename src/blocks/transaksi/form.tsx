import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { ArrowLeft, Check, Home, X } from 'lucide-react';

interface PropertyTypeModalProps {
  onClose?: () => void;
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

const PropertyTypeModal = ({ onClose }: PropertyTypeModalProps) => {
  const [selectedType, setSelectedType] = useState('Tipe 12');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [blok, setBlok] = useState<string>('A');
  const [unit, setUnit] = useState<string>('1');

  const propertyTypes = [
    {
      id: 'tipe12',
      name: 'Tipe 12',
      features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'],
      selected: true
    },
    {
      id: 'tipe16',
      name: 'Tipe 16',
      features: ['Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet'],
      selected: false
    }
  ];

  const handleTypeSelect = (typeName: string) => {
    setSelectedType(typeName);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChoose = () => {
    console.log('Selected type:', selectedType);
    setShowBookingForm(true);
  };

  const handleBack = () => {
    setShowBookingForm(false);
  };

  const handleBooking = () => {
    // Handle booking logic here
    console.log('Booking confirmed:', { blok, unit, selectedType });
    if (onClose) {
      onClose();
    }
  };

  // Mock data - replace with actual data from your form/API
  const bookingDetails: BookingDetails = {
    blok,
    unit,
    lbLt: '0m²/0m²',
    kelebihanTanah: '0m²',
    lokasi: 'Lorem Ipsum',
    harga: 0
  };

  // Booking Form
  if (showBookingForm) {
    return (
      <div className='flex h-full w-full items-center justify-center p-4'>
        <div className='w-full max-w-7xl'>
          {/* Back Button */}
          <Button variant='ghost' size='sm' onClick={handleBack} className='mb-6 p-0 hover:bg-transparent'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Kembali
          </Button>

          {/* Title */}
          <h1 className='mb-8 text-4xl font-bold text-gray-900'>Pemesanan</h1>

          <div className='grid gap-8 lg:grid-cols-2'>
            {/* Property Image */}
            <div className='overflow-hidden rounded-2xl bg-gray-300'>
              <div className='aspect-[4/3] w-full bg-gray-300' />
            </div>

            {/* Booking Details */}
            <div className='space-y-6'>
              {/* Blok and Unit Selection */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-2 block text-sm font-medium text-gray-700'>Blok</Label>
                  <Select
                    options={[
                      { value: 'A', label: 'A' },
                      { value: 'B', label: 'B' },
                      { value: 'C', label: 'C' },
                      { value: 'D', label: 'D' }
                    ]}
                    value={blok}
                    onChange={(value) => setBlok(value as string)}
                    placeholder='Pilih Blok'
                  />
                </div>
                <div>
                  <Label className='mb-2 block text-sm font-medium text-gray-700'>Unit</Label>
                  <Select
                    options={[
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                      { value: '4', label: '4' },
                      { value: '5', label: '5' }
                    ]}
                    value={unit}
                    onChange={(value) => setUnit(value as string)}
                    placeholder='Pilih Unit'
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-gray-200 pb-4'>
                  <span className='text-gray-600'>LB/LT</span>
                  <span className='text-right font-medium text-gray-900'>{bookingDetails.lbLt}</span>
                </div>
                <div className='flex items-center justify-between border-b border-gray-200 pb-4'>
                  <span className='text-gray-600'>Kelebihan Tanah</span>
                  <span className='text-right font-medium text-gray-900'>{bookingDetails.kelebihanTanah}</span>
                </div>
                <div className='flex items-center justify-between border-b border-gray-200 pb-4'>
                  <span className='text-gray-600'>Lokasi</span>
                  <span className='text-right font-medium text-gray-900'>{bookingDetails.lokasi}</span>
                </div>
              </div>

              {/* Price */}
              <div className='flex items-center justify-between pt-4'>
                <span className='text-gray-600'>Harga</span>
                <span className='text-3xl font-bold text-red-500'>
                  Rp {bookingDetails.harga.toLocaleString('id-ID')} M
                </span>
              </div>

              {/* Booking Button */}
              <Button
                onClick={handleBooking}
                className='mt-8 h-14 w-full rounded-full bg-green-500 text-lg font-semibold text-white hover:bg-green-600'>
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
    <div className='flex h-full w-full items-center justify-center p-4'>
      <div className='max-h-[90vh] w-full max-w-2xl overflow-auto'>
        {/* Header */}
        <div className='p-8 pb-6'>
          <div className='text-center'>
            <h2 className='mb-3 text-3xl font-bold text-gray-900'>Lorem Ipsum</h2>
            <p className='text-lg text-gray-600'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </div>
        </div>

        {/* Transaction Form Fields */}
        <div className='px-8 pb-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='orderId'>Order ID</Label>
              <Input id='orderId' placeholder='Masukkan Order ID' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tanggal'>Tanggal</Label>
              <DatePicker />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='konsumen'>Konsumen</Label>
              <Select
                options={[
                  { value: 'konsumen1', label: 'Konsumen 1' },
                  { value: 'konsumen2', label: 'Konsumen 2' }
                ]}
                placeholder='Pilih Konsumen'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='properti'>Properti</Label>
              <Select
                options={[
                  { value: 'properti1', label: 'Properti 1' },
                  { value: 'properti2', label: 'Properti 2' }
                ]}
                placeholder='Pilih Properti'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lokasi'>Lokasi</Label>
              <Input id='lokasi' placeholder='Masukkan Lokasi' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='harga'>Harga</Label>
              <Input id='harga' placeholder='Masukkan Harga' type='number' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='sales'>Sales</Label>
              <Select
                options={[
                  { value: 'sales1', label: 'Sales 1' },
                  { value: 'sales2', label: 'Sales 2' }
                ]}
                placeholder='Pilih Sales'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'negotiation', label: 'Negotiation' }
                ]}
                placeholder='Pilih Status'
              />
            </div>
          </div>
        </div>

        {/* Property Type Cards */}
        <div className='px-8 pb-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {propertyTypes.map((type) => (
              <div
                key={type.id}
                className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
                  selectedType === type.name
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleTypeSelect(type.name)}>
                {/* House Icon */}
                <div className='mb-6 flex justify-center'>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-lg ${
                      selectedType === type.name ? 'bg-teal-600' : 'bg-teal-600'
                    }`}>
                    <Home className='h-8 w-8 text-white' />
                  </div>
                </div>

                {/* Type Name */}
                <h3 className='mb-8 text-center text-2xl font-bold text-teal-700'>{type.name}</h3>

                {/* Features */}
                <div className='mb-8 space-y-4'>
                  {type.features.map((feature, index) => (
                    <div key={index} className='flex items-center gap-3'>
                      <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100'>
                        <Check className='h-3 w-3 text-green-600' />
                      </div>
                      <span className='text-gray-600'>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  className={`w-full rounded-xl py-4 font-semibold transition-all duration-300 ${
                    selectedType === type.name
                      ? 'bg-green-500 text-white shadow-lg hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 hover:bg-gray-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeSelect(type.name);
                    handleChoose();
                  }}>
                  Pilih
                </Button>

                {/* Selection Indicator */}
                {selectedType === type.name && (
                  <div className='absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500'>
                    <Check className='h-4 w-4 text-white' />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeModal;
