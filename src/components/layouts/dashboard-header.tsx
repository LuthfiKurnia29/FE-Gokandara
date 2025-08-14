'use client';

import Link from 'next/link';

import NotificationDropdown from '@/components/notification-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { authService, useCurrentUser } from '@/services/auth';
import { useNotificationCount } from '@/services/notification';

import { useTitleContext } from '../title';
import { SidebarTrigger } from '../ui/sidebar';
import { Bell, Calendar, ChevronDown, LogOut, MessageSquare, Search, Star, User } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

// Notification badge logic
const determineBadgeCount = (title: string, transaksiTotal: number = 0) => {
  // Only Transaksi and Pesan have notification counts
  switch (title) {
    case 'Star':
      return 0;
    case 'Pesan':
      return 0; // Example: 3 message notifications
    case 'Transaksi':
      return transaksiTotal; // Use actual transaksi total
    case 'Calendar':
      return 0;
    default:
      return 0;
  }
};

// Notification click handlers for each type
const handleStarNotificationClick = () => {
  // No action for Star notifications
};

const handleMessageNotificationClick = (count: number) => {
  toast(count > 0 ? 'Ada notifikasi pesan yang menanti' : 'Tidak ada notifikasi terbaru', {
    icon: count > 0 ? '🔔' : '📭'
  });
};

const handleTransaksiNotificationClick = (count: number) => {
  toast(count > 0 ? 'Ada notifikasi transaksi yang menanti' : 'Tidak ada notifikasi terbaru', {
    icon: count > 0 ? '🔔' : '📭'
  });
};

const handleCalendarNotificationClick = () => {
  // No action for Calendar notifications
};

const handleNotificationClick = (count: number) => {
  toast(count > 0 ? 'Ada notifikasi yang menanti' : 'Tidak ada notifikasi terbaru', {
    icon: count > 0 ? '🔔' : '📭'
  });
};

export function DashboardHeader() {
  const { title } = useTitleContext();
  const { data: currentUser } = useCurrentUser();
  const { data: notifCount = 0 } = useNotificationCount();

  // Calculate badge counts
  const starBadgeCount = determineBadgeCount('Star');
  const messageBadgeCount = determineBadgeCount('Pesan');
  const transaksiBadgeCount = determineBadgeCount('Transaksi', notifCount);
  const calendarBadgeCount = determineBadgeCount('Calendar');

  const handleLogout = () => {
    authService.logout();
    window.location.reload(); // Refresh to trigger auth check
  };

  // Get user data from API or fallback to stored data
  const userData = currentUser || authService.getStoredUserData();
  const user = userData?.user || authService.getStoredUser();
  const userRole = userData?.roles?.[0]?.role?.name || 'User';

  return (
    <>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2a2a2a',
            color: '#fff',
            border: '1px solid #FF9900'
          }
        }}
      />
      <header className='flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6'>
        {/* Left Section: Hamburger + Title */}
        <div className='flex items-center gap-4'>
          <SidebarTrigger className='h-6 w-6 text-gray-600 hover:text-gray-900' />
          <h1 className='font-sf-pro text-[20px] leading-6 font-semibold tracking-[-0.02em] text-gray-900'>{title}</h1>
        </div>

        {/* Center Section: Search Bar */}
        <div className='flex flex-1 justify-center px-8'>
          <div className='relative w-full max-w-sm'>
            <Input
              type='text'
              placeholder='Cari di sini...'
              className='font-sf-pro h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 pr-10 text-[14px] leading-5 font-normal tracking-[-0.01em] text-gray-700 placeholder-gray-500 focus:border-gray-400 focus:bg-white focus:ring-0 focus:outline-none'
            />
            <Search className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
          </div>
        </div>

        {/* Right Section: Notifications + User Profile */}
        <div className='flex items-center gap-6'>
          {/* Notification Icons */}
          <div className='hidden items-center gap-4 lg:flex'>
            {/* Star Icon with Gray Badge */}
            <div className='relative' onClick={handleStarNotificationClick}>
              <Star className='h-6 w-6 cursor-pointer text-gray-600' />
            </div>

            {/* Bell Icon → open dropdown */}
            <NotificationDropdown />

            {/* Message Icon with Red Badge */}
            {messageBadgeCount > 0 && (
              <div className='relative' onClick={() => handleMessageNotificationClick(messageBadgeCount)}>
                <MessageSquare className='h-6 w-6 cursor-pointer text-gray-600' />
                <span className='font-sf-pro absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] leading-3 font-bold text-white'>
                  {messageBadgeCount}
                </span>
              </div>
            )}
            {messageBadgeCount === 0 && (
              <div className='relative' onClick={() => handleMessageNotificationClick(0)}>
                <MessageSquare className='h-6 w-6 cursor-pointer text-gray-600' />
              </div>
            )}

            {/* Calendar Icon with Green Badge */}
            <div className='relative' onClick={handleCalendarNotificationClick}>
              <Calendar className='h-6 w-6 cursor-pointer text-gray-600' />
            </div>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src='/placeholder-avatar.jpg' alt='User' />
                <AvatarFallback className='font-sf-pro bg-gray-300 text-[14px] leading-5 font-semibold tracking-[-0.01em] text-gray-700'>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='hidden flex-col lg:flex'>
                <span className='font-sf-pro text-[14px] leading-5 font-semibold tracking-[-0.01em] text-gray-900'>
                  {user?.name || 'User'}
                </span>
                <span className='font-sf-pro text-left text-[12px] leading-4 font-normal tracking-[-0.01em] text-gray-500'>
                  {userRole}
                </span>
              </div>
              <ChevronDown className='hidden h-4 w-4 text-gray-400 lg:block' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm leading-none font-medium'>{user?.name || 'User'}</p>
                  <p className='text-muted-foreground text-xs leading-none'>{user?.email || 'user@example.com'}</p>
                  <p className='text-muted-foreground text-xs leading-none'>{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer'>
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600' onClick={handleLogout}>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
