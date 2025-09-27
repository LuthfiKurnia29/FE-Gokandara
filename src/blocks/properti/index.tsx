'use client';

import { memo, useMemo } from 'react';

import { PropertyDescription } from '@/blocks/properti/property-description';
import { PropertyFacilities } from '@/blocks/properti/property-facilities';
import { PropertyGallery } from '@/blocks/properti/property-gallery';
import { PropertyHeader } from '@/blocks/properti/property-header';
import { PropertyLocation } from '@/blocks/properti/property-location';
import { PropertyPriceSection } from '@/blocks/properti/property-price-section';
import { PropertySalesHistory } from '@/blocks/properti/property-sales-history';
import { PropertySlider } from '@/blocks/properti/property-slider';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getProjekGambars, useProjekById } from '@/services/projek';
import { PropertyData } from '@/types/properti';
import { useQuery } from '@tanstack/react-query';

interface PropertyContentProps {
  propertyId: string;
}

export const PropertyContent = memo(function PropertyContent({ propertyId }: PropertyContentProps) {
  const projekId = parseInt(propertyId);

  const { data: projek, isLoading, error } = useProjekById(projekId || null);

  const { data: projekImages = [] } = useQuery({
    queryKey: ['/projek', projekId, 'gambars'],
    queryFn: () => getProjekGambars(projekId),
    enabled: !!projekId
  });

  const finalProperty: PropertyData | any = projek
    ? {
        id: projek.id,
        projek: { id: projek.id, name: projek.name },
        lokasi: (projek as any)?.alamat || '-',
        harga: (projek as any)?.harga || 0,
        jumlah_kavling: (projek as any)?.jumlah_kavling || 0,
        fasilitas: (projek as any)?.fasilitas || [],
        properti_gambar: Array.isArray(projekImages)
          ? projekImages.map((img: any) => ({
              id: img.id ?? 0,
              properti_id: projek.id,
              image: img.gambar_url || img.image_url || img.image || '',
              image_url: img.gambar_url || img.image_url || img.image || '',
              created_at: '',
              updated_at: ''
            }))
          : []
      }
    : null;

  const propertyImages = useMemo(() => {
    if (!finalProperty?.properti_gambar || !Array.isArray(finalProperty.properti_gambar)) {
      return [];
    }

    return finalProperty.properti_gambar
      .map((img: any) => {
        const url = img.gambar_url || img.image_url || img.image || '';
        if (!url) return '';
        return typeof url === 'string' && url.startsWith('http')
          ? url
          : `${process.env.NEXT_PUBLIC_API_URL ?? ''}${url}`;
      })
      .filter(Boolean);
  }, [finalProperty?.properti_gambar]);

  const fallbackImage = 'https://placehold.co/1920x400/09bd3c/ffffff?text=No+Image+Available';

  const sliderImages = propertyImages.length > 0 ? propertyImages : [fallbackImage];

  const thumbnailImage = propertyImages.length > 0 ? propertyImages[0] : fallbackImage;

  if (!finalProperty && isLoading) {
    return (
      <div className='flex-1 overflow-auto p-6'>
        <Card className='w-full bg-white shadow-sm'>
          <div className='relative'>
            <div className='mx-auto h-[600px] w-[96%] overflow-hidden p-0'>
              <Skeleton className='h-full w-full rounded-[30px]' />
            </div>
          </div>
          <CardContent className='p-6'>
            <div className='grid grid-cols-12 gap-6 pt-24'>
              <div className='col-span-3 space-y-4'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-24 w-full' />
              </div>
              <div className='col-span-9 space-y-4'>
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-48 w-full' />
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-32 w-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!finalProperty && error) {
    return (
      <div className='flex-1 overflow-auto p-6'>
        <Card className='w-full bg-white shadow-sm'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold text-red-600'>Error Loading Project</h2>
              <p className='mt-2 text-gray-600'>
                {error instanceof Error ? error.message : 'Failed to load project data'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-auto p-6'>
      <Card className='w-full bg-white shadow-sm'>
        <div className='relative'>
          <div className='mx-auto h-[600px] w-[96%] overflow-hidden p-0'>
            <PropertySlider images={sliderImages} property={finalProperty} />
          </div>
          <div className='relative'>
            <div className='absolute bottom-15 left-[90px] translate-y-1/2'>
              <div className='h-[220px] w-[200px] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg'>
                <div
                  className='h-full w-full bg-gray-200'
                  style={{
                    backgroundImage: `url('${thumbnailImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <CardContent className='p-6'>
          <div className='grid grid-cols-12 gap-6 pt-24'>
            <div className='col-span-12 lg:col-span-4 xl:col-span-3'>
              <PropertyHeader property={finalProperty} />
              <PropertyPriceSection property={finalProperty} />
            </div>

            <div className='col-span-12 lg:col-span-8 xl:col-span-9'>
              <div className='w-full'>
                <PropertyDescription property={finalProperty} />
                <PropertyGallery property={finalProperty} />
                <PropertyLocation property={finalProperty} />
                <PropertyFacilities property={finalProperty} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { PropertyDescription } from './property-description';
export { PropertyFacilities } from './property-facilities';
export { PropertyGallery } from './property-gallery';
export { PropertyHeader } from './property-header';
export { PropertyLocation } from './property-location';
export { PropertyPriceSection } from './property-price-section';
export { PropertySalesHistory } from './property-sales-history';
export { PropertySlider } from './property-slider';
