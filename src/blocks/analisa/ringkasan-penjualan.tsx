'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { useAnalisaRingkasanPenjualan } from '@/services/analisa';

import { MoreVertical } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

type TimePeriod = 'harian' | 'mingguan' | 'bulanan';

const chartConfig = {
  outer: { color: '#3b82f6' },
  middle: { color: '#f97316' },
  inner: { color: '#22c55e' },
  center: { color: '#ef4444' }
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
  const { chartData, metrics } = useMemo(() => {
    if (!ringkasanData?.data || ringkasanData.data.length === 0) {
      return {
        chartData: [
          { name: 'outer', value: 0, color: '#3b82f6' },
          { name: 'middle', value: 0, color: '#f97316' },
          { name: 'inner', value: 0, color: '#22c55e' },
          { name: 'center', value: 0, color: '#ef4444' }
        ],
        metrics: [
          { color: '#3b82f6', value: '0', label: 'No Data' },
          { color: '#f97316', value: '0', label: 'No Data' },
          { color: '#22c55e', value: '0', label: 'No Data' },
          { color: '#ef4444', value: '0', label: 'No Data' }
        ]
      };
    }

    // Sort data by grand_total in descending order
    const sortedData = [...ringkasanData.data].sort((a, b) => b.grand_total - a.grand_total);

    // Take top 4 prospects for visualization
    const top4Data = sortedData.slice(0, 4);

    // Calculate total for percentage calculation
    const total = sortedData.reduce((sum, item) => sum + item.grand_total, 0);

    // Create chart data with percentages
    const chartData = top4Data.map((item, index) => {
      const percentage = total > 0 ? Math.round((item.grand_total / total) * 100) : 0;
      return {
        name: `prospek_${index + 1}`,
        value: percentage,
        color: ['#3b82f6', '#f97316', '#22c55e', '#ef4444'][index] || '#6b7280'
      };
    });

    // Create metrics with actual data
    const metrics = top4Data.map((item, index) => {
      const prospekName = item.prospek_id ? `Prospek ${item.prospek_id}` : 'Unknown';
      return {
        color: ['#3b82f6', '#f97316', '#22c55e', '#ef4444'][index] || '#6b7280',
        value: item.grand_total.toLocaleString('id-ID'),
        label: prospekName
      };
    });

    // Fill remaining slots if less than 4
    while (metrics.length < 4) {
      const index = metrics.length;
      metrics.push({
        color: ['#3b82f6', '#f97316', '#22c55e', '#ef4444'][index] || '#6b7280',
        value: '0',
        label: 'No Data'
      });
    }

    return { chartData, metrics };
  }, [ringkasanData]);

  const tabs = [
    { id: 'harian' as TimePeriod, label: 'Harian' },
    { id: 'mingguan' as TimePeriod, label: 'Mingguan' },
    { id: 'bulanan' as TimePeriod, label: 'Bulanan' }
  ];

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
        ) : (
          <div className='flex items-center gap-8'>
            {/* Multi-layer Circular Chart */}
            <div className='flex-shrink-0'>
              <ChartContainer config={chartConfig} className='h-48 w-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    {/* Outer ring - Blue */}
                    <Pie
                      data={[{ value: chartData[0]?.value || 0 }, { value: 100 - (chartData[0]?.value || 0) }]}
                      dataKey='value'
                      cx='50%'
                      cy='50%'
                      innerRadius={80}
                      outerRadius={95}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}>
                      <Cell fill={chartData[0]?.color || '#3b82f6'} />
                      <Cell fill='#e5e7eb' />
                    </Pie>
                    {/* Middle ring - Orange */}
                    <Pie
                      data={[{ value: chartData[1]?.value || 0 }, { value: 100 - (chartData[1]?.value || 0) }]}
                      dataKey='value'
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={75}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}>
                      <Cell fill={chartData[1]?.color || '#f97316'} />
                      <Cell fill='#e5e7eb' />
                    </Pie>
                    {/* Inner ring - Green */}
                    <Pie
                      data={[{ value: chartData[2]?.value || 0 }, { value: 100 - (chartData[2]?.value || 0) }]}
                      dataKey='value'
                      cx='50%'
                      cy='50%'
                      innerRadius={40}
                      outerRadius={55}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}>
                      <Cell fill={chartData[2]?.color || '#22c55e'} />
                      <Cell fill='#e5e7eb' />
                    </Pie>
                    {/* Center ring - Red */}
                    <Pie
                      data={[{ value: chartData[3]?.value || 0 }, { value: 100 - (chartData[3]?.value || 0) }]}
                      dataKey='value'
                      cx='50%'
                      cy='50%'
                      innerRadius={20}
                      outerRadius={35}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}>
                      <Cell fill={chartData[3]?.color || '#ef4444'} />
                      <Cell fill='#e5e7eb' />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Metrics Grid */}
            <div className='grid flex-1 grid-cols-2 gap-6'>
              {metrics.map((metric, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <div className='h-12 w-1 rounded-full' style={{ backgroundColor: metric.color }} />
                  <div>
                    <div className='text-2xl font-bold text-gray-900'>{metric.value}</div>
                    <div className='text-sm text-gray-500'>{metric.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
