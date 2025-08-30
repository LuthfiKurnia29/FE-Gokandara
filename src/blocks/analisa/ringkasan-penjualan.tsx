'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { useAnalisaRingkasanPenjualan } from '@/services/analisa';

import { MoreVertical } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type TimePeriod = 'harian' | 'mingguan' | 'bulanan';

// Color mapping for prospect types
const getProspectColor = (prospectName: string | null) => {
  if (!prospectName) return '#6b7280'; // Gray for null prospect
  switch (prospectName.toLowerCase()) {
    case 'hot':
      return '#ef4444'; // Red
    case 'warm':
      return '#f97316'; // Orange
    case 'cold':
      return '#3b82f6'; // Blue
    default:
      return '#6b7280';
  }
};

export const RingkasanPenjualanComponent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('bulanan');

  // Get ringkasan penjualan data based on selected period
  const {
    data: ringkasanData,
    isLoading,
    error
  } = useAnalisaRingkasanPenjualan({
    filter: selectedPeriod
  });

  // Transform API data to chart format and metrics
  const { chartData, metrics, totalSales } = useMemo(() => {
    if (!ringkasanData || ringkasanData?.length === 0) {
      return {
        chartData: [],
        metrics: [],
        totalSales: 0
      };
    }

    // Calculate total for percentage calculation
    const total = ringkasanData.reduce((sum, item) => sum + item.grand_total, 0);

    // Create chart data with percentages and proper labels
    const chartData = ringkasanData.map((item) => {
      const percentage = total > 0 ? Math.round((item.grand_total / total) * 100) : 0;
      const prospectName = item.prospek?.name || 'Unknown';
      const color = item.prospek?.color || getProspectColor(prospectName);

      return {
        name: prospectName,
        value: item.grand_total,
        percentage: percentage,
        color: color,
        prospekId: item.prospek?.id
      };
    });

    // Create metrics with actual data
    const metrics = ringkasanData.map((item) => {
      const prospectName = item.prospek?.name || 'Unknown';
      const color = item.prospek?.color || getProspectColor(prospectName);

      return {
        color: color,
        value: item.grand_total.toLocaleString('id-ID'),
        label: prospectName,
        percentage: total > 0 ? Math.round((item.grand_total / total) * 100) : 0
      };
    });

    return { chartData, metrics, totalSales: total };
  }, [ringkasanData]);

  const tabs = [
    { id: 'harian' as TimePeriod, label: 'Harian' },
    { id: 'mingguan' as TimePeriod, label: 'Mingguan' },
    { id: 'bulanan' as TimePeriod, label: 'Bulanan' }
  ];

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='rounded-lg border border-gray-200 bg-white p-3 shadow-lg'>
          <p className='font-semibold text-gray-900'>{data.name}</p>
          <p className='text-sm text-gray-600'>Total: Rp {data.value.toLocaleString('id-ID')}</p>
          <p className='text-sm text-gray-600'>Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    color: {
      color: '#6b7280'
    }
  };

  return (
    <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-900'>Ringkasan Penjualan</h2>
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

      <CardContent className='px-6 pb-6'>
        {isLoading ? (
          <div className='flex h-48 w-full items-center justify-center'>
            <div className='text-gray-500'>Loading...</div>
          </div>
        ) : error ? (
          <div className='flex h-48 w-full items-center justify-center'>
            <div className='text-red-500'>Error loading data</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex h-48 w-full items-center justify-center'>
            <div className='text-gray-500'>No data available</div>
          </div>
        ) : (
          <div className='flex flex-wrap items-center gap-8'>
            {/* Pie Chart */}
            <div className='flex-shrink-0'>
              <ChartContainer className='h-64 w-64' config={chartConfig}>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey='value'
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                      strokeWidth={0}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign='bottom'
                      height={36}
                      formatter={(value, entry: any) => <span className='text-sm text-gray-700'>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Metrics Grid */}
            <div className='grid grid-cols-2 gap-6'>
              {metrics.map((metric, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <div className='h-12 w-1 rounded-full' style={{ backgroundColor: metric.color }} />
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>Rp {metric.value}</div>
                    <div className='text-sm text-gray-500'>{metric.label}</div>
                    <div className='text-xs text-gray-400'>{metric.percentage}%</div>
                  </div>
                </div>
              ))}

              {/* Total Sales Summary */}
              <div className='col-span-2 mt-4 rounded-lg bg-gray-50 p-4'>
                <div className='text-center'>
                  <div className='mb-1 text-sm text-gray-500'>Total Penjualan</div>
                  <div className='text-2xl font-bold text-gray-900'>Rp {totalSales.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
