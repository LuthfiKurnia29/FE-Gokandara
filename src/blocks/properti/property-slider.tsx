import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

import { Button } from '../../components/ui/button';
import { Bath, Bed, Maximize2, Share2, Wifi } from 'lucide-react';

interface PropertySliderProps {
  images: string[];
  currentIndex?: number;
  totalImages?: number;
}

export function PropertySlider({ images, currentIndex = 1, totalImages = 4 }: PropertySliderProps) {
  return (
    <div className='relative h-full w-full'>
      <Splide
        hasTrack={false}
        options={{
          type: 'fade',
          rewind: true,
          pagination: true,
          arrows: false,
          drag: true,
          autoplay: false,
          height: '100%',
          width: '100%'
        }}
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
            <Button className='bg-[#09bd3c] px-6 text-sm font-medium text-white hover:bg-[#09bd3c]/90'>Tersedia</Button>
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
            {/* Page Indicator */}
            <div className='text-sm font-medium text-white'>
              {currentIndex} dari {totalImages}
            </div>

            {/* Custom Pagination */}
            <div className='flex items-center gap-2'>
              {Array.from({ length: totalImages }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-8 rounded-full transition-all ${
                    index === currentIndex - 1 ? 'bg-white' : 'bg-white/50'
                  }`}
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
