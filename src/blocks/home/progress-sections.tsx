'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { MoreHorizontal } from 'lucide-react';

// Progress Bar Component
const ProgressBar = React.memo(
  ({
    label,
    current,
    total,
    color,
    showUnit = false,
    width = '100%',
    barHeight = 'h-2'
  }: {
    label: string;
    current: number;
    total: number;
    color: string;
    showUnit?: boolean;
    width?: string;
    barHeight?: string;
  }) => {
    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-[15px] font-medium text-gray-700'>{label}</span>
          <span className='text-[15px] font-medium text-gray-500'>
            {current}/{total}
            {showUnit ? ' Unit' : ''}
          </span>
        </div>
        <div className={`w-full overflow-hidden rounded-full bg-gray-100 ${barHeight}`}>
          <div className={`h-full rounded-full transition-all duration-300 ease-out ${color}`} style={{ width }} />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Properti Section
export function PropertiSection() {
  const propertiData = [
    { label: 'HOONIAN Sigura-Gura', current: 0, total: 0, color: 'bg-red-400', width: '100%' },
    { label: 'HOONIAN Bumi Palapa', current: 0, total: 0, color: 'bg-red-400', width: '30%' },
    { label: 'HOONIAN Bunga Kosmea', current: 0, total: 0, color: 'bg-red-400', width: '25%' },
    { label: 'HOONIAN Borobudur', current: 0, total: 0, color: 'bg-red-400', width: '40%' },
    { label: 'RHUMA Arumba', current: 0, total: 0, color: 'bg-green-400', width: '100%' }
  ];

  return (
    <Card className='w-full border-gray-200 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-lg font-semibold text-gray-900'>Properti</CardTitle>
        <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
      </CardHeader>
      <CardContent className='space-y-4 pt-2'>
        {propertiData.map((item, index) => (
          <ProgressBar key={index} {...item} showUnit />
        ))}

        {/* Map Visualization */}
        <div className='relative mt-6 h-[180px] overflow-hidden rounded-lg bg-gray-50'>
          <div className='absolute inset-0'>
            <svg viewBox='0 0 400 200' className='h-full w-full opacity-70'>
              {/* Dots pattern for world map */}
              <pattern id='dots' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
                <circle cx='2' cy='2' r='1' fill='#d1d5db' />
              </pattern>
              <rect width='100%' height='100%' fill='url(#dots)' />

              {/* Active region */}
              <circle cx='200' cy='100' r='40' fill='#10b981' fillOpacity='0.2' />
              <circle cx='200' cy='100' r='30' fill='#10b981' fillOpacity='0.3' />
              <circle cx='200' cy='100' r='20' fill='#10b981' fillOpacity='0.4' />

              {/* Data points */}
              <g className='drop-shadow-sm'>
                <circle cx='200' cy='100' r='15' fill='#10b981' />
                <text x='200' y='105' textAnchor='middle' fill='white' className='text-xs font-bold'>
                  224
                </text>
              </g>

              <g className='drop-shadow-sm'>
                <circle cx='100' cy='80' r='12' fill='#6b7280' fillOpacity='0.8' />
                <text x='100' y='84' textAnchor='middle' fill='white' className='text-[10px] font-bold'>
                  532
                </text>
              </g>

              <g className='drop-shadow-sm'>
                <circle cx='300' cy='90' r='12' fill='#6b7280' fillOpacity='0.8' />
                <text x='300' y='94' textAnchor='middle' fill='white' className='text-[10px] font-bold'>
                  653
                </text>
              </g>

              <g className='drop-shadow-sm'>
                <circle cx='150' cy='150' r='10' fill='#6b7280' fillOpacity='0.8' />
                <text x='150' y='153' textAnchor='middle' fill='white' className='text-[9px] font-bold'>
                  567
                </text>
              </g>

              <g className='drop-shadow-sm'>
                <circle cx='250' cy='140' r='10' fill='#6b7280' fillOpacity='0.8' />
                <text x='250' y='143' textAnchor='middle' fill='white' className='text-[9px] font-bold'>
                  234
                </text>
              </g>
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
