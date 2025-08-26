'use client';

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComponentWithDashboardProps } from '@/types/dashboard';

import { Building2, MoreVertical, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// Fallback chart data when API data is not available
const fallbackChartData = [
  { month: 'April', terjual: 45, dipesan: 38 },
  { month: 'Mei', terjual: 35, dipesan: 42 },
  { month: 'Juni', terjual: 40, dipesan: 35 },
  { month: 'Juli', terjual: 25, dipesan: 30 },
  { month: 'Agustus', terjual: 65, dipesan: 58 },
  { month: 'September', terjual: 15, dipesan: 22 },
  { month: 'Oktober', terjual: 45, dipesan: 40 },
  { month: 'November', terjual: 35, dipesan: 38 }
];

const chartConfig = {
  terjual: {
    label: 'Total Terjual',
    color: '#ef4444'
  },
  dipesan: {
    label: 'Total Dipesan',
    color: '#22c55e'
  }
} satisfies ChartConfig;

export default function RingkasanCard({ dashboardData }: ComponentWithDashboardProps) {
  // Get sales overview data from API
  const salesData = dashboardData?.salesOverview?.data;
  const isLoading = dashboardData?.isLoading.salesOverview;

  // Get total terjual and dipesan values
  const totalTerjual = salesData?.summary.total_terjual.value || 0;
  const totalDipesan = salesData?.summary.total_dipesan.value || 0;
  const percentageChange = salesData?.summary.total_terjual.percentage_change || '0,0%';

  // Create chart data from API
  const chartData = React.useMemo(() => {
    if (!salesData?.chart.series || !salesData?.chart.months) {
      return fallbackChartData;
    }

    const terjualData = salesData.chart.series.find((s) => s.name === 'Total Terjual')?.data || [];
    const dipesanData = salesData.chart.series.find((s) => s.name === 'Total Dipesan')?.data || [];

    return salesData.chart.months.map((month, index) => ({
      month: month.substring(0, 3), // Get first 3 chars of month
      terjual: terjualData[index] || 0,
      dipesan: dipesanData[index] || 0
    }));
  }, [salesData]);

  // Calculate Y-axis domain based on data
  const maxValue = Math.max(...chartData.map((d) => d.terjual));
  const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% padding

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
        <div className='grid grid-cols-1 place-items-center gap-3 sm:grid-cols-2 lg:grid-cols-2'>
          {/* Total Penjualan Card */}
          <div className='w-full max-w-[350px] rounded-2xl border bg-white p-4 shadow-sm'>
            <div className='flex items-center justify-center gap-4'>
              <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-red-200 bg-red-50'>
                <Building2 className='h-8 w-8 text-red-500' />
              </div>
              <div className='text-center'>
                <p className='mb-1 text-sm text-gray-600'>Total Penjualan</p>
                <p className='text-xl font-bold text-gray-900'>
                  {isLoading ? 'Loading...' : `Rp ${totalTerjual.toLocaleString('id-ID')}`}
                </p>
              </div>
            </div>
          </div>

          {/* Total Dipesan Card */}
          <div className='w-full max-w-[350px] rounded-2xl border bg-white p-4 shadow-sm'>
            <div className='flex items-center justify-center gap-4'>
              <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-green-200 bg-green-50'>
                <Building2 className='h-8 w-8 text-green-500' />
              </div>
              <div className='text-center'>
                <p className='mb-1 text-sm text-gray-600'>Total Dipesan</p>
                <p className='text-xl font-bold text-gray-900'>
                  {isLoading ? 'Loading...' : `${totalDipesan.toLocaleString('id-ID')}`}
                </p>
              </div>
            </div>
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
                  domain={[0, yAxisMax]}
                  tickFormatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded-lg border bg-white p-3 shadow-lg'>
                          <p className='font-medium text-gray-900'>{`${label}`}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className='text-sm' style={{ color: entry.color }}>
                              {`${
                                entry.name === 'Total Terjual'
                                  ? `${entry.name}: Rp ${Number(entry.value).toLocaleString('id-ID')}`
                                  : `${entry.name}: ${Number(entry.value).toLocaleString('id-ID')}`
                              }`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  dataKey='terjual'
                  type='monotone'
                  fill='#ef4444'
                  fillOpacity={0.6}
                  stroke='#ef4444'
                  strokeWidth={3}
                  name='Total Terjual'
                />
                <Area
                  dataKey='dipesan'
                  type='monotone'
                  fill='#22c55e'
                  fillOpacity={0.6}
                  stroke='#22c55e'
                  strokeWidth={3}
                  name='Total Dipesan'
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
