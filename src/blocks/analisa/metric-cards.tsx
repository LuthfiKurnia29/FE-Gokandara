'use client';

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useAnalisaFollowup } from '@/services/analisa';

import { Pie, PieChart } from 'recharts';

const StatCard = React.memo(
  ({
    title,
    value,
    bgColor,
    filledPercentage,
    isLoading = false
  }: {
    title: string;
    value: string;
    bgColor: string;
    filledPercentage: number;
    isLoading?: boolean;
  }) => {
    const chartData = [
      { name: 'filled', value: filledPercentage, fill: bgColor },
      { name: 'empty', value: 100 - filledPercentage, fill: 'rgba(241, 245, 249, 1)' }
    ];

    const chartConfig = {
      filled: {
        color: bgColor
      },
      empty: {
        color: 'rgba(241, 245, 249, 1)'
      }
    } satisfies ChartConfig;

    return (
      <Card className='relative h-[140px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md'>
        <CardContent className='flex h-full items-center justify-between p-6'>
          <div className='flex flex-col justify-center'>
            <div className='mb-1 text-[48px] leading-none font-bold text-gray-900'>{isLoading ? '...' : value}</div>
            <div className='max-w-[120px] text-sm font-medium text-gray-600'>{title}</div>
          </div>
          <div className='h-16 w-16 flex-shrink-0'>
            <ChartContainer config={chartConfig} className='h-full w-full'>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={20}
                  outerRadius={32}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export const AnalysisMetricCards = () => {
  // Get followup data for today and tomorrow
  const followupToday = useAnalisaFollowup({ waktu: 'today' });
  const followupTomorrow = useAnalisaFollowup({ waktu: 'tomorrow' });

  const stats = [
    {
      title: 'Follow Up Hari Ini',
      value: followupToday.data?.count_data?.toString() || '00',
      bgColor: '#3b82f6',
      filledPercentage: 30,
      isLoading: followupToday.isLoading
    },
    {
      title: 'Follow Up Besok',
      value: followupTomorrow.data?.count_data?.toString() || '00',
      bgColor: '#10b981',
      filledPercentage: 40,
      isLoading: followupTomorrow.isLoading
    },
    {
      title: 'Konsumen Prospek',
      value: '00',
      bgColor: '#f59e0b',
      filledPercentage: 60,
      isLoading: false
    },
    {
      title: 'Konsumen Baru',
      value: '00',
      bgColor: '#6b7280',
      filledPercentage: 20,
      isLoading: false
    }
  ];

  return (
    <div className='grid max-w-2xl grid-cols-2 gap-4'>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          bgColor={stat.bgColor}
          filledPercentage={stat.filledPercentage}
          isLoading={stat.isLoading}
        />
      ))}
    </div>
  );
};
