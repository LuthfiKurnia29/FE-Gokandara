'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PropertyData } from '@/types/properti';

import { Star } from 'lucide-react';

const SalesHistoryItem = ({
  name = 'Nama Konsumen',
  date = 'Tanggal',
  rating = 5
}: {
  name?: string;
  date?: string;
  rating?: number;
}) => {
  return (
    <div className='flex items-start gap-3'>
      <div className='flex flex-col items-center'>
        <Avatar className='h-10 w-10'>
          <AvatarFallback className='bg-[#C4C4C4]'></AvatarFallback>
        </Avatar>
        {rating !== 3 && <div className='mt-2 h-8 w-[1px] bg-[#E5E7EB]'></div>}
      </div>
      <div>
        <h3 className='text-sm font-medium text-[#0C0C0C]'>{name}</h3>
        <p className='mb-2 text-xs text-[#737B8B]'>{date}</p>
        <div className='flex gap-1'>
          {[...Array(rating)].map((_, index) => (
            <Star key={index} className='h-[14px] w-[14px] fill-[#FF8500] text-[#FF8500]' />
          ))}
          {[...Array(5 - rating)].map((_, index) => (
            <Star key={index} className='h-[14px] w-[14px] text-[#E5E7EB]' />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PropertySalesHistoryProps {
  property?: PropertyData;
}

export const PropertySalesHistory = ({ property }: PropertySalesHistoryProps) => {
  // Mock sales data - you can replace this with real API data later
  const salesData = [
    {
      name: 'Konsumen A',
      date: '2024-01-15',
      rating: 5
    },
    {
      name: 'Konsumen B',
      date: '2024-01-10',
      rating: 4
    },
    {
      name: 'Konsumen C',
      date: '2024-01-05',
      rating: 5
    }
  ];

  return (
    <div className='mt-8 px-4'>
      <h2 className='mb-6 text-[20px] font-bold text-[#0C0C0C]'>Histori Penjualan</h2>

      <div className='space-y-6'>
        {salesData.map((sale, index) => (
          <SalesHistoryItem key={index} name={sale.name} date={sale.date} rating={sale.rating} />
        ))}
      </div>
    </div>
  );
};
