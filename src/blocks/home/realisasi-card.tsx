'use client';

import * as React from 'react';

import { ComponentWithDashboardProps } from '@/types/dashboard';

const RealisasiCard = React.memo(({ dashboardData }: ComponentWithDashboardProps) => {
  return (
    <div className='w-full bg-white p-4'>
      <div className='mb-4'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>Realisasi</h1>
        <p className='text-sm leading-relaxed text-gray-500'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit psu olor
        </p>
      </div>

      <div className='space-y-4'>
        {/* Hari Ini */}
        <div>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Hari Ini</h3>
            <span className='text-sm text-gray-400'>00/00</span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div className='h-2 rounded-full bg-orange-400' style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Minggu Ini */}
        <div>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Minggu Ini</h3>
            <span className='text-sm text-gray-400'>00/00</span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div className='h-2 rounded-full bg-orange-400' style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Bulan Ini */}
        <div>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Bulan Ini</h3>
            <span className='text-sm text-gray-400'>00/00</span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div className='h-2 rounded-full bg-orange-400' style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
});

RealisasiCard.displayName = 'RealisasiCard';

export default RealisasiCard;
