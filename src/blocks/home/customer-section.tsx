'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { MoreHorizontal, Star } from 'lucide-react';

// Customer Card Component
const CustomerCard = React.memo(
  ({ name, timeAgo, rating, description }: { name: string; timeAgo: string; rating: number; description: string }) => (
    <div className='flex space-x-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm'>
      <Avatar className='h-10 w-10 flex-shrink-0'>
        <AvatarImage src='/placeholder.svg?height=40&width=40' />
        <AvatarFallback className='font-sf-pro bg-gray-100 text-[14px] leading-[20px] font-semibold tracking-[-0.01em] text-gray-600'>
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1 space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='font-sf-pro truncate text-[16px] leading-[24px] font-semibold tracking-[-0.01em] text-gray-900'>
            {name}
          </h4>
          <span className='font-sf-pro ml-2 flex-shrink-0 text-[12px] leading-[16px] font-normal tracking-[-0.01em] text-gray-500'>
            {timeAgo}
          </span>
        </div>
        <div className='flex items-center space-x-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <p className='font-sf-pro line-clamp-3 text-[14px] leading-[20px] font-normal tracking-[-0.01em] text-gray-600'>
          {description}
        </p>
      </div>
    </div>
  )
);

CustomerCard.displayName = 'CustomerCard';

// Main Customer Section
export default function CustomerSection() {
  const customerData = [
    {
      name: 'Nama Konsumen',
      timeAgo: '2m ago',
      rating: 4,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu. Pellentesque sagittis venenatis urna, nec scelerisque eros mattis dignissim. Vivamus vel tellus accumsan velit eleifend mattis in porta libero. Nam quis mauris quis eros...'
    },
    {
      name: 'Nama Konsumen',
      timeAgo: '5m ago',
      rating: 5,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu. Pellentesque sagittis venenatis...'
    }
  ];

  return (
    <Card className='border-gray-200 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-6'>
        <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
          Konsumen Prospek
        </CardTitle>
        <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {customerData.map((customer, index) => (
            <CustomerCard
              key={index}
              name={customer.name}
              timeAgo={customer.timeAgo}
              rating={customer.rating}
              description={customer.description}
            />
          ))}
        </div>
        <Button className='font-sf-pro h-12 w-full rounded-lg bg-orange-500 text-[16px] leading-[24px] font-semibold tracking-[-0.01em] shadow-sm transition-colors hover:bg-orange-600'>
          Lihat Lebih Banyak
        </Button>
      </CardContent>
    </Card>
  );
}
