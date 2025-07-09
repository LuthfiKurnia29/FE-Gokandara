'use client';

import * as React from 'react';

import { type ChartConfig, ChartContainer } from '@/components/ui/chart';

import 'react-circular-progressbar/dist/styles.css';
import { Cell, Pie, PieChart } from 'recharts';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by ErrorBoundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Donut Progress Component using Recharts Pie Chart
const MetricDonutProgress = React.memo(
  ({
    progress,
    color,
    size = 80,
    strokeWidth = 20
  }: {
    progress: number;
    color: string;
    size?: number;
    strokeWidth?: number;
  }) => {
    // Warna spesifik dari Figma
    const colorMap = React.useMemo(
      () => ({
        'from-blue-500 to-blue-600': '#216FED',
        'from-green-500 to-green-600': '#30DB56',
        'from-orange-500 to-orange-600': '#FF9136',
        'from-gray-600 to-gray-700': '#485462'
      }),
      []
    );

    // Memoize warna utama
    const mainColor = React.useMemo(() => colorMap[color as keyof typeof colorMap] || '#216FED', [color, colorMap]);

    // Data untuk pie chart - progress dan background
    const chartData = React.useMemo(
      () => [
        { name: 'progress', value: progress, fill: 'rgba(255,255,255,1)' },
        { name: 'remaining', value: 100 - progress, fill: 'rgba(255,255,255,0.15)' }
      ],
      [progress]
    );

    // Chart config untuk Recharts
    const chartConfig = React.useMemo(
      () => ({
        progress: { label: 'Progress' },
        remaining: { label: 'Remaining' }
      }),
      []
    );

    // Calculate radii for donut
    const innerRadius = size / 2 - strokeWidth;
    const outerRadius = size / 2 - 4;

    return (
      <div className='relative' style={{ width: size, height: size }}>
        {/* Progress donut menggunakan Recharts */}
        <ChartContainer config={chartConfig} className='absolute inset-0 h-full rotate-x-180'>
          <PieChart width={size} height={size}>
            <Pie
              data={chartData}
              dataKey='value'
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={0}
              startAngle={-90}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    );
  }
);

// Refined Metric Card Component dengan donut progress custom
const MetricCard = React.memo(
  ({ title, value, color, progress }: { title: string; value: string; color: string; progress: number }) => {
    return (
      <ErrorBoundary>
        <div
          className={`relative flex min-h-[150px] items-center justify-between rounded-2xl bg-gradient-to-r p-6 shadow-lg ${color}`}>
          <div className='flex flex-col justify-center'>
            <span className='mb-1 text-4xl font-bold text-white'>{value}</span>
            <span className='text-base text-white opacity-90'>{title}</span>
          </div>
          <div className='-ml-10 hidden h-24 w-24 -translate-x-10 items-center justify-center 2xl:flex'>
            <MetricDonutProgress progress={progress} color={color} size={100} strokeWidth={24} />
          </div>
          <div className='hidden h-24 w-24 -translate-x-4 items-center justify-center lg:flex 2xl:hidden'>
            <MetricDonutProgress progress={progress} color={color} size={64} strokeWidth={16} />
          </div>
          <div className='flex h-24 w-24 -translate-x-10 items-center justify-center lg:hidden'>
            <MetricDonutProgress progress={progress} color={color} size={100} strokeWidth={24} />
          </div>
        </div>
      </ErrorBoundary>
    );
  }
);

MetricCard.displayName = 'MetricCard';

// Main component
export default function MetricCards() {
  const metricCards = React.useMemo(
    () => [
      { title: 'Follow Up Hari Ini', value: '10', color: 'from-blue-500 to-blue-600', progress: 70 },
      { title: 'Follow Up Besok', value: '10', color: 'from-green-500 to-green-600', progress: 50 },
      { title: 'Konsumen Prospek', value: '10', color: 'from-orange-500 to-orange-600', progress: 30 },
      { title: 'Konsumen Baru', value: '10', color: 'from-gray-600 to-gray-700', progress: 10 }
    ],
    []
  );

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {metricCards.map((card, index) => (
        <div key={index} className='min-h-[140px]'>
          <MetricCard title={card.title} value={card.value} color={card.color} progress={card.progress} />
        </div>
      ))}
    </div>
  );
}
