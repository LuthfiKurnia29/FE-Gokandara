'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';

import { Pie, PieChart } from 'recharts';

const StatCard = React.memo(
  ({
    title,
    value,
    bgColor,
    filledPercentage,
    onClick
  }: {
    title: string;
    value: string;
    bgColor: string;
    filledPercentage: number;
    onClick?: () => void;
  }) => {
    const chartData = [
      { name: 'filled', value: filledPercentage, fill: 'rgba(255, 255, 255, 0.8)' },
      { name: 'empty', value: 100 - filledPercentage, fill: 'rgba(255, 255, 255, 0.2)' }
    ];

    const chartConfig = {
      filled: {
        color: 'rgba(255, 255, 255, 0.8)'
      },
      empty: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    } satisfies ChartConfig;

    return (
      <Card
        className={`${bgColor} relative h-[120px] overflow-hidden rounded-2xl border-0 text-white shadow-lg transition-transform hover:scale-[1.02] ${onClick ? 'focus:ring-opacity-50 cursor-pointer focus:ring-2 focus:ring-white focus:outline-none' : ''}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        aria-label={onClick ? `Klik untuk melihat ${title}` : undefined}>
        <CardContent className='flex h-full items-center justify-between p-6'>
          <div className='flex flex-col'>
            <div className='mb-2 text-[40px] leading-none font-bold'>{value}</div>
            <div className='flex items-center gap-2 text-sm font-medium opacity-90'>
              {title}
              {onClick && <span className='text-xs opacity-70'>→</span>}
            </div>
          </div>
          <div className='h-20 w-20'>
            <ChartContainer config={chartConfig} className='h-full w-full'>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={24}
                  outerRadius={40}
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

export default function MetricCards() {
  const router = useRouter();

  const handleFollowUpClick = () => {
    router.push('/kalender');
  };

  const stats = [
    {
      title: 'Follow Up Hari ini',
      value: '00',
      bgColor: 'bg-blue-500',
      filledPercentage: 28,
      onClick: handleFollowUpClick
    },
    {
      title: 'Follow Up Besok',
      value: '00',
      bgColor: 'bg-green-500',
      filledPercentage: 42,
      onClick: handleFollowUpClick
    },
    {
      title: 'Konsumen Prospek',
      value: '00',
      bgColor: 'bg-orange-500',
      filledPercentage: 63
    },
    {
      title: 'Konsumen Baru',
      value: '00',
      bgColor: 'bg-slate-600',
      filledPercentage: 23
    }
  ];

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          bgColor={stat.bgColor}
          filledPercentage={stat.filledPercentage}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
}
