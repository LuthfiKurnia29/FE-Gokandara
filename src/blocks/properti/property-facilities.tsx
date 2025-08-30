'use client';

import { PropertyData } from '@/types/properti';

import { Check } from 'lucide-react';

interface PropertyFacilitiesProps {
  property?: PropertyData;
}

export const PropertyFacilities = ({ property }: PropertyFacilitiesProps) => {
  const facilities = [
    'Kamar Tidur',
    'Kamar Mandi',
    'Dapur',
    'Ruang Tamu',
    'Garasi',
    'Halaman',
    'AC',
    'WiFi',
    'TV',
    'Lemari',
    'Meja',
    'Kursi',
    'Parkir',
    'Keamanan',
    'Kolam Renang'
  ];

  return (
    <section className='mb-8'>
      <h2 className='mb-4 text-2xl font-bold text-gray-800'>Fasilitas</h2>
      <div className='grid grid-cols-5 gap-4'>
        {property?.fasilitas?.map((facility, index) => (
          <div key={facility.nama_fasilitas} className='flex items-center gap-2'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500'>
              <Check className='h-3 w-3 text-white' />
            </div>
            <span className='text-sm text-gray-600'>{facility.nama_fasilitas}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
