'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getRealisasi } from '@/services/realisasi';
import { useQuery } from '@tanstack/react-query';

const RealisasiComponent = React.memo(() => {
  const {
    data: realisasiData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['realisasi'],
    queryFn: getRealisasi
  });

  const calculateProgress = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
  };

  if (isLoading) {
    return (
      <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <CardHeader className='pb-4'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>Realisasi</h1>
            <p className='text-sm leading-relaxed text-gray-500'>Memuat data realisasi...</p>
          </div>
        </CardHeader>
        <CardContent className='space-y-6 px-6 pb-6'>
          <div className='animate-pulse space-y-6'>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='h-5 w-24 rounded bg-gray-200'></div>
                  <div className='h-4 w-16 rounded bg-gray-200'></div>
                </div>
                <div className='h-2 w-full rounded-full bg-gray-200'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <CardHeader className='pb-4'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>Realisasi</h1>
            <p className='text-sm leading-relaxed text-red-500'>Terjadi kesalahan saat memuat data</p>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!realisasiData) {
    return null;
  }

  return (
    <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='pb-4'>
        <div>
          <h1 className='mb-2 text-2xl font-bold text-gray-900'>Realisasi</h1>
          <p className='text-sm leading-relaxed text-gray-500'>
            Progress realisasi target penjualan berdasarkan periode
          </p>
        </div>
      </CardHeader>

      <CardContent className='space-y-6 px-6 pb-6'>
        {/* Hari Ini */}
        <div>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Hari Ini</h3>
            <span className='text-sm text-gray-400'>
              {formatNumber(realisasiData.penjualan.hari_ini)}/{formatNumber(realisasiData.target.hari_ini)}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-orange-400 transition-all duration-300'
              style={{
                width: `${calculateProgress(realisasiData.penjualan.hari_ini, realisasiData.target.hari_ini)}%`
              }}></div>
          </div>
        </div>

        {/* Minggu Ini */}
        <div>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Minggu Ini</h3>
            <span className='text-sm text-gray-400'>
              {formatNumber(realisasiData.penjualan.minggu_ini)}/{formatNumber(realisasiData.target.minggu_ini)}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-orange-400 transition-all duration-300'
              style={{
                width: `${calculateProgress(realisasiData.penjualan.minggu_ini, realisasiData.target.minggu_ini)}%`
              }}></div>
          </div>
        </div>

        {/* Bulan Ini */}
        <div>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Bulan Ini</h3>
            <span className='text-sm text-gray-400'>
              {formatNumber(realisasiData.penjualan.bulan_ini)}/{formatNumber(realisasiData.target.bulan_ini)}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-orange-400 transition-all duration-300'
              style={{
                width: `${calculateProgress(realisasiData.penjualan.bulan_ini, realisasiData.target.bulan_ini)}%`
              }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

RealisasiComponent.displayName = 'RealisasiComponent';

export { RealisasiComponent };
