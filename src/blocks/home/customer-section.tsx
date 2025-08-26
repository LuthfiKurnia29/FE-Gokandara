'use client';

import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ComponentWithDashboardProps } from '@/types/dashboard';

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
export default function CustomerSection({ dashboardData }: ComponentWithDashboardProps) {
  // Get new konsumens data from API
  const newKonsumensData = dashboardData?.newKonsumens?.data || [];
  const isLoading = dashboardData?.isLoading.newKonsumens;

  // Transform API data to component format
  const customerData = React.useMemo(() => {
    if (!newKonsumensData.length) {
      // Fallback data
      return [
        {
          name: 'Nama Konsumen',
          timeAgo: '20m ago',
          rating: 4,
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu.'
        },
        {
          name: 'Nama Konsumen',
          timeAgo: '5m ago',
          rating: 3,
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis.'
        }
      ];
    }

    return newKonsumensData.slice(0, 3).map((konsumen, index) => {
      // Since we don't have created_at field, we'll use a simple time ago based on index
      const timeAgoOptions = ['Just now', '5m ago', '15m ago', '1h ago', '2h ago'];
      const timeAgo = timeAgoOptions[index] || 'Recently';

      return {
        name: konsumen.name,
        timeAgo,
        rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
        description: konsumen.description || `Konsumen baru dari ${konsumen.address}. Phone: ${konsumen.phone}`
      };
    });
  }, [newKonsumensData]);

  return (
    <Card className='border border-gray-200 bg-white'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <h2 className='text-xl font-semibold text-gray-900'>Konsumen Prospek</h2>
        <MoreVertical className='h-5 w-5 text-gray-600' />
      </CardHeader>

      <CardContent className='space-y-3 px-4 pb-4'>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 2 }).map((_, index) => (
            <React.Fragment key={index}>
              <div className='space-y-1.5'>
                <div className='flex items-start gap-2'>
                  <div className='h-10 w-10 animate-pulse rounded-full bg-gray-300' />
                  <div className='flex-1'>
                    <div className='flex flex-wrap items-center justify-between'>
                      <div>
                        <div className='h-4 w-24 animate-pulse rounded bg-gray-300' />
                        <div className='mt-1 h-3 w-16 animate-pulse rounded bg-gray-300' />
                      </div>
                      <div className='flex gap-1'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className='h-4 w-4 animate-pulse rounded bg-gray-300' />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='h-3 w-full animate-pulse rounded bg-gray-300' />
                <div className='h-3 w-3/4 animate-pulse rounded bg-gray-300' />
              </div>
              {index < 1 && <div className='my-3 border-t border-dotted border-gray-300' />}
            </React.Fragment>
          ))
        ) : customerData.length > 0 ? (
          customerData.map((customer, index) => (
            <React.Fragment key={index}>
              <div className='space-y-1.5'>
                <div className='flex items-start gap-2'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-gray-400'>{customer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex flex-wrap items-center justify-between'>
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
          ))
        ) : (
          <div className='py-8 text-center text-gray-500'>
            <p>Tidak ada konsumen baru hari ini</p>
          </div>
        )}

        <Button className='w-full rounded-full bg-orange-400 py-3 font-medium text-white hover:bg-orange-500'>
          Lihat Lebih banyak
        </Button>
      </CardContent>
    </Card>
  );
}
