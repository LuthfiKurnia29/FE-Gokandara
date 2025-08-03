'use client';

import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { currency } from '@/lib/utils';
import { usePropertyById } from '@/services/properti';
import { PropertyData } from '@/types/properti';

import { Building, Calendar, Expand, MapPin, Ruler, Tag } from 'lucide-react';

interface PropertyDetailModalProps {
  propertyId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const thumbnailImage = propertyImages.length > 0 ? propertyImages[0] : fallbackImage;

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
            {/* Thumbnail Image */}
            <div className='relative'>
              <img src={thumbnailImage} alt='Property Thumbnail' className='h-[300px] w-full rounded-lg object-cover' />
            </div>

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
