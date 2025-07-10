import { useRef, useState } from 'react';

import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import type { Options } from '@splidejs/splide';

import { Button } from '../../components/ui/button';
import { Bath, Bed, Wifi } from 'lucide-react';

interface PropertySliderProps {
  images: string[];
}

export function PropertySlider({ images }: PropertySliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const splideRef = useRef<any>(null);

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
  };

  const handleMounted = (splide: any) => {
    splideRef.current = splide;
    setActiveIndex(splide.index);
  };

  const handleMove = (splide: any) => {
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
        onMove={handleMove}
        className='h-full w-full'>
        <div className='relative h-full w-full'>
          <SplideTrack className='h-full w-full'>
            {images.map((image, index) => (
              <SplideSlide key={index} className='relative h-full w-full'>
                {/* Image */}
                <div
                  className='absolute inset-0 h-full w-full'
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </SplideSlide>
            ))}
          </SplideTrack>

          {/* Status Button */}
          <div className='absolute top-6 right-6'>
            <Button className='rounded-full bg-[#09bd3c] px-6 text-sm font-medium text-white hover:bg-[#09bd3c]/90'>
              Tersedia
            </Button>
          </div>

          {/* Bottom Gradient */}
          <div
            className='absolute right-0 bottom-0 left-0 h-[200px]'
            style={{
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 1) 100%)'
            }}
          />

          {/* Property Info Overlay */}
          <div className='absolute bottom-10 left-[340px] z-10'>
            <div className='flex flex-col gap-4'>
              <h2 className='text-2xl font-semibold text-white'>HOONIAN Sigura-Gura</h2>
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <Bed className='h-5 w-5 text-white' />
                  <span className='text-sm text-white'>0 Kamar Tidur</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Bath className='h-5 w-5 text-white' />
                  <span className='text-sm text-white'>0 Kamar Mandi</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Wifi className='h-5 w-5 text-white' />
                  <span className='text-sm text-white'>Wifi Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Controls */}
          <div className='absolute right-6 bottom-6 flex flex-col items-end gap-4'>
            {/* Page Indicator - Dynamic */}
            <div className='text-sm font-medium text-white'>
              {activeIndex + 1} dari {images.length}
            </div>

            {/* Custom Pagination - Interactive */}
            <div className='flex items-center gap-2'>
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePaginationClick(index)}
                  className={`h-1 w-8 cursor-pointer rounded-full transition-all ${
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

      <style jsx global>{`
        .splide__pagination {
          display: none;
        }
        .splide,
        .splide__track,
        .splide__list,
        .splide__slide {
          height: 100% !important;
        }
        .splide__slide {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
