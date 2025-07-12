'use client';

import { PropertyDescription } from '@/blocks/properti/property-description';
import { PropertyFacilities } from '@/blocks/properti/property-facilities';
import { PropertyGallery } from '@/blocks/properti/property-gallery';
import { PropertyHeader } from '@/blocks/properti/property-header';
import { PropertyLocation } from '@/blocks/properti/property-location';
import { PropertyPriceSection } from '@/blocks/properti/property-price-section';
import { PropertySalesHistory } from '@/blocks/properti/property-sales-history';
import { PropertySlider } from '@/blocks/properti/property-slider';
import { Card, CardContent } from '@/components/ui/card';

export const PropertyContent = () => {
  return (
    <div className='flex-1 overflow-auto p-6'>
      <Card className='w-full bg-white shadow-sm'>
        {/* Hero Section with Overlapping Thumbnail */}
        <div className='relative'>
          <div className='mx-auto h-[600px] w-[96%] overflow-hidden p-0'>
            <PropertySlider
              images={[
                'https://placehold.co/1920x400/09bd3c/ffffff?text=Slide+1',
                'https://placehold.co/1920x400/2563eb/ffffff?text=Slide+2',
                'https://placehold.co/1920x400/dc2626/ffffff?text=Slide+3',
                'https://placehold.co/1920x400/7c3aed/ffffff?text=Slide+4'
              ]}
            />
          </div>

          {/* Overlapping Section */}
          <div className='relative'>
            {/* Overlapping Thumbnail */}
            <div className='absolute bottom-15 left-[90px] translate-y-1/2'>
              <div className='h-[220px] w-[200] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg'>
                <div
                  className='h-[100%] w-[100%] bg-gray-200'
                  style={{
                    backgroundImage: `url('https://placehold.co/300x300')`,
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
            <div className='col-span-3'>
              <PropertyHeader />
              <PropertyPriceSection />
              <PropertySalesHistory />
            </div>

            {/* Middle and Right Columns Combined */}
            <div className='col-span-9'>
              <div className='w-full'>
                <PropertyDescription />
                <PropertyGallery />
                <PropertyLocation />
                <PropertyFacilities />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
