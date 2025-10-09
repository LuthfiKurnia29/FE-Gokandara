import { memo, useMemo, useRef, useState } from 'react';

import { useProjekGambars, useUploadProjekGambars } from '@/services/projek';
import { PropertyData } from '@/types/properti';
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { FileUpload } from '../../components/ui/file-upload';
import { Label } from '../../components/ui/label';
import { FilePondFile } from 'filepond';
import { Bath, Bed, Expand, Pencil, Share2, Wifi } from 'lucide-react';
import { toast } from 'react-toastify';

interface PropertySliderProps {
  images: string[];
  property?: PropertyData;
}

const PropertySliderComponent = ({ images, property }: PropertySliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const splideRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const projekId = property?.projek?.id || null;
  const uploadGambarsMutation = useUploadProjekGambars();
  const { data: projekGambars = [] } = useProjekGambars(projekId);

  const initialFiles = useMemo(() => {
    return projekGambars.map((g: any) => g.gambar_url);
  }, [projekGambars]);

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
    setUploadedFiles([]);
  };

  const handleFileUploadChange = (files: FilePondFile[] | null) => {
    if (!files) {
      setUploadedFiles([]);
      return;
    }
    setUploadedFiles(files.map((f) => f.file as File));
  };

  const handleEditSubmit = async () => {
    if (!projekId) {
      toast.error('Projek ID tidak ditemukan');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Pilih minimal 1 gambar untuk diupload');
      return;
    }

    try {
      await uploadGambarsMutation.mutateAsync({ id: projekId, files: uploadedFiles });
      toast.success('Gambar projek berhasil diupload');
      setIsEditModalOpen(false);
      setUploadedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
      queryClient.invalidateQueries({ queryKey: ['/properti'] });
      queryClient.invalidateQueries({ queryKey: ['/projek', projekId, 'images'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload gambar projek');
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
                  <span className='text-sm text-white'>{property?.kamar_tidur} Kamar Tidur</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Bath className='h-5 w-5 text-white' />
                  <span className='text-sm text-white'>{property?.kamar_mandi} Kamar Mandi</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Wifi className='h-5 w-5 text-white' />
                  <span className='text-sm text-white'>
                    {property?.wifi ? 'Wifi Available' : 'Wifi Tidak Tersedia'}
                  </span>
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

      {/* Upload Images Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='w-full max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Upload Gambar Projek</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='gambar'>Gambar</Label>
              <FileUpload
                name='gambar'
                onupdatefiles={handleFileUploadChange}
                initialFiles={initialFiles}
                allowMultiple
                acceptedFileTypes={['image/*']}
                credits={false}
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-3'>
            <Button variant='secondary' onClick={handleEditCancel} disabled={uploadGambarsMutation.isPending}>
              Batalkan
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={uploadGambarsMutation.isPending || uploadedFiles.length === 0}
              className='bg-green-500 hover:bg-green-600'>
              {uploadGambarsMutation.isPending ? 'Mengupload...' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const PropertySlider = memo(PropertySliderComponent);
