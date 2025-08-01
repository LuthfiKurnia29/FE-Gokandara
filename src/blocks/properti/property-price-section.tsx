'use client';

import { Button } from '@/components/ui/button';
import { PropertyData } from '@/types/properti';

interface PropertyPriceSectionProps {
  property?: PropertyData;
}

export const PropertyPriceSection = ({ property }: PropertyPriceSectionProps) => {
  const propertyPrice = property?.harga ? `Rp ${property.harga.toLocaleString('id-ID')}` : 'Harga tidak tersedia';
  const priceInMillion = property?.harga ? (property.harga / 1000000).toFixed(1) : '0';

  return (
    <div className='mt-8 px-4'>
      <h2 className='mb-4 text-[20px] font-bold text-[#0C0C0C]'>Harga</h2>

      <div className='mb-4 rounded-lg bg-[#2563EB] p-6 text-center text-white'>
        <p className='mb-1 text-sm opacity-90'>Harga</p>
        <p className='mb-1 text-2xl font-bold'>Rp {priceInMillion} M</p>
        <p className='text-sm opacity-90'>{propertyPrice}</p>
      </div>

      <Button className='h-12 w-full rounded-lg bg-[#FF8500] font-medium hover:bg-[#FF8500]/90'>Pemesanan</Button>
    </div>
  );
};
