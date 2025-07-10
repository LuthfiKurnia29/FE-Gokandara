'use client';

import { useRef } from 'react';
import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { PropertySlider } from '@/blocks/properti/property-slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

import { Expand, Facebook, Instagram, Share2, Twitter } from 'lucide-react';
import { Bath, Bed, Check, ChevronRight, Star, Wifi } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/ui/map'), {
  loading: () => <div className='h-[400px] w-full animate-pulse rounded-lg bg-gray-100' />,
  ssr: false
});

const dummyImages = ['https://placehold.co/800x600'];

export const PropertyContent = () => {
  const [api, setApi] = useState<CarouselApi>();

  const scrollNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

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
              {/* Header */}
              <div className='px-4'>
                <h1 className='mb-1 text-center text-[24px] font-bold text-[#0C0C0C]'>HOONIAN</h1>
                <p className='text-center text-base font-medium text-[#09BD3C]'>Sigura-Gura</p>

                <p className='mt-4 text-center text-sm leading-[1.5] text-[#737B8B]'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>

                {/* Social Media Icons */}
                <div className='mt-6 flex justify-center gap-3'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-10 w-10 rounded-full bg-[#0C0C0C] p-0 hover:bg-[#0C0C0C]/90'>
                    <Instagram className='h-[18px] w-[18px] text-white' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-10 w-10 rounded-full bg-[#0C0C0C] p-0 hover:bg-[#0C0C0C]/90'>
                    <Facebook className='h-[18px] w-[18px] text-white' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-10 w-10 rounded-full bg-[#0C0C0C] p-0 hover:bg-[#0C0C0C]/90'>
                    <Twitter className='h-[18px] w-[18px] text-white' />
                  </Button>
                </div>
              </div>

              {/* Price Section */}
              <div className='mt-8 px-4'>
                <h2 className='mb-4 text-[20px] font-bold text-[#0C0C0C]'>Harga</h2>

                <div className='mb-4 rounded-lg bg-[#2563EB] p-6 text-center text-white'>
                  <p className='mb-1 text-sm opacity-90'>Harga mulai</p>
                  <p className='mb-1 text-2xl font-bold'>Rp 0,00 M</p>
                  <p className='text-sm opacity-90'>sampai Rp 0,00 M</p>
                </div>

                <Button className='h-12 w-full rounded-lg bg-[#FF8500] font-medium hover:bg-[#FF8500]/90'>
                  Pemesanan
                </Button>
              </div>

              {/* Sales History */}
              <div className='mt-8 px-4'>
                <h2 className='mb-6 text-[20px] font-bold text-[#0C0C0C]'>Histori Penjualan</h2>

                <div className='space-y-6'>
                  {/* Customer 1 - 5 stars */}
                  <div className='flex items-start gap-3'>
                    <div className='flex flex-col items-center'>
                      <Avatar className='h-10 w-10'>
                        <AvatarFallback className='bg-[#C4C4C4]'></AvatarFallback>
                      </Avatar>
                      <div className='mt-2 h-8 w-[1px] bg-[#E5E7EB]'></div>
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-[#0C0C0C]'>Nama Konsumen</h3>
                      <p className='mb-2 text-xs text-[#737B8B]'>Tanggal</p>
                      <div className='flex gap-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className='h-[14px] w-[14px] fill-[#FF8500] text-[#FF8500]' />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer 2 - 4 stars */}
                  <div className='flex items-start gap-3'>
                    <div className='flex flex-col items-center'>
                      <Avatar className='h-10 w-10'>
                        <AvatarFallback className='bg-[#C4C4C4]'></AvatarFallback>
                      </Avatar>
                      <div className='mt-2 h-8 w-[1px] bg-[#E5E7EB]'></div>
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-[#0C0C0C]'>Nama Konsumen</h3>
                      <p className='mb-2 text-xs text-[#737B8B]'>Tanggal</p>
                      <div className='flex gap-1'>
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className='h-[14px] w-[14px] fill-[#FF8500] text-[#FF8500]' />
                        ))}
                        <Star className='h-[14px] w-[14px] text-[#E5E7EB]' />
                      </div>
                    </div>
                  </div>

                  {/* Customer 3 - 3 stars */}
                  <div className='flex items-start gap-3'>
                    <div className='flex flex-col items-center'>
                      <Avatar className='h-10 w-10'>
                        <AvatarFallback className='bg-[#C4C4C4]'></AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-[#0C0C0C]'>Nama Konsumen</h3>
                      <p className='mb-2 text-xs text-[#737B8B]'>Tanggal</p>
                      <div className='flex gap-1'>
                        {[1, 2, 3].map((star) => (
                          <Star key={star} className='h-[14px] w-[14px] fill-[#FF8500] text-[#FF8500]' />
                        ))}
                        {[4, 5].map((star) => (
                          <Star key={star} className='h-[14px] w-[14px] text-[#E5E7EB]' />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle and Right Columns Combined */}
            <div className='col-span-9'>
              <div className='w-full'>
                {/* Description Section */}
                <section className='mb-8'>
                  <h2 className='mb-4 text-2xl font-bold text-gray-800'>Deskripsi</h2>
                  <div className='space-y-4 text-sm leading-relaxed text-gray-600'>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non laoreet tortor. Curabitur
                      varius arcu ex, non blandit lorem dignissim eu. Mauris sed varius purus. Mauris feugiat elementum
                      sapien non volutpat.
                    </p>
                    <p>
                      Nulla molestiae lorem sapien, at sollicitudin erat ultricies non. Integer sollicitudin, quam eget
                      fermentum pharetra, risus metus accumsan ante, a efficitur metus elit ut nunc. Suspendisse at
                      augue vel justo vehicula varius. Sed non odio ultrices et lobortis nec metus vitae magna. Maecenas
                      at eros eget orci efficitur sollicitudin. Phasellus quis nisl quam. Nam vitae fringilla nulla.
                      Vestibulum hendrerit, urna vel venenatis volutpat, purus risus feugiat magna, quis varius tellus
                      dui et neque. Nunc eget mauris mi. Donec eget lorem id tellus auctor molestie. Aliquam at
                      tristique magna. Sed tempus nisl et mollis luctus. Curabitur porta risus eget sapien consequat
                      venenatis. Vivamus gravida convallis iaculis.
                    </p>
                  </div>
                </section>

                {/* Gallery Section */}
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

                {/* Location Section */}
                <section className='mb-8'>
                  <h2 className='mb-4 text-2xl font-bold text-gray-800'>Lokasi</h2>
                  <div className='h-[400px] w-full'>
                    <MapComponent center={[-6.2088, 106.8456]} address='Jl. ****, Kec. ****, Kab. ****, **** 12345' />
                  </div>
                </section>

                {/* Facilities Section */}
                <section>
                  <h2 className='mb-4 text-2xl font-bold text-gray-800'>Fasilitas</h2>
                  <div className='grid grid-cols-5 gap-4'>
                    {Array.from({ length: 15 }, (_, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500'>
                          <Check className='h-3 w-3 text-white' />
                        </div>
                        <span className='text-sm text-gray-600'>Fasilitas {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
