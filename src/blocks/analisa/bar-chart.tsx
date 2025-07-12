'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { MoreVertical } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const chartData = [
  {
    week: 'Minggu 01',
    sold: 25,
    rent: 30
  },
  {
    week: 'Minggu 02',
    sold: 20,
    rent: 15
  },
  {
    week: 'Minggu 03',
    sold: 22,
    rent: 28
  },
  {
    week: 'Minggu 04',
    sold: 26,
    rent: 35
  }
];

const chartConfig = {
  sold: {
    label: 'Sold',
    color: '#ef4444'
  },
  rent: {
    label: 'Rent',
    color: '#22c55e'
  }
};

export const BarChartComponent = () => {
  const [showNumbers, setShowNumbers] = useState(true);

  return (
    <Card className='h-fit rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-gray-900'>Grafik Batang</h3>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-700'>Number</span>
            <button
              onClick={() => setShowNumbers(!showNumbers)}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                showNumbers ? 'bg-black' : 'bg-gray-300'
              }`}>
              <span
                className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                  showNumbers ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            <MoreVertical className='h-4 w-4 text-gray-600' />
          </div>
        </div>

        <div className='mt-3 flex items-center gap-6'>
          <div className='flex items-center gap-2'>
            <div className='h-2.5 w-2.5 rounded-full bg-red-500'></div>
            <span className='text-sm font-medium text-gray-700'>Sold</span>
            <span className='ml-1 text-lg font-bold text-gray-900'>00</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-2.5 w-2.5 rounded-full bg-green-500'></div>
            <span className='text-sm font-medium text-gray-700'>Rent</span>
            <span className='ml-1 text-lg font-bold text-gray-900'>00</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0 pb-4'>
        <ChartContainer config={chartConfig} className='h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }} barCategoryGap='20%'>
              <XAxis
                dataKey='week'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={showNumbers ? { fontSize: 11, fill: '#9ca3af' } : false}
                domain={[0, 40]}
                width={showNumbers ? 30 : 0}
              />
              <ChartTooltip content={showNumbers ? <ChartTooltipContent /> : undefined} />
              <Bar dataKey='sold' fill='var(--color-sold)' radius={[2, 2, 0, 0]} maxBarSize={35} />
              <Bar dataKey='rent' fill='var(--color-rent)' radius={[2, 2, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
