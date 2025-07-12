'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

import { MoreVertical, TrendingUp } from 'lucide-react';
import { Bar, ComposedChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Custom Candlestick Shape Component
const CandlestickShape = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return <g />;

  const { open, high, low, close } = payload;
  const globalMin = 0;
  const globalMax = 326;
  const range = globalMax - globalMin;
  const centerX = x + width / 2;
  const candleWidth = Math.min(width * 0.4, 6);

  const scaleY = (value: number) => {
    const normalized = (value - globalMin) / range;
    return y + height - normalized * height;
  };

  const highY = scaleY(high);
  const lowY = scaleY(low);
  const openY = scaleY(open);
  const closeY = scaleY(close);

  const isBullish = close >= open;
  const candleColor = isBullish ? '#22c55e' : '#ef4444';

  const bodyTop = isBullish ? closeY : openY;
  const bodyBottom = isBullish ? openY : closeY;
  const bodyHeight = Math.abs(bodyBottom - bodyTop) || 2;

  return (
    <g>
      <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={candleColor} strokeWidth='1' />
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={candleColor}
        stroke={candleColor}
        strokeWidth='1'
        rx='2'
      />
    </g>
  );
};

type TimePeriod = 'harian' | 'mingguan' | 'bulanan';

export const TotalOmzetComponent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('bulanan');

  const candlestickData = [
    { period: '06', open: 100, high: 300, low: 100, close: 260 },
    { period: '07', open: 160, high: 220, low: 0, close: 240 },
    { period: '08', open: 140, high: 290, low: 20, close: 270 },
    { period: '09', open: 170, high: 210, low: 90, close: 300 },
    { period: '10', open: 100, high: 270, low: 60, close: 180 },
    { period: '11', open: 180, high: 200, low: 80, close: 290 },
    { period: '12', open: 190, high: 260, low: 40, close: 150 },
    { period: '13', open: 150, high: 290, low: 70, close: 280 },
    { period: '14', open: 180, high: 250, low: 30, close: 140 },
    { period: '15', open: 140, high: 280, low: 60, close: 270 },
    { period: '16', open: 170, high: 220, low: 0, close: 310 },
    { period: '17', open: 110, high: 270, low: 50, close: 160 },
    { period: '18', open: 160, high: 200, low: 80, close: 290 },
    { period: '19', open: 190, high: 290, low: 70, close: 280 },
    { period: '20', open: 180, high: 260, low: 40, close: 150 }
  ];

  const allValues = candlestickData.flatMap((d) => [d.open, d.high, d.low, d.close]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.05;
  const yAxisDomain = [Math.max(0, Math.floor(minValue - padding)), Math.ceil(maxValue + padding)];

  const chartConfig = {
    high: {
      label: 'Price Range',
      color: '#f97316'
    }
  };

  const tabs = [
    { id: 'harian' as TimePeriod, label: 'Harian' },
    { id: 'mingguan' as TimePeriod, label: 'Mingguan' },
    { id: 'bulanan' as TimePeriod, label: 'Bulanan' }
  ];

  return (
    <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-bold text-gray-900'>Total Omzet</h2>
          <div className='flex items-center gap-4'>
            {/* Time Period Tabs */}
            <div className='flex items-center gap-6'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPeriod(tab.id)}
                  className={`relative pb-1 text-sm font-medium transition-colors ${
                    selectedPeriod === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label}
                  {selectedPeriod === tab.id && (
                    <div className='absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-gray-900' />
                  )}
                </button>
              ))}
            </div>
            <MoreVertical className='h-4 w-4 text-gray-600' />
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6 px-6 pb-6'>
        {/* Revenue Display */}
        <div className='space-y-4'>
          <div className='text-3xl font-bold text-gray-900'>Rp 00.000.000.000</div>
          <div className='flex items-center justify-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
              <TrendingUp className='h-3 w-3 text-white' />
            </div>
            <span className='text-lg font-semibold text-green-500'>0,0%</span>
            <span className='text-sm text-gray-500'>dibanding pekan terakhir</span>
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className='h-48'>
          <ChartContainer config={chartConfig} className='h-full w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={candlestickData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <XAxis
                  dataKey='period'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  interval={1}
                />
                <YAxis
                  domain={yAxisDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  width={50}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className='rounded-lg border bg-white p-3 shadow-lg'>
                          <p className='font-medium'>{`Period: ${label}`}</p>
                          <p className='text-sm text-gray-600'>{`Open: ${data.open}`}</p>
                          <p className='text-sm text-gray-600'>{`High: ${data.high}`}</p>
                          <p className='text-sm text-gray-600'>{`Low: ${data.low}`}</p>
                          <p className='text-sm text-gray-600'>{`Close: ${data.close}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey='high' shape={CandlestickShape} fill='transparent' />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
