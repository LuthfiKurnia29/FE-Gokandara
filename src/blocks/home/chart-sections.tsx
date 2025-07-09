'use client';

import * as React from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

// Donut Progress Component (reused from metric-cards)
const MetricDonutProgress = React.memo(
  ({
    progress,
    color,
    size = 80,
    strokeWidth = 20
  }: {
    progress: number;
    color: string;
    size?: number;
    strokeWidth?: number;
  }) => {
    // Data untuk pie chart - progress dan background
    const chartData = React.useMemo(
      () => [
        { name: 'progress', value: progress, fill: 'rgba(255,255,255,1)' },
        { name: 'remaining', value: 100 - progress, fill: 'rgba(255,255,255,0.15)' }
      ],
      [progress]
    );

    // Chart config untuk Recharts
    const chartConfig = React.useMemo(
      () => ({
        progress: { label: 'Progress' },
        remaining: { label: 'Remaining' }
      }),
      []
    );

    // Calculate radii for donut
    const innerRadius = size / 2 - strokeWidth;
    const outerRadius = size / 2 - 4;

    return (
      <div className='relative' style={{ width: size, height: size }}>
        {/* Progress donut menggunakan Recharts */}
        <ChartContainer config={chartConfig} className='absolute inset-0 h-full rotate-x-180'>
          <PieChart width={size} height={size}>
            <Pie
              data={chartData}
              dataKey='value'
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={0}
              startAngle={-90}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    );
  }
);

// Ringkasan Section
export function RingkasanSection() {
  return (
    <Card className='border-gray-200 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-4'>
        <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
          Ringkasan
        </CardTitle>
        <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
      </CardHeader>
      <CardContent className='space-y-8 pt-0'>
        {/* Enhanced Circular Progress Indicators */}
        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-3 text-center'>
            <div className='relative mx-auto h-16 w-16'>
              <MetricDonutProgress progress={0} color='from-blue-500 to-blue-600' size={64} strokeWidth={4} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='font-sf-pro text-[18px] leading-[24px] font-bold tracking-[-0.02em] text-gray-900'>
                  00
                </span>
              </div>
            </div>
            <div className='space-y-1'>
              <p className='font-sf-pro text-[12px] leading-[16px] font-medium tracking-[-0.01em] text-gray-600'>
                Unit Terjual
              </p>
              <p className='font-sf-pro text-[12px] leading-[16px] font-semibold tracking-[-0.01em] text-red-500'>
                0.0%
              </p>
              <p className='font-sf-pro text-[11px] leading-[14px] font-normal tracking-[-0.01em] text-gray-400'>
                Target 00/bulan
              </p>
            </div>
          </div>

          <div className='space-y-3 text-center'>
            <div className='relative mx-auto h-16 w-16'>
              <MetricDonutProgress progress={0} color='from-green-500 to-green-600' size={64} strokeWidth={4} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='font-sf-pro text-[18px] leading-[24px] font-bold tracking-[-0.02em] text-gray-900'>
                  00
                </span>
              </div>
            </div>
            <div className='space-y-1'>
              <p className='font-sf-pro text-[12px] leading-[16px] font-medium tracking-[-0.01em] text-gray-600'>
                Unit Diproses
              </p>
              <p className='font-sf-pro text-[12px] leading-[16px] font-semibold tracking-[-0.01em] text-green-500'>
                0.0%
              </p>
              <p className='font-sf-pro text-[11px] leading-[14px] font-normal tracking-[-0.01em] text-gray-400'>
                Target 00/bulan
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Chart Area */}
        <div className='relative h-36 rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white'>
          <svg viewBox='0 0 300 100' className='h-full w-full p-4'>
            {/* Grid lines */}
            <defs>
              <pattern id='grid' width='30' height='20' patternUnits='userSpaceOnUse'>
                <path d='M 30 0 L 0 0 0 20' fill='none' stroke='#f3f4f6' strokeWidth='0.5' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />

            {/* Enhanced Chart lines */}
            <path
              d='M 0 80 Q 50 60 100 70 T 200 50 T 300 40'
              fill='none'
              stroke='#ef4444'
              strokeWidth='2.5'
              strokeLinecap='round'
            />
            <path
              d='M 0 90 Q 50 85 100 80 T 200 75 T 300 70'
              fill='none'
              stroke='#10b981'
              strokeWidth='2.5'
              strokeLinecap='round'
            />

            {/* Enhanced Fill areas */}
            <path d='M 0 80 Q 50 60 100 70 T 200 50 T 300 40 L 300 100 L 0 100 Z' fill='rgba(239, 68, 68, 0.08)' />
            <path d='M 0 90 Q 50 85 100 80 T 200 75 T 300 70 L 300 100 L 0 100 Z' fill='rgba(16, 185, 129, 0.08)' />
          </svg>

          {/* Enhanced Legend */}
          <div className='absolute top-3 left-3 space-y-2'>
            <div className='font-sf-pro flex items-center space-x-2 text-[12px] leading-[16px] font-medium tracking-[-0.01em]'>
              <div className='h-3 w-3 rounded-full bg-green-500' />
              <span className='text-gray-700'>00 Diproses</span>
            </div>
            <div className='font-sf-pro flex items-center space-x-2 text-[12px] leading-[16px] font-medium tracking-[-0.01em]'>
              <div className='h-3 w-3 rounded-full bg-red-500' />
              <span className='text-gray-700'>00 Terjual</span>
            </div>
          </div>
        </div>

        {/* Enhanced Month indicators */}
        <div className='font-sf-pro flex justify-between text-[12px] leading-[16px] font-normal tracking-[-0.01em] text-gray-500'>
          {['April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober'].map((month, index) => (
            <span key={month} className={index === 6 ? 'font-semibold text-gray-900' : ''}>
              {month}
            </span>
          ))}
          <span className='font-semibold text-gray-900'>November</span>
        </div>
      </CardContent>
    </Card>
  );
}
