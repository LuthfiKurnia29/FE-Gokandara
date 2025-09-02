'use client';

import { memo } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAnalisaNewKonsumen } from '@/services/analisa';
import { KonsumenData } from '@/types/konsumen';

import { MoreVertical, Plus } from 'lucide-react';

interface CustomerListComponentProps {
  filterParams?: { created_id?: number };
}

export const CustomerListComponent = memo(({ filterParams = {} }: CustomerListComponentProps) => {
  const { data: customerData, isLoading, error } = useAnalisaNewKonsumen(filterParams);

  // Show loading state
  if (isLoading) {
    return (
      <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between pb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Konsumen Terbaru</h2>
          <MoreVertical className='h-4 w-4 text-gray-600' />
        </CardHeader>
        <CardContent className='space-y-5 px-6 pb-6'>
          {[...Array(5)].map((_, index) => (
            <div key={index} className='flex items-center gap-4'>
              <div className='h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200' />
              <div className='min-w-0 flex-1'>
                <div className='mb-2 h-4 animate-pulse rounded bg-gray-200' />
                <div className='h-3 w-3/4 animate-pulse rounded bg-gray-200' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between pb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Konsumen Terbaru</h2>
          <MoreVertical className='h-4 w-4 text-gray-600' />
        </CardHeader>
        <CardContent className='px-6 pb-6'>
          <p className='py-4 text-center text-sm text-gray-500'>Gagal memuat data konsumen</p>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (!customerData || customerData.data.length === 0) {
    return (
      <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between pb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Konsumen Terbaru</h2>
          <MoreVertical className='h-4 w-4 text-gray-600' />
        </CardHeader>
        <CardContent className='px-6 pb-6'>
          <p className='py-4 text-center text-sm text-gray-500'>Belum ada data konsumen</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-4'>
        <h2 className='text-lg font-bold text-gray-900'>Konsumen Terbaru</h2>
        <MoreVertical className='h-4 w-4 text-gray-600' />
      </CardHeader>
      <CardContent className='space-y-5 px-6 pb-6'>
        {customerData.data.slice(0, 5).map((customer: KonsumenData, index: number) => (
          <div key={customer.id || index} className='flex items-center gap-4'>
            <Avatar className='h-12 w-12 flex-shrink-0'>
              <AvatarFallback className='bg-gray-400 text-base font-medium text-white'>
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <h3 className='mb-1 text-base font-semibold text-gray-900'>{customer.name}</h3>
              <p className='text-sm text-gray-500'>{customer.description || customer.address}</p>
            </div>
          </div>
        ))}

        {/* <Button className='mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-400 py-3 text-sm font-medium text-white hover:bg-orange-500'>
          <Plus className='h-4 w-4' />
          Tambah Data Konsumen
        </Button> */}
      </CardContent>
    </Card>
  );
});

CustomerListComponent.displayName = 'CustomerListComponent';
