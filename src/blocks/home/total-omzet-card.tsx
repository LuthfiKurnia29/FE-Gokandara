'use client';

import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { Bar, ComposedChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Custom Candlestick Shape Component
const CandlestickShape = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return <g />;

  const { open, high, low, close } = payload;

  // Calculate global min/max for proper scaling
  const globalMin = 0;
  const globalMax = 326;
  const range = globalMax - globalMin;

  const centerX = x + width / 2;
  const candleWidth = Math.min(width * 0.4, 6);

  // Scale function to map data values to pixel positions
  const scaleY = (value: number) => {
    const normalized = (value - globalMin) / range;
    return y + height - normalized * height;
  };

  const highY = scaleY(high);
  const lowY = scaleY(low);
  const openY = scaleY(open);
  const closeY = scaleY(close);

  // Determine if bullish (green) or bearish (red)
  const isBullish = close >= open;
  const candleColor = isBullish ? '#22c55e' : '#ef4444';

  // For candlestick body positioning:
  // Bullish: body from open (bottom) to close (top)
  // Bearish: body from close (bottom) to open (top)
  const bodyTop = isBullish ? closeY : openY;
  const bodyBottom = isBullish ? openY : closeY;
  const bodyHeight = Math.abs(bodyBottom - bodyTop) || 2;

  return (
    <g>
      {/* Wick line - from high to low */}
      <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={candleColor} strokeWidth='1' />

      {/* Body rectangle */}
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

export default function TotalOmzetCard() {
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

  // Calculate the overall min and max values for proper Y-axis domain
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

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='mb-6 flex items-start justify-between'>
        <div className='space-y-1'>
          <h2 className='font-sf-pro text-[20px] leading-[28px] font-semibold tracking-[-0.01em] text-gray-900'>
            Total Omzet
          </h2>
        </div>
        <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
      </div>

      {/* Revenue Display */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='text-4xl font-bold text-gray-900'>Rp 00.000.000.000</div>
            <div className='text-sm text-gray-500'>bulan lalu Rp 0,00 M</div>
          </div>

          {/* Trend Indicator */}
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              <svg width='60' height='30' viewBox='0 0 60 30' className='text-green-500'>
                <path d='M5,25 Q15,15 25,18 T45,12 T55,8' stroke='currentColor' strokeWidth='2' fill='none' />
                <path d='M5,25 Q15,15 25,18 T45,12 T55,8 L55,30 L5,30 Z' fill='currentColor' fillOpacity='0.1' />
              </svg>
            </div>
            <div className='flex items-center space-x-1 text-green-500'>
              <span className='text-lg font-semibold'>7%</span>
              <TrendingUp className='h-4 w-4' />
            </div>
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className='mt-8 h-64'>
          <ChartContainer config={chartConfig} className='h-full w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={candlestickData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis
                  dataKey='period'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  className='text-gray-400'
                />
                <YAxis
                  domain={yAxisDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  className='text-gray-400'
                  width={60}
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
      </div>
    </div>
  );
}
