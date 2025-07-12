'use client';

import { Button } from '@/components/ui/button';

import { Facebook, Instagram, Twitter } from 'lucide-react';

export const PropertyHeader = () => {
  return (
    <div className='px-4'>
      <h1 className='mb-1 text-center text-[24px] font-bold text-[#0C0C0C]'>HOONIAN</h1>
      <p className='text-center text-base font-medium text-[#09BD3C]'>Sigura-Gura</p>

      <p className='mt-4 text-center text-sm leading-[1.5] text-[#737B8B]'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>

      {/* Social Media Icons */}
      <div className='mt-6 flex justify-center gap-3'>
        <Button variant='ghost' size='icon' className='h-10 w-10 rounded-full bg-[#0C0C0C] p-0 hover:bg-[#0C0C0C]/90'>
          <Instagram className='h-[18px] w-[18px] text-white' />
        </Button>
        <Button variant='ghost' size='icon' className='h-10 w-10 rounded-full bg-[#0C0C0C] p-0 hover:bg-[#0C0C0C]/90'>
          <Facebook className='h-[18px] w-[18px] text-white' />
        </Button>
        <Button variant='ghost' size='icon' className='h-10 w-10 rounded-full bg-[#0C0C0C] p-0 hover:bg-[#0C0C0C]/90'>
          <Twitter className='h-[18px] w-[18px] text-white' />
        </Button>
      </div>
    </div>
  );
};
