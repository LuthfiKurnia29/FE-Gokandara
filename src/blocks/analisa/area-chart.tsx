'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalisaStatistikPenjualan } from '@/services/analisa';

import { MoreVertical } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
  terjual: {
    label: 'Terjual',
    color: '#ef4444'
  }
} satisfies ChartConfig;

type TimePeriod = 'harian' | 'mingguan' | 'bulanan';

interface AreaChartComponentProps {
  filterParams?: { created_id?: number };
}

export const AreaChartComponent = ({ filterParams = {} }: AreaChartComponentProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('bulanan');

  // Get statistik penjualan data based on selected period with filter
  const {
    data: statistikData,
    isLoading,
    error
  } = useAnalisaStatistikPenjualan({
    filter: selectedPeriod,
    ...filterParams
  });

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!statistikData) return [];

    return statistikData.map((item) => ({
      period: item.periode,
      terjual: item.grand_total
    }));
  }, [statistikData]);

  // Calculate Y-axis domain dynamically
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];

    const maxValue = Math.max(...chartData.map((item) => item.terjual));
    const roundedMax = Math.ceil(maxValue / 100) * 100;
    return [0, roundedMax];
  }, [chartData]);

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
        {isLoading ? (
          <div className='flex h-[250px] w-full items-center justify-center'>
            <div className='text-gray-500'>Loading...</div>
          </div>
        ) : error ? (
          <div className='flex h-[250px] w-full items-center justify-center'>
            <div className='text-red-500'>Error loading data</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex h-[250px] w-full items-center justify-center'>
            <div className='text-gray-500'>No data available</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className='h-[250px] w-full'>
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
                domain={yAxisDomain}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey='terjual'
                type='monotone'
                fill='#ef4444'
                fillOpacity={0.6}
                stroke='#ef4444'
                strokeWidth={3}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
