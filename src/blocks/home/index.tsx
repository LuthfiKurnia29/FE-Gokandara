'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { MoreHorizontal, Star, TrendingUp } from 'lucide-react';

// Metric Card Component
const MetricCard = React.memo(
  ({ title, value, color, progress }: { title: string; value: string; color: string; progress: number }) => (
    <Card className={`${color} border-0 text-white`}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm opacity-90'>{title}</p>
            <p className='text-3xl font-bold'>{value}</p>
          </div>
          <div className='relative h-16 w-16'>
            <svg className='h-16 w-16 -rotate-90 transform' viewBox='0 0 36 36'>
              <path
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                fill='none'
                stroke='rgba(255,255,255,0.2)'
                strokeWidth='2'
              />
              <path
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                fill='none'
                stroke='white'
                strokeWidth='2'
                strokeDasharray={`${progress}, 100`}
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

MetricCard.displayName = 'MetricCard';

// Progress Bar Component
const ProgressBar = React.memo(
  ({ label, current, total, color }: { label: string; current: number; total: number; color: string }) => {
    const percentage = (current / total) * 100;

    return (
      <div className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span>{label}</span>
          <span>
            {current}/{total}
          </span>
        </div>
        <div className='h-2 w-full rounded-full bg-gray-200'>
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Customer Card Component
const CustomerCard = React.memo(
  ({ name, timeAgo, rating, description }: { name: string; timeAgo: string; rating: number; description: string }) => (
    <div className='flex space-x-3 rounded-lg border p-4'>
      <Avatar>
        <AvatarImage src='/placeholder.svg?height=40&width=40' />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex-1 space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='font-medium'>{name}</h4>
          <span className='text-xs text-gray-500'>{timeAgo}</span>
        </div>
        <div className='flex items-center space-x-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <p className='line-clamp-3 text-sm text-gray-600'>{description}</p>
      </div>
    </div>
  )
);

CustomerCard.displayName = 'CustomerCard';

const HomePage = React.memo(() => {
  const metricCards = [
    { title: 'Follow up Hari Ini', value: '00', color: 'bg-blue-500', progress: 0 },
    { title: 'Follow up Besok', value: '00', color: 'bg-green-500', progress: 0 },
    { title: 'Konsumen Prospek', value: '00', color: 'bg-orange-500', progress: 0 },
    { title: 'Konsumen Baru', value: '00', color: 'bg-gray-600', progress: 0 }
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
    { label: 'Lorem Ipsum', value: 20, color: 'text-blue-500' },
    { label: 'Lorem Ipsum', value: 40, color: 'text-green-500' },
    { label: 'Lorem Ipsum', value: 15, color: 'text-orange-500' },
    { label: 'Lorem Ipsum', value: 15, color: 'text-gray-500' }
  ];

  // Bar chart heights for Total Omzet (to avoid hydration error)
  const [barHeights, setBarHeights] = React.useState<number[] | null>(null);
  React.useEffect(() => {
    setBarHeights(Array.from({ length: 15 }, () => Math.random() * 80 + 20));
  }, []);

  return (
    <div className='min-h-screen space-y-6 bg-gray-50 p-6'>
      {/* Top Metric Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metricCards.map((card, index) => (
          <MetricCard key={index} title={card.title} value={card.value} color={card.color} progress={card.progress} />
        ))}
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Total Omzet Section */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Total Omzet</CardTitle>
              <MoreHorizontal className='h-5 w-5 text-gray-400' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-3xl font-bold'>Rp 00.000.000.000</span>
                  <Badge variant='secondary' className='text-green-600'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    7%
                  </Badge>
                </div>
                <p className='text-sm text-gray-500'>bulan lalu Rp 0.00 M</p>

                {/* Bar Chart */}
                <div className='flex h-32 items-end space-x-1'>
                  {barHeights === null
                    ? null
                    : barHeights.map((height, i) => (
                        <div key={i} className='flex-1 rounded-t bg-orange-400' style={{ height: `${height}%` }} />
                      ))}
                </div>
                <div className='flex justify-between text-xs text-gray-500'>
                  <span>06</span>
                  <span>07</span>
                  <span>08</span>
                  <span>09</span>
                  <span>10</span>
                  <span>11</span>
                  <span>12</span>
                  <span>13</span>
                  <span>14</span>
                  <span>15</span>
                  <span>16</span>
                  <span>17</span>
                  <span>18</span>
                  <span>19</span>
                  <span>20</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Konsumen Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Konsumen</CardTitle>
            <p className='text-sm text-gray-500'>Lorem ipsum dolor sit amet consectetur adipiscing elit psu dor</p>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Pie Chart */}
              <div className='relative mx-auto h-32 w-32'>
                <svg className='h-32 w-32 -rotate-90 transform' viewBox='0 0 36 36'>
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#e5e7eb'
                    strokeWidth='3'
                  />
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#3b82f6'
                    strokeWidth='3'
                    strokeDasharray='20, 100'
                  />
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#10b981'
                    strokeWidth='3'
                    strokeDasharray='40, 100'
                    strokeDashoffset='-20'
                  />
                  <path
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='#f59e0b'
                    strokeWidth='3'
                    strokeDasharray='15, 100'
                    strokeDashoffset='-60'
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className='space-y-2'>
                {pieChartData.map((item, index) => (
                  <div key={index} className='flex items-center justify-between text-sm'>
                    <div className='flex items-center space-x-2'>
                      <div className={`h-3 w-3 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                      <span>{item.label}</span>
                    </div>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Realisasi Section */}
        <Card>
          <CardHeader>
            <CardTitle>Realisasi</CardTitle>
            <p className='text-sm text-gray-500'>Lorem ipsum dolor sit amet consectetur adipiscing elit psu dor</p>
          </CardHeader>
          <CardContent className='space-y-4'>
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
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Properti</CardTitle>
            <MoreHorizontal className='h-5 w-5 text-gray-400' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {propertiData.map((item, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='font-medium'>{item.name}</span>
                  <span>
                    {item.progress}/{item.total} Unit
                  </span>
                </div>
                <div className='h-2 w-full rounded-full bg-gray-200'>
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.progress / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Map Visualization */}
            <div className='relative mt-6 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
              <div className='absolute inset-0 opacity-20'>
                <svg viewBox='0 0 200 100' className='h-full w-full'>
                  <circle cx='50' cy='30' r='8' fill='#10b981' />
                  <text x='50' y='35' textAnchor='middle' className='fill-white text-xs'>
                    224
                  </text>

                  <circle cx='120' cy='25' r='6' fill='#6b7280' />
                  <text x='120' y='29' textAnchor='middle' className='fill-white text-xs'>
                    532
                  </text>

                  <circle cx='160' cy='40' r='6' fill='#6b7280' />
                  <text x='160' y='44' textAnchor='middle' className='fill-white text-xs'>
                    653
                  </text>

                  <circle cx='80' cy='60' r='5' fill='#6b7280' />
                  <text x='80' y='64' textAnchor='middle' className='fill-white text-xs'>
                    567
                  </text>

                  <circle cx='30' cy='70' r='4' fill='#6b7280' />
                  <text x='30' y='74' textAnchor='middle' className='fill-white text-xs'>
                    234
                  </text>

                  <circle cx='170' cy='75' r='4' fill='#6b7280' />
                  <text x='170' y='79' textAnchor='middle' className='fill-white text-xs'>
                    234
                  </text>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Section */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Ringkasan</CardTitle>
            <MoreHorizontal className='h-5 w-5 text-gray-400' />
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Circular Progress Indicators */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center'>
                <div className='relative mx-auto mb-2 h-16 w-16'>
                  <svg className='h-16 w-16 -rotate-90 transform' viewBox='0 0 36 36'>
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#e5e7eb'
                      strokeWidth='3'
                    />
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#ef4444'
                      strokeWidth='3'
                      strokeDasharray='0, 100'
                    />
                  </svg>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-lg font-bold'>00</span>
                  </div>
                </div>
                <p className='text-xs text-gray-500'>Unit Terjual</p>
                <p className='text-xs text-red-500'>0.0%</p>
                <p className='text-xs text-gray-400'>Target 00/bulan</p>
              </div>

              <div className='text-center'>
                <div className='relative mx-auto mb-2 h-16 w-16'>
                  <svg className='h-16 w-16 -rotate-90 transform' viewBox='0 0 36 36'>
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#e5e7eb'
                      strokeWidth='3'
                    />
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#10b981'
                      strokeWidth='3'
                      strokeDasharray='0, 100'
                    />
                  </svg>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-lg font-bold'>00</span>
                  </div>
                </div>
                <p className='text-xs text-gray-500'>Unit Diproses</p>
                <p className='text-xs text-green-500'>0.0%</p>
                <p className='text-xs text-gray-400'>Target 00/bulan</p>
              </div>
            </div>

            {/* Chart Area */}
            <div className='relative h-32'>
              <svg viewBox='0 0 300 100' className='h-full w-full'>
                {/* Grid lines */}
                <defs>
                  <pattern id='grid' width='30' height='20' patternUnits='userSpaceOnUse'>
                    <path d='M 30 0 L 0 0 0 20' fill='none' stroke='#f3f4f6' strokeWidth='1' />
                  </pattern>
                </defs>
                <rect width='100%' height='100%' fill='url(#grid)' />

                {/* Chart lines */}
                <path d='M 0 80 Q 50 60 100 70 T 200 50 T 300 40' fill='none' stroke='#ef4444' strokeWidth='2' />
                <path d='M 0 90 Q 50 85 100 80 T 200 75 T 300 70' fill='none' stroke='#10b981' strokeWidth='2' />

                {/* Fill areas */}
                <path d='M 0 80 Q 50 60 100 70 T 200 50 T 300 40 L 300 100 L 0 100 Z' fill='rgba(239, 68, 68, 0.1)' />
                <path d='M 0 90 Q 50 85 100 80 T 200 75 T 300 70 L 300 100 L 0 100 Z' fill='rgba(16, 185, 129, 0.1)' />
              </svg>

              {/* Legend */}
              <div className='absolute top-2 left-2 space-y-1'>
                <div className='flex items-center space-x-2 text-xs'>
                  <div className='h-3 w-3 rounded-full bg-green-500' />
                  <span>00 Diproses</span>
                </div>
                <div className='flex items-center space-x-2 text-xs'>
                  <div className='h-3 w-3 rounded-full bg-red-500' />
                  <span>00 Terjual</span>
                </div>
              </div>
            </div>

            {/* Month indicators */}
            <div className='flex justify-between text-xs text-gray-500'>
              <span>April</span>
              <span>Mei</span>
              <span>Juni</span>
              <span>Juli</span>
              <span>Agustus</span>
              <span>September</span>
              <span>Oktober</span>
              <span className='font-medium text-gray-900'>November</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Konsumen Prospek Section */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Konsumen Prospek</CardTitle>
          <MoreHorizontal className='h-5 w-5 text-gray-400' />
        </CardHeader>
        <CardContent>
          <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
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
          <Button className='w-full bg-orange-500 hover:bg-orange-600'>Lihat Lebih Banyak</Button>
        </CardContent>
      </Card>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
