import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useTitleContext } from '../providers/title-provider';
import { SidebarTrigger } from '../ui/sidebar';
import { Bell, Calendar, MessageSquare, Search, Star } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className='flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8'>
      {/* Left Section: Hamburger + Title */}
      <div className='flex items-center gap-4'>
        <SidebarTrigger className='h-6 w-6 text-gray-600' />
        <h1 className='font-sf-pro text-[1.5rem] leading-tight font-bold tracking-tight text-[#232323]'>Dashboard</h1>
      </div>

      {/* Center Section: Search Bar */}
      <div className='flex flex-1 justify-center px-8'>
        <div className='relative w-full max-w-md'>
          <input
            type='text'
            placeholder='Cari di sini...'
            className='font-sf-pro h-12 w-full rounded-full border border-gray-300 bg-[#F8F9FA] px-6 pr-12 text-sm leading-tight tracking-tight text-gray-700 placeholder-gray-500 focus:border-gray-400 focus:ring-0 focus:outline-none'
          />
          <Search className='absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-gray-400' />
        </div>
      </div>

      {/* Right Section: Notifications + User Profile */}
      <div className='flex items-center gap-6'>
        {/* Notification Icons */}
        <div className='flex items-center gap-4'>
          {/* Star Icon with Gray Badge */}
          <div className='relative'>
            <Star className='h-7 w-7 text-gray-600' />
            <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs font-semibold text-white'>
              38
            </span>
          </div>

          {/* Bell Icon with Orange Badge */}
          <div className='relative'>
            <Bell className='h-7 w-7 text-gray-600' />
            <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white'>
              12
            </span>
          </div>

          {/* Message Icon with Red Badge */}
          <div className='relative'>
            <MessageSquare className='h-7 w-7 text-gray-600' />
            <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white'>
              1
            </span>
          </div>

          {/* Calendar Icon with Green Badge */}
          <div className='relative'>
            <Calendar className='h-7 w-7 text-gray-600' />
            <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white'>
              67
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src='/placeholder-avatar.jpg' alt='User' />
            <AvatarFallback className='font-sf-pro bg-gray-300 leading-tight font-semibold tracking-tight text-gray-700'>
              NS
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-sf-pro text-sm leading-tight font-bold tracking-tight text-gray-900'>Nama Sales</span>
            <span className='font-sf-pro text-xs leading-tight tracking-tight text-gray-500'>Sales</span>
          </div>
        </div>
      </div>
    </header>
  );
}
