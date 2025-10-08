import { memo, useRef, useState } from 'react';

import { useProjekById, useUpdateProjek } from '@/services/projek';
import { CreateProjekData } from '@/types/projek';
import { PropertyData } from '@/types/properti';
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import type { Options } from '@splidejs/splide';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '../../components/ui/button';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import TambahProjekWizard from '../master-data/projek/tambah-projek-wizard';
import { Bath, Bed, Expand, Pencil, Share2, Wifi } from 'lucide-react';
import { toast } from 'react-toastify';

interface PropertySliderProps {
  images: string[];
  property?: PropertyData;
}

const PropertySliderComponent = ({ images, property }: PropertySliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const splideRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const projekId = property?.projek?.id || null;
  const { data: projekData } = useProjekById(projekId);
  const updateProjekMutation = useUpdateProjek();

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

  const handleEditClick = () => {
    if (!projekId) {
      toast.error('Projek ID tidak ditemukan');
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (wizardData: any) => {
    if (!projekId) {
      toast.error('Projek ID tidak ditemukan');
      return;
    }

    const payload: CreateProjekData = {
      name: wizardData.projectName,
      alamat: wizardData.address,
      jumlah_kavling: Number(wizardData.jumlahKavling) || undefined,
      tipe: wizardData.types.map((t: any) => ({
        name: t.name,
        luas_tanah: Number(t.luasTanah) || 0,
        luas_bangunan: Number(t.luasBangunan) || 0,
        jumlah_unit: Number(t.jumlahUnit) || 0,
        jenis_pembayaran:
          wizardData.prices
            .find((p: any) => p.tipe === t.name)
            ?.items.map((item: any) => ({
              id: Number(item.jenisId),
              harga: Number(item.harga) || 0
            })) || []
      })),
      fasilitas: wizardData.facilities.map((f: any) => ({
        name: f.name,
        luas: Number(f.luas) || 0
      })),
      gambars: wizardData.gambars || []
    };

    try {
      await updateProjekMutation.mutateAsync({ id: projekId, data: payload });
      toast.success('Projek berhasil diupdate');
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate projek');
    }
  };

  // Get property information
  const propertyName = property?.projek?.name || 'Properti';
  const propertyStatus = 'Tersedia'; // You can add status field to property data later

  return (
    <div className='relative h-full w-full'>
      <Splide
        hasTrack={false}
        options={options}
        onMounted={handleMounted}
        onMove={handleMove}
        className='h-full w-full'>
        <div className='relative h-full w-full overflow-hidden rounded-[30px]'>
          <SplideTrack className='h-full w-full'>
            {images.map((image, index) => (
              <SplideSlide key={index} className='relative h-full w-full'>
                {/* Image */}
                <div
                  className='absolute inset-0 h-full w-full rounded-[30px]'
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
              {propertyStatus}
            </Button>
          </div>

          {/* Bottom Gradient */}
          <div
            className='absolute right-0 bottom-0 left-0 h-[200px] rounded-b-[32px]'
            style={{
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 1) 100%)'
            }}
          />

          {/* Property Info Overlay */}
          <div className='absolute bottom-10 left-[340px] z-10'>
            <div className='flex flex-col gap-4'>
              <h2 className='text-2xl font-semibold text-white'>{propertyName}</h2>
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
            {/* Control buttons */}
            <div className='flex flex-col gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleEditClick}
                className='h-[40px] w-[40px] rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20'
                aria-label='Edit Projek'
                tabIndex={0}>
                <Pencil className='h-5 w-5 text-white' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-[40px] w-[40px] rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20'>
                <Share2 className='h-5 w-5 text-white' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-[40px] w-[40px] rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20'>
                <Expand className='h-5 w-5 text-white' />
              </Button>
            </div>

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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='max-w-4xl p-0'>
          <TambahProjekWizard
            title='Edit Projek'
            onCancel={handleEditCancel}
            onSubmit={handleEditSubmit}
            isLoading={updateProjekMutation.isPending}
            initialData={{
              projectName: projekData?.name || '',
              address: projekData?.address || '',
              jumlahKavling: property?.jumlah_kavling || 0,
              types: [],
              prices: [],
              facilities: property?.fasilitas || [],
              gambarUrls: projekData?.gambars?.map((g) => g.gambar) || []
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const PropertySlider = memo(PropertySliderComponent);
