'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { MoreHorizontal, Star, TrendingUp } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Circular Progress Component matching Figma design exactly
const CircularProgress = React.memo(
  ({
    progress = 0,
    size = 64,
    strokeWidth = 4,
    className = ''
  }: {
    progress?: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <svg width={size} height={size} className='-rotate-90 transform' viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke='rgba(255, 255, 255, 0.2)'
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke='rgba(255, 255, 255, 0.9)'
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className='transition-all duration-300 ease-in-out'
          />
        </svg>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// Refined Metric Card Component with pixel-perfect design
const MetricCard = React.memo(
  ({ title, value, color, progress }: { title: string; value: string; color: string; progress: number }) => (
    <div
      className={`relative flex min-h-[150px] items-center justify-between rounded-2xl bg-gradient-to-r p-6 shadow-lg ${color}`}
      style={{ minWidth: 260 }}>
      <div className='flex flex-col justify-center'>
        <span className='mb-1 text-4xl font-bold text-white'>{value}</span>
        <span className='text-base font-semibold text-white opacity-90'>{title}</span>
      </div>
      <div className='flex h-16 w-16 items-center justify-center'>
        <CircularProgressbar
          value={progress}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: '#fff',
            trailColor: 'rgba(255,255,255,0.2)',
            strokeLinecap: 'round',
            backgroundColor: 'transparent'
          })}
        />
      </div>
    </div>
  )
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
  // Update color prop in metricCards array to use Tailwind gradient classes
  const metricCards = [
    { title: 'Follow Up Hari Ini', value: '00', color: 'from-blue-500 to-blue-600', progress: 70 },
    { title: 'Follow Up Besok', value: '00', color: 'from-green-500 to-green-600', progress: 50 },
    { title: 'Konsumen Prospek', value: '00', color: 'from-orange-500 to-orange-600', progress: 30 },
    { title: 'Konsumen Baru', value: '00', color: 'from-gray-600 to-gray-700', progress: 10 }
  ];

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
    { label: 'Lorem Ipsum', value: 20, color: 'bg-blue-500' },
    { label: 'Lorem Ipsum', value: 40, color: 'bg-green-500' },
    { label: 'Lorem Ipsum', value: 15, color: 'bg-orange-500' },
    { label: 'Lorem Ipsum', value: 15, color: 'bg-gray-500' }
  ];

  // Bar chart heights for Total Omzet (to avoid hydration error)
  const [barHeights, setBarHeights] = React.useState<number[] | null>(null);
  React.useEffect(() => {
    setBarHeights(Array.from({ length: 15 }, () => Math.random() * 80 + 20));
  }, []);

  return (
    <div className='min-h-screen space-y-8 bg-gray-50 p-6'>
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
            <CardHeader className='flex flex-row items-center justify-between pb-4'>
              <div>
                <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
                  Total Omzet
                </CardTitle>
              </div>
              <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-6'>
                <div className='flex items-center space-x-3'>
                  <span className='font-sf-pro text-[32px] leading-[40px] font-bold tracking-[-0.02em] text-gray-900'>
                    Rp 00.000.000.000
                  </span>
                  <Badge variant='secondary' className='border-green-200 bg-green-50 px-2 py-1 text-green-700'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    <span className='text-[12px] font-semibold'>7%</span>
                  </Badge>
                </div>
                <p className='font-sf-pro text-[14px] leading-[20px] font-normal tracking-[-0.01em] text-gray-500'>
                  bulan lalu Rp 0.00 M
                </p>

                {/* Enhanced Bar Chart */}
                <div className='mt-8'>
                  <div className='mb-4 flex h-40 items-end space-x-2'>
                    {barHeights === null
                      ? Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className='h-8 flex-1 animate-pulse rounded-t bg-gray-200' />
                        ))
                      : barHeights.map((height, i) => (
                          <div
                            key={i}
                            className='flex-1 rounded-t bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-300 hover:from-orange-600 hover:to-orange-500'
                            style={{ height: `${height}%` }}
                          />
                        ))}
                  </div>
                  <div className='font-sf-pro flex justify-between text-[12px] leading-[16px] font-medium tracking-[-0.01em] text-gray-500'>
                    {['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].map(
                      (time) => (
                        <span key={time}>{time}</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Konsumen Pie Chart */}
        <Card className='border-gray-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
              Konsumen
            </CardTitle>
            <p className='font-sf-pro mt-1 text-[14px] leading-[20px] font-normal tracking-[-0.01em] text-gray-500'>
              Lorem ipsum dolor sit amet consectetur adipiscing elit psu dor
            </p>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-6'>
              {/* Enhanced Pie Chart */}
              <div className='relative mx-auto h-32 w-32'>
                <svg className='h-32 w-32 -rotate-90 transform' viewBox='0 0 36 36'>
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#f3f4f6'
                    strokeWidth='3'
                  />
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#3b82f6'
                    strokeWidth='3'
                    strokeDasharray='20, 100'
                    strokeLinecap='round'
                  />
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#10b981'
                    strokeWidth='3'
                    strokeDasharray='40, 100'
                    strokeDashoffset='-20'
                    strokeLinecap='round'
                  />
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#f59e0b'
                    strokeWidth='3'
                    strokeDasharray='15, 100'
                    strokeDashoffset='-60'
                    strokeLinecap='round'
                  />
                </svg>
              </div>

              {/* Enhanced Legend */}
              <div className='space-y-3'>
                {pieChartData.map((item, index) => (
                  <div
                    key={index}
                    className='font-sf-pro flex items-center justify-between text-[14px] leading-[20px] font-normal tracking-[-0.01em]'>
                    <div className='flex items-center space-x-3'>
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className='text-gray-700'>{item.label}</span>
                    </div>
                    <span className='font-sf-pro text-[14px] leading-[20px] font-semibold tracking-[-0.01em] text-gray-900'>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
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
                  <CircularProgress progress={0} size={64} strokeWidth={4} />
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
                  <CircularProgress progress={0} size={64} strokeWidth={4} />
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
