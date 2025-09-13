'use client';

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import {
  useDashboardFollowUpToday,
  useDashboardFollowUpTomorrow,
  useDashboardKonsumenByProspek,
  useDashboardNewKonsumens
} from '@/services/dashboard';

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

interface AnalysisMetricCardsProps {
  filterParams?: { created_id?: number };
}

export const AnalysisMetricCards = ({ filterParams = {} }: AnalysisMetricCardsProps) => {
  // Use dashboard hooks instead of analisa hooks to match home page data
  const { data: followUpTodayData, isLoading: isLoadingFollowUpToday } = useDashboardFollowUpToday(filterParams);
  const { data: followUpTomorrowData, isLoading: isLoadingFollowUpTomorrow } =
    useDashboardFollowUpTomorrow(filterParams);
  const { data: newKonsumensData, isLoading: isLoadingNewKonsumens } = useDashboardNewKonsumens(filterParams);
  const { data: konsumenByProspekData, isLoading: isLoadingKonsumenByProspek } =
    useDashboardKonsumenByProspek(filterParams);

  // Extract data from dashboard API responses (same as home page)
  const followUpTodayCount = followUpTodayData?.count || 0;
  const followUpTomorrowCount = followUpTomorrowData?.count || 0;
  const newKonsumensCount = newKonsumensData?.count || 0;

  // Calculate total konsumen prospek from konsumenByProspek data (same as home page)
  const konsumenProspekCount = React.useMemo(() => {
    if (!konsumenByProspekData?.data?.values) return 0;
    return konsumenByProspekData.data.values.reduce((sum, value) => sum + value, 0);
  }, [konsumenByProspekData]);

  // Calculate filled percentages based on some logic (same as home page)
  const calculatePercentage = (value: number, max: number = 100) => {
    return Math.min((value / max) * 100, 100);
  };

  const stats = [
    {
      title: 'Follow Up Hari Ini',
      value: isLoadingFollowUpToday ? '...' : followUpTodayCount.toString().padStart(2, '0'),
      bgColor: '#3b82f6',
      filledPercentage: calculatePercentage(followUpTodayCount, 20), // Assume max 20 for demo
      isLoading: isLoadingFollowUpToday
    },
    {
      title: 'Follow Up Besok',
      value: isLoadingFollowUpTomorrow ? '...' : followUpTomorrowCount.toString().padStart(2, '0'),
      bgColor: '#10b981',
      filledPercentage: calculatePercentage(followUpTomorrowCount, 20), // Assume max 20 for demo
      isLoading: isLoadingFollowUpTomorrow
    },
    {
      title: 'Konsumen Prospek',
      value: isLoadingKonsumenByProspek ? '...' : konsumenProspekCount.toString().padStart(2, '0'),
      bgColor: '#f59e0b',
      filledPercentage: calculatePercentage(konsumenProspekCount, 200), // Assume max 200 for demo
      isLoading: isLoadingKonsumenByProspek
    },
    {
      title: 'Konsumen Baru',
      value: isLoadingNewKonsumens ? '...' : newKonsumensCount.toString().padStart(2, '0'),
      bgColor: '#6b7280',
      filledPercentage: calculatePercentage(newKonsumensCount, 10), // Assume max 10 for demo
      isLoading: isLoadingNewKonsumens
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
