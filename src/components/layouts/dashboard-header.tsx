import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useTitleContext } from '../providers/title-provider';
import { SidebarTrigger } from '../ui/sidebar';
import { Bell, Calendar, Heart, MessageSquare, Search, Star, User } from 'lucide-react';

export function DashboardHeader() {
  const { title } = useTitleContext();

  return (
    <header className='border-b bg-white p-4'>
      <div className='flex items-center justify-between gap-6'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger className='-ml-1' />
          <h1 className='text-2xl font-semibold text-gray-900'>{title}</h1>
        </div>

        <div className='flex items-center gap-4'>
          {/* Search Bar */}
          <div className='relative'>
            <Search className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input placeholder='Cari di sini...' className='w-[12rem] pr-10' />
          </div>

          {/* Notification Icons */}
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='icon' className='relative'>
              <Star className='h-5 w-5 text-gray-600' />
              <Badge className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-red-500 p-0 text-xs'>
                6
              </Badge>
            </Button>

            <Button variant='ghost' size='icon' className='relative'>
              <Bell className='h-5 w-5 text-gray-600' />
              <Badge className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-blue-500 p-0 text-xs'>
                1
              </Badge>
            </Button>

            <Button variant='ghost' size='icon' className='relative'>
              <MessageSquare className='h-5 w-5 text-gray-600' />
              <Badge className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-orange-500 p-0 text-xs'>
                3
              </Badge>
            </Button>

            <Button variant='ghost' size='icon' className='relative'>
              <Calendar className='h-5 w-5 text-gray-600' />
              <Badge className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-green-500 p-0 text-xs'>
                2
              </Badge>
            </Button>
          </div>

          {/* User Profile */}
          <div className='ml-4 flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/placeholder.svg?height=32&width=32' />
              <AvatarFallback className='bg-gray-200 text-gray-600'>NS</AvatarFallback>
            </Avatar>
            <div className='hidden text-sm lg:block'>
              <div className='font-medium text-gray-900'>Nema Sales</div>
              <div className='text-xs text-gray-500'>Sales Manager</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
