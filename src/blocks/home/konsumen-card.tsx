'use client';

import { useMemo, useState } from 'react';

import { type ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ComponentWithDashboardProps } from '@/types/dashboard';

import { Cell, Pie, PieChart, Sector } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

// Fallback chart data when API data is not available
const fallbackChartData = [
  { category: 'lorem1', value: 20, fill: 'var(--color-lorem1)' },
  { category: 'lorem2', value: 40, fill: 'var(--color-lorem2)' },
  { category: 'lorem3', value: 15, fill: 'var(--color-lorem3)' },
  { category: 'lorem4', value: 15, fill: 'var(--color-lorem4)' }
];

// Fallback chart config
const fallbackChartConfig = {
  lorem1: {
    label: 'Lorem Ipsum',
    color: '#2563eb' // Blue
  },
  lorem2: {
    label: 'Lorem Ipsum',
    color: '#22c55e' // Green
  },
  lorem3: {
    label: 'Lorem Ipsum',
    color: '#f97316' // Orange
  },
  lorem4: {
    label: 'Lorem Ipsum',
    color: '#d1d5db' // Gray
  }
} satisfies ChartConfig;

const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius || 0) + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
          transition: 'all 0.3s ease-in-out'
        }}
      />
    </g>
  );
};

export default function KonsumenCard({ dashboardData }: ComponentWithDashboardProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredLegend, setHoveredLegend] = useState<number | null>(null);

  // Get konsumen by prospek data from API
  const konsumenByProspekData = dashboardData?.konsumenByProspek?.data;
  const isLoading = dashboardData?.isLoading.konsumenByProspek;

  // Create chart data and config from API data
  const { chartData, chartConfig } = useMemo(() => {
    if (!konsumenByProspekData?.chart_data || konsumenByProspekData.chart_data.length === 0) {
      return {
        chartData: fallbackChartData,
        chartConfig: fallbackChartConfig
      };
    }

    // Transform API data to chart format
    const apiChartData = konsumenByProspekData.chart_data.map((item, index) => ({
      category: `prospek${index}`,
      value: parseFloat(item.percentage.replace('%', '')),
      fill: item.color // Use color directly from API
    }));

    // Create dynamic chart config based on API data
    const apiChartConfig: ChartConfig = {};
    konsumenByProspekData.chart_data.forEach((item, index) => {
      apiChartConfig[`prospek${index}`] = {
        label: item.name,
        color: item.color // Use color directly from API, no fallback
      };
    });

    return {
      chartData: apiChartData,
      chartConfig: apiChartConfig
    };
  }, [konsumenByProspekData]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(0); // Reset to default active
  };

  const onLegendEnter = (index: number) => {
    setHoveredLegend(index);
    setActiveIndex(index);
  };

  const onLegendLeave = () => {
    setHoveredLegend(null);
    setActiveIndex(0);
  };

  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
        {/* Left side - Title and Legend */}
        <div className='space-y-4'>
          <div>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>Konsumen</h2>
            <p className='text-sm leading-relaxed text-gray-500'>
              {isLoading ? 'Loading data konsumen...' : 'Distribusi konsumen berdasarkan prospek'}
            </p>
          </div>

          {/* Interactive Legend */}
          <div className='space-y-3'>
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className='flex items-center justify-between rounded-lg p-2'>
                    <div className='flex items-center gap-2'>
                      <div className='h-3 w-3 animate-pulse rounded-full bg-gray-300' />
                      <div className='h-4 w-20 animate-pulse rounded bg-gray-300' />
                    </div>
                    <div className='h-4 w-8 animate-pulse rounded bg-gray-300' />
                  </div>
                ))
              : chartData.map((item, index) => (
                  <div
                    key={item.category}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-all duration-300 ${
                      hoveredLegend === index || activeIndex === index
                        ? 'scale-105 transform bg-gray-50 shadow-sm'
                        : 'hover:bg-gray-25'
                    }`}
                    onMouseEnter={() => onLegendEnter(index)}
                    onMouseLeave={onLegendLeave}>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`h-3 w-3 rounded-full transition-all duration-300 ${
                          hoveredLegend === index || activeIndex === index ? 'h-4 w-4 shadow-md' : ''
                        }`}
                        style={{ backgroundColor: chartConfig[item.category as keyof typeof chartConfig]?.color }}
                      />
                      <span
                        className={`text-sm font-medium transition-all duration-300 ${
                          hoveredLegend === index || activeIndex === index
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-900'
                        }`}>
                        {chartConfig[item.category as keyof typeof chartConfig]?.label}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium transition-all duration-300 ${
                        hoveredLegend === index || activeIndex === index
                          ? 'text-base font-bold text-gray-900'
                          : 'text-gray-500'
                      }`}>
                      {item.value}%
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Right side - Interactive Chart */}
        <div className='flex justify-center'>
          <ChartContainer config={chartConfig} className='aspect-square w-full max-w-[250px]'>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const config = chartConfig[data.category as keyof typeof chartConfig];
                    return (
                      <div className='scale-105 transform rounded-lg border border-gray-200 bg-white p-3 shadow-xl transition-all duration-200'>
                        <div className='mb-1 flex items-center gap-2'>
                          <div className='h-3 w-3 rounded-full shadow-sm' style={{ backgroundColor: config.color }} />
                          <span className='text-sm font-semibold text-gray-900'>{config.label}</span>
                        </div>
                        <div className='text-xs text-gray-600'>
                          <span className='text-lg font-bold text-gray-900'>{data.value}%</span> of total
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='category'
                innerRadius={50}
                outerRadius={100}
                strokeWidth={2}
                stroke='#ffffff'
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                style={{ cursor: 'pointer' }}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.category as keyof typeof chartConfig].color}
                    style={{
                      transition: 'all 0.3s ease-in-out',
                      opacity: activeIndex === index ? 1 : 0.8
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
