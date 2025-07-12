'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

import { ChevronRight } from 'lucide-react';

export const PropertyGallery = () => {
  const [api, setApi] = useState<any>();

  const scrollNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

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
            {[1, 2, 3, 4, 5].map((_, index) => (
              <CarouselItem key={index} className='basis-full pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3'>
                <div className='h-48 w-full flex-shrink-0 rounded-lg bg-gray-300'></div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <Button
            variant='ghost'
            size='icon'
            onClick={scrollNext}
            className='absolute top-1/2 -right-4 h-[40px] w-[40px] -translate-y-1/2 rounded-full bg-white shadow-md hover:bg-gray-100'>
            <ChevronRight className='h-6 w-6 text-gray-600' />
          </Button>
        </Carousel>
      </div>
    </section>
  );
};
