'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComponentWithDashboardProps } from '@/types/dashboard';

import { MoreHorizontal } from 'lucide-react';

// Progress Bar Component
const ProgressBar = React.memo(
  ({
    label,
    current,
    total,
    color,
    showUnit = false,
    percentage = 0,
    barHeight = 'h-2',
    total_unit
  }: {
    label: string;
    current: number;
    total: number;
    color: string;
    showUnit?: boolean;
    percentage?: number;
    barHeight?: string;
    total_unit: number;
  }) => {
    const safeCurrent = Number.isFinite(current) ? current : 0;
    const safeTotalUnit = Number.isFinite(total_unit) ? total_unit : 0;
    const width = safeTotalUnit > 0 ? `${Math.min((safeCurrent / safeTotalUnit) * 100, 100)}%` : '0%';

    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-[15px] font-medium text-gray-700'>{label}</span>
          <span className='text-[15px] font-medium text-gray-500'>
            {safeCurrent.toLocaleString()}/{safeTotalUnit.toLocaleString()}
            {showUnit ? ' Unit' : ''}
          </span>
        </div>
        <div className={`w-full overflow-hidden rounded-full bg-gray-100 ${barHeight}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out`}
            style={{ width, backgroundColor: color }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Properti Section
export function PropertiSection({ dashboardData }: ComponentWithDashboardProps) {
  // Get transaksi by properti data from API
  const transaksiByPropertiData = dashboardData?.transaksiByProperti?.data;
  const isLoading = dashboardData?.isLoading.transaksiByProperti;

  // Transform API data to component format
  const propertiData = React.useMemo(() => {
    if (!transaksiByPropertiData?.chart_data || transaksiByPropertiData.chart_data.length === 0) {
      // Fallback data
      return [
        { label: 'HOONIAN Sigura-Gura', current: 0, total_unit: 0, total: 100, color: '#FF6384', percentage: 0 },
        { label: 'HOONIAN Bumi Palapa', current: 0, total_unit: 0, total: 100, color: '#36A2EB', percentage: 0 },
        { label: 'HOONIAN Bunga Kosmea', current: 0, total_unit: 0, total: 100, color: '#FFCE56', percentage: 0 },
        { label: 'HOONIAN Borobudur', current: 0, total_unit: 0, total: 100, color: '#4BC0C0', percentage: 0 },
        { label: 'RHUMA Arumba', current: 0, total_unit: 0, total: 100, color: '#9966FF', percentage: 0 }
      ];
    }

    // Calculate total for percentage calculation
    const totalTransaksi = transaksiByPropertiData.values.reduce((sum, value) => sum + value, 0);
    const maxTransaksi = Math.max(...transaksiByPropertiData.values) || 100;

    return transaksiByPropertiData.chart_data.map((item) => {
      const totalUnitValue = typeof item.total_unit === 'number' ? item.total_unit : 0;
      const currentValue = typeof item.value === 'number' ? item.value : 0;
      const percentageValue = typeof item.percentage === 'string' ? parseFloat(item.percentage.replace('%', '')) : 0;

      return {
        label: item.name,
        total_unit: totalUnitValue,
        current: currentValue,
        total: maxTransaksi, // Use max value as total for visual comparison
        color: item.color,
        percentage: Number.isFinite(percentageValue) ? percentageValue : 0
      };
    });
  }, [transaksiByPropertiData]);

  return (
    <Card className='w-full border-gray-200 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-lg font-semibold text-gray-900'>Properti</CardTitle>
        <MoreHorizontal className='h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600' />
      </CardHeader>
      <CardContent className='space-y-4 pt-2'>
        {isLoading
          ? // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='h-4 w-40 animate-pulse rounded bg-gray-300' />
                  <div className='h-4 w-16 animate-pulse rounded bg-gray-300' />
                </div>
                <div className='h-2 w-full animate-pulse rounded-full bg-gray-300' />
              </div>
            ))
          : propertiData.map((item, index) => <ProgressBar key={index} {...item} showUnit />)}

        {/* Map Visualization */}
        <div className='relative mt-6 h-[180px] overflow-hidden rounded-lg bg-gray-50'>
          <div className='absolute inset-0'>
            <svg viewBox='0 0 400 200' className='h-full w-full opacity-70'>
              {/* Dots pattern for world map */}
              <pattern id='dots' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
                <circle cx='2' cy='2' r='1' fill='#d1d5db' />
              </pattern>
              <rect width='100%' height='100%' fill='url(#dots)' />

              {/* Active region - dynamic based on highest value */}
              <circle cx='200' cy='100' r='40' fill='#10b981' fillOpacity='0.2' />
              <circle cx='200' cy='100' r='30' fill='#10b981' fillOpacity='0.3' />
              <circle cx='200' cy='100' r='20' fill='#10b981' fillOpacity='0.4' />

              {/* Dynamic Data points based on API data */}
              {!isLoading &&
                propertiData.slice(0, 5).map((item, index) => {
                  const positions = [
                    { x: 200, y: 100, r: 15 },
                    { x: 100, y: 80, r: 12 },
                    { x: 300, y: 90, r: 12 },
                    { x: 150, y: 150, r: 10 },
                    { x: 250, y: 140, r: 10 }
                  ];
                  const pos = positions[index] || { x: 200, y: 100, r: 10 };
                  const isHighest = index === 0; // First item is usually highest

                  return (
                    <g key={index} className='drop-shadow-sm'>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={pos.r}
                        fill={isHighest ? '#10b981' : item.color}
                        fillOpacity={isHighest ? 1 : 0.8}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor='middle'
                        fill='white'
                        className={index === 0 ? 'text-xs font-bold' : 'text-[10px] font-bold'}>
                        {item.current}
                      </text>
                    </g>
                  );
                })}

              {/* Loading state for map */}
              {isLoading && (
                <g className='drop-shadow-sm'>
                  <circle cx='200' cy='100' r='15' fill='#d1d5db' />
                  <text x='200' y='105' textAnchor='middle' fill='white' className='text-xs font-bold'>
                    --
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
