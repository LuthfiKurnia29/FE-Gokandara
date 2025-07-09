'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  Bath,
  Bed,
  Check,
  ChevronRight,
  Facebook,
  Instagram,
  Maximize2,
  Share2,
  Star,
  Twitter,
  Wifi
} from 'lucide-react';

export function PropertyContent() {
  return (
    <div className='flex-1 overflow-auto p-6'>
      {/* Hero Section */}
      <Card className='mb-6 overflow-hidden border-0 shadow-sm'>
        <div className='relative h-72 rounded-lg bg-gradient-to-br from-[#8e9aaf] via-[#6c7b8a] to-[#4a5568]'>
          <Button className='absolute top-4 right-4 h-8 bg-[#09bd3c] px-4 text-sm font-medium hover:bg-[#09bd3c]/90'>
            Tersedia
          </Button>

          <Button variant='ghost' size='icon' className='absolute top-4 right-16 h-8 w-8 text-white'>
            <Share2 size={16} />
          </Button>

          <Button variant='ghost' size='icon' className='absolute right-4 bottom-4 h-8 w-8 text-white'>
            <Maximize2 size={16} />
          </Button>

          <div className='absolute bottom-6 left-6 text-white'>
            <h2 className='mb-3 text-3xl font-bold'>HOONIAN Sigura-Gura</h2>
            <div className='flex items-center gap-8 text-sm'>
              <div className='flex items-center gap-2'>
                <Bed size={16} />
                <span>0 Kamar Tidur</span>
              </div>
              <div className='flex items-center gap-2'>
                <Bath size={16} />
                <span>0 Kamar Mandi</span>
              </div>
              <div className='flex items-center gap-2'>
                <Wifi size={16} />
                <span>Wifi Available</span>
              </div>
            </div>
          </div>

          <div className='absolute right-6 bottom-6 text-sm text-white'>1 dari 4</div>

          {/* Property thumbnail */}
          <div className='absolute bottom-6 left-6 -translate-y-16'>
            <div className='h-20 w-20 rounded-lg border-4 border-white bg-[#c4c4c4]'></div>
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-12 gap-6'>
        {/* Left Column */}
        <div className='col-span-3 space-y-6'>
          {/* Property Profile */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <div className='mb-6 text-center'>
                <h3 className='mb-1 text-xl font-bold text-[#0c0c0c]'>HOONIAN</h3>
                <p className='text-base font-medium text-[#09bd3c]'>Sigura-Gura</p>
              </div>

              <p className='mb-6 text-sm leading-relaxed text-[#737b8b]'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>

              <div className='flex justify-center gap-3'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-10 w-10 rounded-full bg-[#0c0c0c] text-white hover:bg-[#0c0c0c]/90'>
                  <Instagram size={18} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-10 w-10 rounded-full bg-[#1877f2] text-white hover:bg-[#1877f2]/90'>
                  <Facebook size={18} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-10 w-10 rounded-full bg-[#1da1f2] text-white hover:bg-[#1da1f2]/90'>
                  <Twitter size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-lg font-bold'>Harga</h3>
              <div className='mb-4 rounded-lg bg-[#2563eb] p-6 text-center text-white'>
                <div className='mb-1 text-sm opacity-90'>Harga mulai</div>
                <div className='text-2xl font-bold'>Rp 0,00 M</div>
                <div className='text-sm opacity-90'>sampai Rp 0,00 M</div>
              </div>
              <Button className='h-12 w-full bg-[#ff8500] font-medium hover:bg-[#ff8500]/90'>Pemasaran</Button>
            </CardContent>
          </Card>

          {/* Sales History */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-lg font-bold'>Histori Penjualan</h3>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-[#c4c4c4] text-sm text-white'>NK</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>Nama Konsumen</div>
                    <div className='mb-1 text-xs text-[#737b8b]'>Tanggal</div>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} className='fill-[#ff8500] text-[#ff8500]' />
                      ))}
                    </div>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-[#c4c4c4] text-sm text-white'>NK</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>Nama Konsumen</div>
                    <div className='mb-1 text-xs text-[#737b8b]'>Tanggal</div>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4].map((star) => (
                        <Star key={star} size={14} className='fill-[#ff8500] text-[#ff8500]' />
                      ))}
                      <Star size={14} className='text-[#e5e7eb]' />
                    </div>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-[#c4c4c4] text-sm text-white'>NK</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>Nama Konsumen</div>
                    <div className='mb-1 text-xs text-[#737b8b]'>Tanggal</div>
                    <div className='flex gap-1'>
                      {[1, 2, 3].map((star) => (
                        <Star key={star} size={14} className='fill-[#ff8500] text-[#ff8500]' />
                      ))}
                      {[4, 5].map((star) => (
                        <Star key={star} size={14} className='text-[#e5e7eb]' />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className='col-span-5 space-y-6'>
          {/* Description */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-lg font-bold'>Deskripsi</h3>
              <div className='space-y-4 text-sm leading-relaxed text-[#737b8b]'>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non laoreet tortor. Curabitur varius
                  arcu ex, non blandit lorem dignissim eu. Mauris sed varius purus. Mauris feugiat elementum sapien non
                  volutpat.
                </p>
                <p>
                  Nulla molestie lorem sapien, at sollicitudin erat ultricies non. Integer sollicitudin, quam eget
                  fermentum pharetra, risus metus accumsan ante, a efficitur metus risus vel ex. Etiam in pulvinar est,
                  luctus vehicula quam. Sed urna odio, ultrices et lobortis nec, varius vitae augue. Maecenas ut arcu
                  eget quam eleifend sollicitudin. Phasellus quis nisi quam. Nam vitae fringilla nulla. Vestibulum
                  hendrerit, urna vel venenatis volutpat, purus risus feugiat magna, quis varius tellus dui et neque.
                  Nunc eget mauris mi. Donec eget lorem id tellus auctor molestie. Aliquam at tristique magna. Sed
                  tempus nisi et mollis luctus. Curabitur porta risus eget sapien consequat venenatis. Vivamus gravida
                  convallis iaculis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-lg font-bold'>Galeri</h3>
              <div className='mb-4 grid grid-cols-2 gap-3'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='aspect-square rounded-lg bg-[#c4c4c4]'></div>
                ))}
              </div>
              <div className='flex justify-end'>
                <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full bg-white shadow-md'>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className='col-span-4 space-y-6'>
          {/* Location */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-lg font-bold'>Lokasi</h3>
              <div className='relative aspect-video rounded-lg bg-[#c4c4c4]'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
                  <div className='relative rounded-lg bg-white p-3 shadow-lg'>
                    <div className='text-sm font-medium'>HOONIAN</div>
                    <div className='text-xs text-[#737b8b]'>Jl. *****, Kec. ****, Kab. ****</div>
                    <div className='absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-white'></div>
                  </div>
                  <div className='mx-auto mt-1 h-3 w-3 rounded-full bg-[#2563eb]'></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className='border-0 shadow-sm'>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-lg font-bold'>Fasilitas</h3>
              <div className='grid grid-cols-2 gap-x-4 gap-y-3'>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className='flex items-center gap-2'>
                    <div className='flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#09bd3c]'>
                      <Check size={10} className='text-white' />
                    </div>
                    <span className='text-sm'>Lorem Ipsum</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
