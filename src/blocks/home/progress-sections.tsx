'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { MoreHorizontal } from 'lucide-react';

// Progress Bar Component
const ProgressBar = React.memo(
  ({ label, current, total, color }: { label: string; current: number; total: number; color: string }) => {
    const percentage = (current / total) * 100;

    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='font-sf-pro text-[14px] leading-[20px] font-medium tracking-[-0.01em] text-gray-700'>
            {label}
          </span>
          <span className='font-sf-pro text-[14px] leading-[20px] font-semibold tracking-[-0.01em] text-gray-900'>
            {current}/{total}
          </span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Realisasi Section
export function RealisasiSection() {
  const realisasiData = [
    { label: 'Hari Ini', current: 0, total: 100, color: 'bg-orange-400' },
    { label: 'Minggu Ini', current: 0, total: 100, color: 'bg-orange-400' },
    { label: 'Bulan Ini', current: 0, total: 100, color: 'bg-red-400' }
  ];

  return (
    <Card className='border-gray-200 shadow-sm'>
      <CardHeader className='pb-4'>
        <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
          Realisasi
        </CardTitle>
        <p className='font-sf-pro mt-1 text-[14px] leading-[20px] font-normal tracking-[-0.01em] text-gray-500'>
          Lorem ipsum dolor sit amet consectetur adipiscing elit psu dor
        </p>
      </CardHeader>
      <CardContent className='space-y-6 pt-0'>
        {realisasiData.map((item, index) => (
          <ProgressBar key={index} label={item.label} current={item.current} total={item.total} color={item.color} />
        ))}
      </CardContent>
    </Card>
  );
}

// Properti Section
export function PropertiSection() {
  const propertiData = [
    { name: 'HOONJAN Sigura-Gura', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'HOONJAN Bumi Palapa', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'HOONJAN Bunga Kosmea', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'HOONJAN Borobudur', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'RHUMA Arumba', progress: 0, total: 100, color: 'bg-green-400' }
  ];

  return (
    <Card className='border-gray-200 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-4'>
        <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
          Properti
        </CardTitle>
        <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
      </CardHeader>
      <CardContent className='space-y-6 pt-0'>
        {propertiData.map((item, index) => (
          <div key={index} className='space-y-3'>
            <div className='font-sf-pro flex items-center justify-between text-[14px] leading-[20px] font-normal tracking-[-0.01em]'>
              <span className='font-medium text-gray-700'>{item.name}</span>
              <span className='text-gray-500'>
                {item.progress}/{item.total} Unit
              </span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                style={{ width: `${(item.progress / item.total) * 100}%` }}
              />
            </div>
          </div>
        ))}

        {/* Enhanced Map Visualization */}
        <div className='relative mt-8 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'>
          <div className='absolute inset-0 opacity-60'>
            <svg viewBox='0 0 200 100' className='h-full w-full'>
              <circle cx='50' cy='30' r='8' fill='#10b981' className='drop-shadow-sm' />
              <text x='50' y='35' textAnchor='middle' className='font-sf-pro fill-white text-[10px] font-bold'>
                224
              </text>

              <circle cx='120' cy='25' r='6' fill='#6b7280' className='drop-shadow-sm' />
              <text x='120' y='29' textAnchor='middle' className='font-sf-pro fill-white text-[9px] font-bold'>
                532
              </text>

              <circle cx='160' cy='40' r='6' fill='#6b7280' className='drop-shadow-sm' />
              <text x='160' y='44' textAnchor='middle' className='font-sf-pro fill-white text-[9px] font-bold'>
                653
              </text>

              <circle cx='80' cy='60' r='5' fill='#6b7280' className='drop-shadow-sm' />
              <text x='80' y='64' textAnchor='middle' className='font-sf-pro fill-white text-[9px] font-bold'>
                567
              </text>

              <circle cx='30' cy='70' r='4' fill='#6b7280' className='drop-shadow-sm' />
              <text x='30' y='74' textAnchor='middle' className='font-sf-pro fill-white text-[8px] font-bold'>
                234
              </text>

              <circle cx='170' cy='75' r='4' fill='#6b7280' className='drop-shadow-sm' />
              <text x='170' y='79' textAnchor='middle' className='font-sf-pro fill-white text-[8px] font-bold'>
                234
              </text>
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
