'use client';

import { memo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { currency } from '@/lib/utils';
import { usePropertyById } from '@/services/properti';
import { PropertyData } from '@/types/properti';
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

import { Building, Calendar, MapPin, Ruler, Tag } from 'lucide-react';

interface PropertyDetailModalProps {
  propertyId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Property Image Slider Component
const PropertyImageSlider = ({ images, property }: { images: string[]; property: PropertyData }) => {
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

  // Get property information
  const propertyName = property?.projek?.name || 'Properti';

  return (
    <div className='relative h-[300px] w-full'>
      <Splide
        hasTrack={false}
        options={options}
        onMounted={handleMounted}
        onMove={handleMove}
        className='h-full w-full'>
        <div className='relative h-full w-full overflow-hidden rounded-lg'>
          <SplideTrack className='h-full w-full'>
            {images.map((image, index) => (
              <SplideSlide key={index} className='relative h-full w-full'>
                {/* Image */}
                <div
                  className='absolute inset-0 h-full w-full rounded-lg'
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </SplideSlide>
            ))}
          </SplideTrack>

          {/* Property Info Overlay */}
          <div className='absolute bottom-4 left-4 z-10'>
            <div className='flex flex-col gap-2'>
              <h2 className='text-lg font-semibold text-white drop-shadow-lg'>{propertyName}</h2>
            </div>
          </div>

          {/* Custom Controls - Only show if multiple images */}
          {images.length > 1 && (
            <div className='absolute right-4 bottom-4 flex flex-col items-end gap-3'>
              {/* Page Indicator */}
              <div className='text-xs font-medium text-white drop-shadow-lg'>
                {activeIndex + 1} dari {images.length}
              </div>

              {/* Custom Pagination */}
              <div className='flex items-center gap-1'>
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePaginationClick(index)}
                    className={`h-1 w-6 cursor-pointer rounded-full transition-all ${
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
          )}
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
};

export const PropertyDetailModal = memo(function PropertyDetailModal({
  propertyId,
  isOpen,
  onOpenChange
}: PropertyDetailModalProps) {
  // Fetch property details
  const { data: property, isLoading, error } = usePropertyById(propertyId, ['projek', 'properti_gambar']);

  // Extract images from property data
  const propertyImages = property?.properti_gambar?.map((img) => img.image_url || '') || [];
  const fallbackImage = 'https://placehold.co/400x300/09bd3c/ffffff?text=No+Image+Available';

  // Determine if we should use slider or single image
  const shouldUseSlider = propertyImages.length > 1;
  const displayImages = propertyImages.length > 0 ? propertyImages : [fallbackImage];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-full max-w-[600px] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>Detail Properti</span>
            {property?.projek?.name && (
              <span className='text-muted-foreground text-sm'>Proyek: {property.projek.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className='space-y-4'>
            <Skeleton className='h-[300px] w-full' />
            <div className='grid grid-cols-2 gap-4'>
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>
          </div>
        )}

        {Boolean(error) && (
          <div className='text-center text-red-500'>
            <p>Error loading property details</p>
            <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}

        {property && (
          <div className='space-y-6'>
            {/* Image Display - Slider or Single Image */}
            {shouldUseSlider ? (
              <PropertyImageSlider images={displayImages} property={property} />
            ) : (
              <div className='relative'>
                <img
                  src={displayImages[0]}
                  alt='Property Thumbnail'
                  className='h-[300px] w-full rounded-lg object-cover'
                />
              </div>
            )}

            {/* Property Details Grid */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Location */}
              <div className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'>
                <MapPin className='h-6 w-6 text-teal-600' />
                <div>
                  <p className='text-muted-foreground text-xs'>Lokasi</p>
                  <p className='font-medium'>{property.lokasi}</p>
                </div>
              </div>

              {/* Building Size */}
              <div className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'>
                <Ruler className='h-6 w-6 text-blue-600' />
                <div>
                  <p className='text-muted-foreground text-xs'>Luas Bangunan/Tanah</p>
                  <p className='font-medium'>
                    {property.luas_bangunan} / {property.luas_tanah}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'>
                <Tag className='h-6 w-6 text-green-600' />
                <div>
                  <p className='text-muted-foreground text-xs'>Harga</p>
                  <p className='font-medium text-green-700'>Rp {property.harga.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Created Date */}
              <div className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'>
                <Calendar className='h-6 w-6 text-purple-600' />
                <div>
                  <p className='text-muted-foreground text-xs'>Tanggal Dibuat</p>
                  <p className='font-medium'>
                    {new Date(property.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className='rounded-lg bg-gray-50 p-4'>
              <h3 className='mb-2 flex items-center text-sm font-semibold'>
                <Building className='mr-2 h-5 w-5 text-orange-600' />
                Kelebihan Properti
              </h3>
              <p className='text-muted-foreground text-sm'>{property.kelebihan || 'Tidak ada keterangan kelebihan'}</p>
            </div>

            {/* Pricing Options */}
            {property.daftar_harga && property.daftar_harga.length > 0 && (
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-2 text-sm font-semibold'>Daftar Harga</h3>
                <div className='space-y-2'>
                  {property.daftar_harga.map((harga, index) => (
                    <div key={`harga-${index}`} className='flex items-center justify-between rounded bg-white p-2'>
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          Tipe {harga.tipe_id} - Unit {harga.unit_id}
                        </p>
                        <p className='font-medium text-green-700'>{currency(harga.harga)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
