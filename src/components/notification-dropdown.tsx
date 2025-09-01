'use client';

import { memo, useMemo, useState } from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotificationCount, useNotificationList, useReadAllNotifications } from '@/services/notification';
import type { NotificationItem } from '@/types/notification';

import { Bell, Clock, MessageCircle, ShoppingCart, Users, X } from 'lucide-react';

const getKindLabel = (jenisNotif: string) => {
  if (jenisNotif === 'chat') return 'CHAT';
  if (jenisNotif === 'konsumen') return 'KONSUMEN';
  if (jenisNotif === 'claim') return 'CLAIM';
  return 'LAINNYA';
};

const getMessage = (n: NotificationItem) => {
  if (n.jenis_notifikasi === 'chat') {
    return `${n.chatting.pengirim?.name ?? 'Pengirim'} mengirim pesan ${n.chatting.pesan ? `: ${n.chatting.pesan}` : ''}`;
  }
  if (n.jenis_notifikasi === 'konsumen') {
    return `Mitra berusaha menginputkan data Konsumen yang sudah ada. Konsumen dengan nama ${n.konsumen?.name ?? '-'} dan no. telp ${n.konsumen?.phone ?? n.phone ?? '-'}`;
  }
  if (n.jenis_notifikasi === 'claim') {
    return `${n.user?.name} ingin Claim bonus ${n.target?.hadiah}`;
  }

  return '-';
};

const getTitle = (n: NotificationItem) => {
  if (n.jenis_notifikasi === 'chat') return 'Pesan baru';
  if (n.jenis_notifikasi === 'konsumen') return 'Notifikasi Konsumen';
  if (n.jenis_notifikasi === 'claim') return 'Claim Bonus';
  return '-';
};

const NotificationDropdown = memo(function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { data: notifCount = 0 } = useNotificationCount();
  const { data } = useNotificationList({ filter: 'unread', page: 1, per_page: 10 });
  const readAll = useReadAllNotifications();

  const notifications: NotificationItem[] = (data?.data as any) || [];
  const hasUnread =
    notifications?.some((n: any) => !n?.is_read || (n?.is_read as any) === 0 || (n?.is_read as any) === '0') ?? false;

  const formatRelative = (iso: string) => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    if (day > 0) return `${day} day${day > 1 ? 's' : ''} ago`;
    if (hour > 0) return `${hour} hour${hour > 1 ? 's' : ''} ago`;
    if (min > 0) return `${min} minute${min > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const renderIcon = (n: any, index: number) => {
    const kind = (n?.jenis_notifikasi ?? n?.type) as string | undefined;
    const base = 'w-12 h-12 rounded-xl flex items-center justify-center';
    if (kind === 'chat') {
      return (
        <div className={`${base} bg-emerald-700`}>
          <MessageCircle className='h-5 w-5 text-white' />
        </div>
      );
    }
    if (kind === 'konsumen') {
      return (
        <div className={`${base} bg-amber-600`}>
          <Users className='h-5 w-5 text-white' />
        </div>
      );
    }
    const bgColors = ['bg-green-600', 'bg-gray-500', 'bg-gray-600'];
    const bgColor = bgColors[index % bgColors.length];
    return (
      <div className={`${base} ${bgColor}`}>
        <ShoppingCart className='h-5 w-5 text-white' />
      </div>
    );
  };

  const headerRight = useMemo(
    () => (
      <Button
        variant='ghost'
        className='h-auto p-0 font-normal text-orange-500 hover:bg-orange-50 hover:text-orange-600'
        onClick={() => readAll.mutate()}
        disabled={readAll.isPending || !hasUnread}>
        Mark All as Read
      </Button>
    ),
    [readAll.isPending, hasUnread]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label='Buka notifikasi' className='relative inline-flex h-6 w-6 items-center justify-center'>
          <Bell className='h-6 w-6 cursor-pointer text-gray-600' />
          {notifCount > 0 && (
            <span className='font-sf-pro absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] leading-3 font-bold text-white'>
              {notifCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-96 p-0' align='end' sideOffset={8}>
        <div className='flex items-center justify-between border-b p-4'>
          <h3 className='text-lg font-semibold'>Notification</h3>
          <Button variant='ghost' size='icon' className='h-8 w-8' aria-label='Close' onClick={() => setOpen(false)}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {notifications?.length ? (
            notifications.map((n: any, index: number) => {
              const kind = getKindLabel(n.jenis_notifikasi) as string | undefined;
              const isUnread = !n?.is_read || (n?.is_read as any) === 0 || (n?.is_read as any) === '0';
              const pengirim = n?.pengirim?.name ?? n?.chatting?.pengirim?.name ?? 'Pengirim';
              const text = getMessage(n);

              return (
                <div key={n.id} className='border-b p-4 last:border-b-0 hover:bg-gray-50'>
                  <div className='flex items-start gap-3'>
                    {renderIcon(n, index)}
                    <div className='min-w-0 flex-1'>
                      <p className='mb-2 text-sm text-gray-900'>
                        <span className='font-medium'>{getTitle(n)}</span> {text}
                      </p>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <Badge variant='secondary' className='bg-blue-50 text-blue-600 hover:bg-blue-50'>
                          {(kind || '').toString().toUpperCase() || 'TRANSAKSI'}
                        </Badge>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          <span>{formatRelative(n?.created_at ?? new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                    {isUnread && (
                      <div className='flex-shrink-0'>
                        <div className='h-2 w-2 rounded-full bg-red-500'></div>
                        <span className='ml-1 text-lg font-bold text-red-500'>!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className='p-6 text-center text-sm text-gray-500'>Tidak ada notifikasi belum dibaca</div>
          )}
        </div>

        <div className='flex items-center justify-between border-t bg-gray-50 p-4'>
          {hasUnread && headerRight}
          <Link
            href='/notifikasi'
            onClick={() => setOpen(false)}
            className='rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700'>
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default NotificationDropdown;
