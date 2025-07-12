'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { MoreVertical } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const dailyData = [
  { period: 'Sen', terjual: 15 },
  { period: 'Sel', terjual: 22 },
  { period: 'Rab', terjual: 18 },
  { period: 'Kam', terjual: 25 },
  { period: 'Jum', terjual: 30 },
  { period: 'Sab', terjual: 35 },
  { period: 'Min', terjual: 20 }
];

const weeklyData = [
  { period: 'Minggu 1', terjual: 45 },
  { period: 'Minggu 2', terjual: 35 },
  { period: 'Minggu 3', terjual: 40 },
  { period: 'Minggu 4', terjual: 25 }
];

const monthlyData = [
  { period: 'April', terjual: 45 },
  { period: 'Mei', terjual: 35 },
  { period: 'Juni', terjual: 40 },
  { period: 'Juli', terjual: 25 },
  { period: 'Agustus', terjual: 65 },
  { period: 'September', terjual: 15 },
  { period: 'Oktober', terjual: 45 },
  { period: 'November', terjual: 35 }
];

const chartConfig = {
  terjual: {
    label: 'Terjual',
    color: '#ef4444'
  }
} satisfies ChartConfig;

type TimePeriod = 'harian' | 'mingguan' | 'bulanan';

export const AreaChartComponent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('bulanan');

  const getChartData = () => {
    switch (selectedPeriod) {
      case 'harian':
        return dailyData;
      case 'mingguan':
        return weeklyData;
      case 'bulanan':
        return monthlyData;
      default:
        return monthlyData;
    }
  };

  const tabs = [
    { id: 'harian' as TimePeriod, label: 'Harian' },
    { id: 'mingguan' as TimePeriod, label: 'Mingguan' },
    { id: 'bulanan' as TimePeriod, label: 'Bulanan' }
  ];

  return (
    <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-gray-900'>Statistik Penjualan</h3>
          <div className='flex items-center gap-4'>
            {/* Time Period Tabs */}
            <div className='flex items-center gap-6'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPeriod(tab.id)}
                  className={`relative pb-1 text-sm font-medium transition-colors ${
                    selectedPeriod === tab.id ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label}
                  {selectedPeriod === tab.id && (
                    <div className='absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-green-600' />
                  )}
                </button>
              ))}
            </div>
            <MoreVertical className='h-4 w-4 text-gray-600' />
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0 pb-4'>
        <ChartContainer config={chartConfig} className='h-[250px] w-full'>
          <AreaChart
            accessibilityLayer
            data={getChartData()}
            margin={{
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' horizontal={true} vertical={false} />
            <XAxis
              dataKey='period'
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              domain={[0, 80]}
              ticks={[0, 20, 40, 60, 80]}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area dataKey='terjual' type='monotone' fill='#ef4444' fillOpacity={0.6} stroke='#ef4444' strokeWidth={3} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
