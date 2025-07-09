'use client';

import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { MoreVertical, Star } from 'lucide-react';

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? 'fill-orange-400 text-orange-400' : 'fill-gray-300 text-gray-300'}`}
    />
  ));
};

// Main Customer Section
export default function CustomerSection() {
  const customerData = [
    {
      name: 'Nama Konsumen',
      timeAgo: '20m ago',
      rating: 4,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu. Pellentesque sagittis venenatis urna, nec varius risus interdum at. Sed vel lacus scelerisque eros mattis dignissim. Vivamus vel tellus accumsan velit eleifend mattis in porta libero. Nam quis mauris quis eros...'
    },
    {
      name: 'Nama Konsumen',
      timeAgo: '5m ago',
      rating: 3,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu. Pellentesque sagittis venenatis.....'
    }
  ];

  return (
    <Card className='border border-gray-200 bg-white'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <h2 className='text-xl font-semibold text-gray-900'>Konsumen Prospek</h2>
        <MoreVertical className='h-5 w-5 text-gray-600' />
      </CardHeader>

      <CardContent className='space-y-3 px-4 pb-4'>
        {customerData.map((customer, index) => (
          <React.Fragment key={index}>
            <div className='space-y-1.5'>
              <div className='flex items-start gap-2'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-gray-400'>{customer.name[0]}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-medium text-gray-900'>{customer.name}</h3>
                      <p className='text-sm text-gray-500'>{customer.timeAgo}</p>
                    </div>
                    <div className='flex gap-1'>{renderStars(customer.rating)}</div>
                  </div>
                </div>
              </div>

              <p className='text-sm leading-relaxed text-gray-700'>{customer.description}</p>
            </div>

            {index < customerData.length - 1 && <div className='my-3 border-t border-dotted border-gray-300' />}
          </React.Fragment>
        ))}

        <Button className='w-full rounded-full bg-orange-400 py-3 font-medium text-white hover:bg-orange-500'>
          Lihat Lebih banyak
        </Button>
      </CardContent>
    </Card>
  );
}
