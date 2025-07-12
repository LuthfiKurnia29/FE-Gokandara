'use client';

import { useMemo } from 'react';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/ui/map'), {
  loading: () => <div className='h-[400px] w-full animate-pulse rounded-lg bg-gray-100' />,
  ssr: false
});

export const PropertyLocation = () => {
  const mapProps = useMemo(
    () => ({
      center: [-6.2088, 106.8456] as [number, number],
      address: 'Jl. ****, Kec. ****, Kab. ****, **** 12345'
    }),
    []
  );

  return (
    <section className='mb-8'>
      <h2 className='mb-4 text-2xl font-bold text-gray-800'>Lokasi</h2>
      <div className='h-[400px] w-full'>
        <MapComponent key='property-location-map' center={mapProps.center} address={mapProps.address} />
      </div>
    </section>
  );
};
