'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ComponentWithDashboardProps } from '@/types/dashboard';

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ percentage, color, size = 80, strokeWidth = 8 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} className='-rotate-90 transform'>
        {/* Colored background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius + 4} fill={`${color}20`} stroke='none' />
        {/* Background track circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke='#f1f5f9' strokeWidth={strokeWidth} fill='transparent' />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          className='transition-all duration-300 ease-in-out'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-sm font-semibold' style={{ color }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  target: string;
  percentage: number;
  color: string;
}

function MetricCard({ title, value, target, percentage, color }: MetricCardProps) {
  return (
    <Card className='border-0 bg-white p-4 shadow-sm'>
      <CardContent className='p-0'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex-1'>
            <div className='mb-1 text-2xl font-bold text-gray-900'>{value}</div>
            <div className='mb-2 text-base font-medium text-gray-700'>{title}</div>
            <div className='text-sm text-gray-500'>{target}</div>
          </div>
          <div className='ml-6'>
            <CircularProgress percentage={percentage} color={color} size={80} strokeWidth={8} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UnitMetrics({ dashboardData }: ComponentWithDashboardProps) {
  return (
    <div className='h-full w-full space-y-3'>
      <MetricCard title='Unit Terjual' value='65' target='Target 100/bulan' percentage={65} color='#F2335A' />
      <MetricCard title='Unit Dipesan' value='40' target='Target 100/bulan' percentage={40} color='#37D159' />
    </div>
  );
}
