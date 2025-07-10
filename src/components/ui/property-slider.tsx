import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import type { Options, Splide as SplideType } from '@splidejs/splide';

import { Bath, Bed, Wifi } from 'lucide-react';

interface PropertySliderProps {
  images: string[];
  currentIndex?: number;
  totalImages?: number;
}

export function PropertySlider({ images, currentIndex = 1, totalImages = 4 }: PropertySliderProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex - 1);
  const splideRef = useRef<SplideType | null>(null);

  const options = {
    type: 'fade' as const,
    rewind: true,
    pagination: false,
    arrows: false,
    drag: true,
    autoplay: false,
    height: '100%',
    width: '100%',
    speed: 800
  } as const;

  const handleMounted = (splide: SplideType) => {
    splideRef.current = splide;
    setActiveIndex(splide.index);
  };

  const handlePaginationClick = (index: number) => {
    if (splideRef.current) {
      splideRef.current.go(index);
    }
  };

  return (
    <div className='relative h-full w-full'>
      <Splide
        hasTrack={false}
        options={options}
        onMounted={handleMounted}
        onMoved={(splide: SplideType) => setActiveIndex(splide.index)}
        aria-label='Property Images'>
        <div className='relative'>
          <SplideTrack>
            {images.map((image, index) => (
              <SplideSlide key={index}>
                <div className='relative h-[400px] w-full'>
                  <img src={image} alt={`Property Image ${index + 1}`} className='h-full w-full object-cover' />
                </div>
              </SplideSlide>
            ))}
          </SplideTrack>

          <div className='absolute bottom-0 left-0 z-10 h-[200px] w-full bg-gradient-to-t from-black/95 to-transparent' />

          <div className='absolute bottom-10 left-[340px] z-20 flex flex-col gap-4'>
            <h1 className='text-2xl font-bold text-white'>HOONIAN Sigura-Gura</h1>
            <div className='flex items-center gap-6 text-white'>
              <div className='flex items-center gap-2'>
                <Bed className='h-5 w-5' />
                <span>0 Kamar Tidur</span>
              </div>
              <div className='flex items-center gap-2'>
                <Bath className='h-5 w-5' />
                <span>0 Kamar Mandi</span>
              </div>
              <div className='flex items-center gap-2'>
                <Wifi className='h-5 w-5' />
                <span>Wifi Available</span>
              </div>
            </div>
          </div>

          <div className='absolute right-10 bottom-10 z-20 flex items-center gap-6'>
            <span className='text-sm text-white'>
              {activeIndex + 1} dari {images.length}
            </span>
            <div className='flex items-center gap-2'>
              {images.map((_, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => handlePaginationClick(index)}
                  className={`h-1 w-8 cursor-pointer rounded-full transition-colors duration-200 hover:bg-white ${
                    index === activeIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  role='tab'
                  aria-selected={index === activeIndex}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
        </div>
      </Splide>
    </div>
  );
}
