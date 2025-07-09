'use client';

import * as React from 'react';

import CandlestickChart from '@/components/candlestick-chart';
import { PageTitle } from '@/components/page-title';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { MoreHorizontal, Star, TrendingUp } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

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

// Progress Bar Component
const ProgressBar = React.memo(
  ({ label, current, total, color }: { label: string; current: number; total: number; color: string }) => {
    const percentage = (current / total) * 100;

    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='font-sf-pro text-[14px] leading-[20px] font-medium tracking-[-0.01em] text-gray-700'>
            {label}
          </span>
          <span className='font-sf-pro text-[14px] leading-[20px] font-semibold tracking-[-0.01em] text-gray-900'>
            {current}/{total}
          </span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Customer Card Component
const CustomerCard = React.memo(
  ({ name, timeAgo, rating, description }: { name: string; timeAgo: string; rating: number; description: string }) => (
    <div className='flex space-x-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm'>
      <Avatar className='h-10 w-10 flex-shrink-0'>
        <AvatarImage src='/placeholder.svg?height=40&width=40' />
        <AvatarFallback className='font-sf-pro bg-gray-100 text-[14px] leading-[20px] font-semibold tracking-[-0.01em] text-gray-600'>
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1 space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='font-sf-pro truncate text-[16px] leading-[24px] font-semibold tracking-[-0.01em] text-gray-900'>
            {name}
          </h4>
          <span className='font-sf-pro ml-2 flex-shrink-0 text-[12px] leading-[16px] font-normal tracking-[-0.01em] text-gray-500'>
            {timeAgo}
          </span>
        </div>
        <div className='flex items-center space-x-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <p className='font-sf-pro line-clamp-3 text-[14px] leading-[20px] font-normal tracking-[-0.01em] text-gray-600'>
          {description}
        </p>
      </div>
    </div>
  )
);

CustomerCard.displayName = 'CustomerCard';

const HomePage = React.memo(() => {
  const metricCards = React.useMemo(
    () => [
      { title: 'Follow Up Hari Ini', value: '10', color: 'from-blue-500 to-blue-600', progress: 70 },
      { title: 'Follow Up Besok', value: '10', color: 'from-green-500 to-green-600', progress: 50 },
      { title: 'Konsumen Prospek', value: '10', color: 'from-orange-500 to-orange-600', progress: 30 },
      { title: 'Konsumen Baru', value: '10', color: 'from-gray-600 to-gray-700', progress: 10 }
    ],
    []
  );

  const realisasiData = [
    { label: 'Hari Ini', current: 0, total: 100, color: 'bg-orange-400' },
    { label: 'Minggu Ini', current: 0, total: 100, color: 'bg-orange-400' },
    { label: 'Bulan Ini', current: 0, total: 100, color: 'bg-red-400' }
  ];

  const propertiData = [
    { name: 'HOONJAN Sigura-Gura', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'HOONJAN Bumi Palapa', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'HOONJAN Bunga Kosmea', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'HOONJAN Borobudur', progress: 0, total: 100, color: 'bg-red-400' },
    { name: 'RHUMA Arumba', progress: 0, total: 100, color: 'bg-green-400' }
  ];

  const customerData = [
    {
      name: 'Nama Konsumen',
      timeAgo: '2m ago',
      rating: 4,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu. Pellentesque sagittis venenatis urna, nec scelerisque eros mattis dignissim. Vivamus vel tellus accumsan velit eleifend mattis in porta libero. Nam quis mauris quis eros...'
    },
    {
      name: 'Nama Konsumen',
      timeAgo: '5m ago',
      rating: 5,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec diam mauris, fringilla et fermentum quis, faucibus porttitor arcu. Pellentesque sagittis venenatis...'
    }
  ];

  const pieChartData = [
    { name: 'Aktif', value: 224, fill: 'var(--chart-1)' },
    { name: 'Non Aktif', value: 308, fill: 'var(--chart-2)' },
    { name: 'Pending', value: 100, fill: 'var(--chart-3)' }
  ];

  const chartConfig = {
    konsumen: {
      label: 'Konsumen'
    },
    aktif: {
      label: 'Aktif',
      color: 'var(--chart-1)'
    },
    nonAktif: {
      label: 'Non Aktif',
      color: 'var(--chart-2)'
    },
    pending: {
      label: 'Pending',
      color: 'var(--chart-3)'
    }
  } satisfies ChartConfig;

  const totalKonsumen = {
    aktif: 224,
    total: 532
  };

  return (
    <div className='min-h-screen space-y-8 bg-gray-50 p-6'>
      <PageTitle title='Dashboard' />

      {/* Top Metric Cards - Pixel Perfect Layout */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {metricCards.map((card, index) => (
          <div key={index} className='min-h-[140px]'>
            <MetricCard title={card.title} value={card.value} color={card.color} progress={card.progress} />
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Total Omzet Section */}
        <div className='lg:col-span-2'>
          <Card className='border-gray-200 shadow-sm'>
            <CardContent className='pt-6'>
              <CandlestickChart />
            </CardContent>
          </Card>
        </div>

        {/* Konsumen Pie Chart */}
        <Card className='flex flex-col'>
          <CardHeader className='items-center pb-0'>
            <CardTitle>Konsumen Chart</CardTitle>
            <CardDescription>Distribusi Konsumen</CardDescription>
          </CardHeader>
          <CardContent className='flex-1 pb-0'>
            <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[250px]'>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieChartData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={0}
                  activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                    <Sector {...props} outerRadius={outerRadius + 10} />
                  )}>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className='flex-col gap-2 text-sm'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Trending up by {((totalKonsumen.aktif / totalKonsumen.total) * 100).toFixed(1)}%
              <TrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground leading-none'>Total Konsumen Aktif</div>
          </CardFooter>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Realisasi Section */}
        <Card className='border-gray-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
              Realisasi
            </CardTitle>
            <p className='font-sf-pro mt-1 text-[14px] leading-[20px] font-normal tracking-[-0.01em] text-gray-500'>
              Lorem ipsum dolor sit amet consectetur adipiscing elit psu dor
            </p>
          </CardHeader>
          <CardContent className='space-y-6 pt-0'>
            {realisasiData.map((item, index) => (
              <ProgressBar
                key={index}
                label={item.label}
                current={item.current}
                total={item.total}
                color={item.color}
              />
            ))}
          </CardContent>
        </Card>

        {/* Properti Section */}
        <Card className='border-gray-200 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-4'>
            <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
              Properti
            </CardTitle>
            <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
          </CardHeader>
          <CardContent className='space-y-6 pt-0'>
            {propertiData.map((item, index) => (
              <div key={index} className='space-y-3'>
                <div className='font-sf-pro flex items-center justify-between text-[14px] leading-[20px] font-normal tracking-[-0.01em]'>
                  <span className='font-medium text-gray-700'>{item.name}</span>
                  <span className='text-gray-500'>
                    {item.progress}/{item.total} Unit
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                    style={{ width: `${(item.progress / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Enhanced Map Visualization */}
            <div className='relative mt-8 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'>
              <div className='absolute inset-0 opacity-60'>
                <svg viewBox='0 0 200 100' className='h-full w-full'>
                  <circle cx='50' cy='30' r='8' fill='#10b981' className='drop-shadow-sm' />
                  <text x='50' y='35' textAnchor='middle' className='font-sf-pro fill-white text-[10px] font-bold'>
                    224
                  </text>

                  <circle cx='120' cy='25' r='6' fill='#6b7280' className='drop-shadow-sm' />
                  <text x='120' y='29' textAnchor='middle' className='font-sf-pro fill-white text-[9px] font-bold'>
                    532
                  </text>

                  <circle cx='160' cy='40' r='6' fill='#6b7280' className='drop-shadow-sm' />
                  <text x='160' y='44' textAnchor='middle' className='font-sf-pro fill-white text-[9px] font-bold'>
                    653
                  </text>

                  <circle cx='80' cy='60' r='5' fill='#6b7280' className='drop-shadow-sm' />
                  <text x='80' y='64' textAnchor='middle' className='font-sf-pro fill-white text-[9px] font-bold'>
                    567
                  </text>

                  <circle cx='30' cy='70' r='4' fill='#6b7280' className='drop-shadow-sm' />
                  <text x='30' y='74' textAnchor='middle' className='font-sf-pro fill-white text-[8px] font-bold'>
                    234
                  </text>

                  <circle cx='170' cy='75' r='4' fill='#6b7280' className='drop-shadow-sm' />
                  <text x='170' y='79' textAnchor='middle' className='font-sf-pro fill-white text-[8px] font-bold'>
                    234
                  </text>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Section */}
        <Card className='border-gray-200 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-4'>
            <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
              Ringkasan
            </CardTitle>
            <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
          </CardHeader>
          <CardContent className='space-y-8 pt-0'>
            {/* Enhanced Circular Progress Indicators */}
            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-3 text-center'>
                <div className='relative mx-auto h-16 w-16'>
                  <MetricDonutProgress progress={0} color='from-blue-500 to-blue-600' size={64} strokeWidth={4} />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='font-sf-pro text-[18px] leading-[24px] font-bold tracking-[-0.02em] text-gray-900'>
                      00
                    </span>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='font-sf-pro text-[12px] leading-[16px] font-medium tracking-[-0.01em] text-gray-600'>
                    Unit Terjual
                  </p>
                  <p className='font-sf-pro text-[12px] leading-[16px] font-semibold tracking-[-0.01em] text-red-500'>
                    0.0%
                  </p>
                  <p className='font-sf-pro text-[11px] leading-[14px] font-normal tracking-[-0.01em] text-gray-400'>
                    Target 00/bulan
                  </p>
                </div>
              </div>

              <div className='space-y-3 text-center'>
                <div className='relative mx-auto h-16 w-16'>
                  <MetricDonutProgress progress={0} color='from-green-500 to-green-600' size={64} strokeWidth={4} />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='font-sf-pro text-[18px] leading-[24px] font-bold tracking-[-0.02em] text-gray-900'>
                      00
                    </span>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='font-sf-pro text-[12px] leading-[16px] font-medium tracking-[-0.01em] text-gray-600'>
                    Unit Diproses
                  </p>
                  <p className='font-sf-pro text-[12px] leading-[16px] font-semibold tracking-[-0.01em] text-green-500'>
                    0.0%
                  </p>
                  <p className='font-sf-pro text-[11px] leading-[14px] font-normal tracking-[-0.01em] text-gray-400'>
                    Target 00/bulan
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Chart Area */}
            <div className='relative h-36 rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white'>
              <svg viewBox='0 0 300 100' className='h-full w-full p-4'>
                {/* Grid lines */}
                <defs>
                  <pattern id='grid' width='30' height='20' patternUnits='userSpaceOnUse'>
                    <path d='M 30 0 L 0 0 0 20' fill='none' stroke='#f3f4f6' strokeWidth='0.5' />
                  </pattern>
                </defs>
                <rect width='100%' height='100%' fill='url(#grid)' />

                {/* Enhanced Chart lines */}
                <path
                  d='M 0 80 Q 50 60 100 70 T 200 50 T 300 40'
                  fill='none'
                  stroke='#ef4444'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                />
                <path
                  d='M 0 90 Q 50 85 100 80 T 200 75 T 300 70'
                  fill='none'
                  stroke='#10b981'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                />

                {/* Enhanced Fill areas */}
                <path d='M 0 80 Q 50 60 100 70 T 200 50 T 300 40 L 300 100 L 0 100 Z' fill='rgba(239, 68, 68, 0.08)' />
                <path d='M 0 90 Q 50 85 100 80 T 200 75 T 300 70 L 300 100 L 0 100 Z' fill='rgba(16, 185, 129, 0.08)' />
              </svg>

              {/* Enhanced Legend */}
              <div className='absolute top-3 left-3 space-y-2'>
                <div className='font-sf-pro flex items-center space-x-2 text-[12px] leading-[16px] font-medium tracking-[-0.01em]'>
                  <div className='h-3 w-3 rounded-full bg-green-500' />
                  <span className='text-gray-700'>00 Diproses</span>
                </div>
                <div className='font-sf-pro flex items-center space-x-2 text-[12px] leading-[16px] font-medium tracking-[-0.01em]'>
                  <div className='h-3 w-3 rounded-full bg-red-500' />
                  <span className='text-gray-700'>00 Terjual</span>
                </div>
              </div>
            </div>

            {/* Enhanced Month indicators */}
            <div className='font-sf-pro flex justify-between text-[12px] leading-[16px] font-normal tracking-[-0.01em] text-gray-500'>
              {['April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober'].map((month, index) => (
                <span key={month} className={index === 6 ? 'font-semibold text-gray-900' : ''}>
                  {month}
                </span>
              ))}
              <span className='font-semibold text-gray-900'>November</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Konsumen Prospek Section */}
      <Card className='border-gray-200 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between pb-6'>
          <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
            Konsumen Prospek
          </CardTitle>
          <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            {customerData.map((customer, index) => (
              <CustomerCard
                key={index}
                name={customer.name}
                timeAgo={customer.timeAgo}
                rating={customer.rating}
                description={customer.description}
              />
            ))}
          </div>
          <Button className='font-sf-pro h-12 w-full rounded-lg bg-orange-500 text-[16px] leading-[24px] font-semibold tracking-[-0.01em] shadow-sm transition-colors hover:bg-orange-600'>
            Lihat Lebih Banyak
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
