'use client';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

import { Bell, Menu } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Top Header with Logo */}
      <div className='bg-[#353430] py-6 text-white'>
        <div className='flex items-center justify-center gap-2'>
          <span className='text-2xl font-bold'>kandara</span>
          <div className='h-5 w-5 rotate-45 transform bg-[#DAA961]'></div>
        </div>
      </div>

      {/* Secondary Header */}
      <div className='bg-[#4a4a4a] p-4 text-white'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleSidebar}
              className='rounded-full bg-[#353430] p-2 text-white hover:bg-[#111111]'>
              <Menu size={20} />
            </Button>
            <div className='h-8 w-8 rounded-full bg-gray-400'></div>
          </div>

          <Button variant='ghost' size='sm' className='p-2 text-white hover:bg-[#111111]'>
            <Bell size={20} />
          </Button>
        </div>
      </div>

      <div className='flex flex-col'>{children}</div>
    </div>
  );
}
