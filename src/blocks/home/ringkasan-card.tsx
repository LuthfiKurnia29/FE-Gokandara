'use client';

import { Card, CardContent } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { Building2, MoreVertical, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { month: 'April', terjual: 45, dipesan: 20 },
  { month: 'Mei', terjual: 35, dipesan: 25 },
  { month: 'Juni', terjual: 40, dipesan: 30 },
  { month: 'Juli', terjual: 25, dipesan: 22 },
  { month: 'Agustus', terjual: 65, dipesan: 35 },
  { month: 'September', terjual: 15, dipesan: 28 },
  { month: 'Oktober', terjual: 45, dipesan: 40 },
  { month: 'November', terjual: 35, dipesan: 32 }
];

const chartConfig = {
  terjual: {
    label: '00 Terjual',
    color: '#ef4444'
  },
  dipesan: {
    label: '00 Dipesan',
    color: '#22c55e'
  }
} satisfies ChartConfig;

export default function RingkasanCard() {
  return (
    <Card className='w-full border-gray-200 shadow-sm'>
      <CardContent className='space-y-4 p-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Ringkasan</h2>
          <button className='rounded-lg p-2 hover:bg-gray-100'>
            <MoreVertical className='h-5 w-5 text-gray-600' />
          </button>
        </div>

        {/* Metrics Cards */}
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          {/* Total Terjual Card */}
          <div className='rounded-2xl border bg-white p-4 shadow-sm'>
            <div className='flex items-start gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-red-200 bg-red-50'>
                <Building2 className='h-8 w-8 text-red-500' />
              </div>
              <div>
                <p className='mb-1 text-sm text-gray-600'>Total Terjual</p>
                <p className='text-2xl font-bold text-gray-900'>00 Unit</p>
              </div>
            </div>
          </div>

          {/* Total Dipesan Card */}
          <div className='rounded-2xl border bg-white p-4 shadow-sm'>
            <div className='flex items-start gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-green-200 bg-green-50'>
                <Building2 className='h-8 w-8 text-green-500' />
              </div>
              <div>
                <p className='mb-1 text-sm text-gray-600'>Total Dipesan</p>
                <p className='text-2xl font-bold text-gray-900'>00 Unit</p>
              </div>
            </div>
          </div>

          {/* Percentage Change */}
          <div className='rounded-2xl border bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='text-3xl font-bold text-green-500'>0,0%</div>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500'>
                <TrendingUp className='h-4 w-4 text-white' />
              </div>
            </div>
            <p className='mt-2 text-sm text-gray-600'>dibanding pekan terakhir</p>
          </div>
        </div>

        {/* Chart Card */}
        <Card className='w-full rounded-2xl border-0 shadow-sm'>
          <CardContent className='p-4'>
            <ChartContainer config={chartConfig} className='h-[400px] w-full'>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: 20
                }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' horizontal={true} vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey='dipesan'
                  type='monotone'
                  fill='#22c55e'
                  fillOpacity={0.6}
                  stroke='#22c55e'
                  strokeWidth={3}
                  stackId='a'
                />
                <Area
                  dataKey='terjual'
                  type='monotone'
                  fill='#ef4444'
                  fillOpacity={0.6}
                  stroke='#ef4444'
                  strokeWidth={3}
                  stackId='b'
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
