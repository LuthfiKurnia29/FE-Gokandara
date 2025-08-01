'use client';

import { useMemo } from 'react';

import dynamic from 'next/dynamic';

import { PropertyData } from '@/types/properti';

const MapComponent = dynamic(() => import('@/components/ui/map'), {
  loading: () => <div className='h-[400px] w-full animate-pulse rounded-lg bg-gray-100' />,
  ssr: false
});

interface PropertyLocationProps {
  property?: PropertyData;
}

export const PropertyLocation = ({ property }: PropertyLocationProps) => {
  const propertyLocation = property?.lokasi || 'Lokasi tidak tersedia';

  // Default coordinates for Jakarta (you can add lat/lng fields to property data later)
  const defaultCoordinates: [number, number] = [-6.2088, 106.8456];

  const mapProps = useMemo(
    () => ({
      center: defaultCoordinates,
      address: propertyLocation
    }),
    [propertyLocation]
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
