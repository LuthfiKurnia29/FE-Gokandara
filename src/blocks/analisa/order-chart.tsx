'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalisaStatistikKonsumen } from '@/services/analisa';

import { MoreVertical } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
  konsumen: {
    label: 'Konsumen',
    color: '#22c55e'
  }
} satisfies ChartConfig;

type TimePeriod = 'harian' | 'mingguan' | 'bulanan';

interface OrderChartComponentProps {
  filterParams?: {
    created_id?: number;
    dateStart?: string;
    dateEnd?: string;
    prospek_id?: string;
    status?: string;
  };
}

export const OrderChartComponent = ({ filterParams = {} }: OrderChartComponentProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('bulanan');

  // Get statistik konsumen data based on selected period with filter
  const {
    data: statistikData,
    isLoading,
    error
  } = useAnalisaStatistikKonsumen({
    filter: selectedPeriod,
    ...filterParams
  });

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!statistikData) return [];

    return statistikData.map((item) => ({
      period: item.periode,
      konsumen: item.total_konsumen
    }));
  }, [statistikData]);

  // Calculate Y-axis domain dynamically
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];

    const maxValue = Math.max(...chartData.map((item) => item.konsumen));
    const roundedMax = Math.ceil(maxValue / 10) * 10;
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
          <h3 className='text-lg font-bold text-gray-900'>Statistik Konsumen</h3>
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
        ) : (
          <ChartContainer config={chartConfig} className='h-[250px] w-full'>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 0,
                right: 0,
                top: 10,
                bottom: 0
              }}>
              <CartesianGrid vertical={false} strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis
                dataKey='period'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke='#9ca3af'
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={yAxisDomain}
                stroke='#9ca3af'
                fontSize={12}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dot' hideLabel />} />
              <Area
                dataKey='konsumen'
                type='natural'
                fill='url(#fillKonsumen)'
                fillOpacity={0.4}
                stroke='var(--color-konsumen)'
                strokeWidth={3}
              />
              <defs>
                <linearGradient id='fillKonsumen' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-konsumen)' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='var(--color-konsumen)' stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
