'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { PropertyData } from '@/types/properti';

import { ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  property?: PropertyData;
}

export const PropertyGallery = ({ property }: PropertyGalleryProps) => {
  const [api, setApi] = useState<any>();

  const scrollNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

  // Extract images from property data
  const propertyImages = useMemo(() => {
    if (!property?.properti_gambar || !Array.isArray(property.properti_gambar)) {
      return [];
    }

    return property.properti_gambar
      .map((img: any) => {
        const url = img.gambar_url || img.image_url || img.image || '';
        if (!url) return '';
        return typeof url === 'string' && url.startsWith('http')
          ? url
          : `${process.env.NEXT_PUBLIC_API_URL ?? ''}${url}`;
      })
      .filter(Boolean);
  }, [property?.properti_gambar]);

  // Fallback images if no property images available
  const fallbackImages = [
    'https://placehold.co/400x300/09bd3c/ffffff?text=No+Image+1',
    'https://placehold.co/400x300/2563eb/ffffff?text=No+Image+2',
    'https://placehold.co/400x300/dc2626/ffffff?text=No+Image+3'
  ];

  const galleryImages = propertyImages.length > 0 ? propertyImages : fallbackImages;

  return (
    <section className='mb-8'>
      <h2 className='mb-4 text-2xl font-bold text-gray-800'>Galeri</h2>
      <div className='relative'>
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true
          }}
          className='w-full'>
          <CarouselContent className='-ml-2 md:-ml-4'>
            {galleryImages.map((image, index) => (
              <CarouselItem key={index} className='basis-full pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3'>
                <div
                  className='h-48 w-full flex-shrink-0 rounded-lg bg-gray-300'
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {galleryImages.length > 3 && (
            <Button
              variant='ghost'
              size='icon'
              onClick={scrollNext}
              className='absolute top-1/2 -right-4 h-[40px] w-[40px] -translate-y-1/2 rounded-full bg-white shadow-md hover:bg-gray-100'>
              <ChevronRight className='h-6 w-6 text-gray-600' />
            </Button>
          )}
        </Carousel>
      </div>
    </section>
  );
};
