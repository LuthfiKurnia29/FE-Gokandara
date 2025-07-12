'use client';

import { Button } from '@/components/ui/button';

export const PropertyPriceSection = () => {
  return (
    <div className='mt-8 px-4'>
      <h2 className='mb-4 text-[20px] font-bold text-[#0C0C0C]'>Harga</h2>

      <div className='mb-4 rounded-lg bg-[#2563EB] p-6 text-center text-white'>
        <p className='mb-1 text-sm opacity-90'>Harga mulai</p>
        <p className='mb-1 text-2xl font-bold'>Rp 0,00 M</p>
        <p className='text-sm opacity-90'>sampai Rp 0,00 M</p>
      </div>

      <Button className='h-12 w-full rounded-lg bg-[#FF8500] font-medium hover:bg-[#FF8500]/90'>Pemesanan</Button>
    </div>
  );
};
