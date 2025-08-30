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
import { usePropertyById } from '@/services/properti';
import { useAllProperti } from '@/services/properti';
import { PropertyData } from '@/types/properti';

interface PropertyContentProps {
  propertyId: string;
}

export const PropertyContent = memo(function PropertyContent({ propertyId }: PropertyContentProps) {
  // Get project name from all properties (like sidebar)
  const { data: allProperties = [] } = useAllProperti();
  const propertyFromList = allProperties.find((p) => p.id === parseInt(propertyId));

  // Get detailed data including images from property by ID
  const { data: propertyById, isLoading, error } = usePropertyById(parseInt(propertyId), ['projek', 'properti_gambar']);

  // Combine data: project name from list, detailed data from byId
  const finalProperty = propertyById
    ? {
        ...propertyById,
        // Use project name from all properties if available (like sidebar)
        projek: propertyFromList?.projek || propertyById.projek
      }
    : propertyFromList;

  // Extract images from property data
  const propertyImages = useMemo(() => {
    if (!finalProperty?.properti_gambar || !Array.isArray(finalProperty.properti_gambar)) {
      return [];
    }

    return finalProperty.properti_gambar
      .map((img: any) => {
        // Handle different image URL formats from API
        return img.image_url || img.image || '';
      })
      .filter(Boolean); // Remove empty strings
  }, [finalProperty?.properti_gambar]);

  // Fallback image if no images available
  const fallbackImage = 'https://placehold.co/1920x400/09bd3c/ffffff?text=No+Image+Available';

  // Use property images or fallback
  const sliderImages = propertyImages.length > 0 ? propertyImages : [fallbackImage];

  // Thumbnail image (first image or fallback)
  const thumbnailImage = propertyImages.length > 0 ? propertyImages[0] : fallbackImage;

  // Show loading skeleton
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

  // Show error state
  if (!finalProperty && error) {
    return (
      <div className='flex-1 overflow-auto p-6'>
        <Card className='w-full bg-white shadow-sm'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold text-red-600'>Error Loading Property</h2>
              <p className='mt-2 text-gray-600'>
                {error instanceof Error ? error.message : 'Failed to load property data'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show property content
  return (
    <div className='flex-1 overflow-auto p-6'>
      <Card className='w-full bg-white shadow-sm'>
        {/* Hero Section with Overlapping Thumbnail */}
        <div className='relative'>
          <div className='mx-auto h-[600px] w-[96%] overflow-hidden p-0'>
            <PropertySlider images={sliderImages} property={finalProperty} />
          </div>

          {/* Overlapping Section */}
          <div className='relative'>
            {/* Overlapping Thumbnail */}
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
            {/* Left Column */}
            <div className='col-span-12 lg:col-span-4 xl:col-span-3'>
              <PropertyHeader property={finalProperty} />
              <PropertyPriceSection property={finalProperty} />
              {/* <PropertySalesHistory property={finalProperty} /> */}
            </div>

            {/* Middle and Right Columns Combined */}
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

// Export all property components
export { PropertyDescription } from './property-description';
export { PropertyFacilities } from './property-facilities';
export { PropertyGallery } from './property-gallery';
export { PropertyHeader } from './property-header';
export { PropertyLocation } from './property-location';
export { PropertyPriceSection } from './property-price-section';
export { PropertySalesHistory } from './property-sales-history';
export { PropertySlider } from './property-slider';
