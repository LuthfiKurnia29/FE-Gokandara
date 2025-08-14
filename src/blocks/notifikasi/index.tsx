'use client';

import { memo, useMemo, useState } from 'react';

import { PaginateCustom } from '@/components/paginate-custom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useDeleteNotification,
  useNotificationCount,
  useReadAllNotifications,
  useReadNotification
} from '@/services/notification';
import { useNotificationList } from '@/services/notification';
import type { NotificationItem } from '@/types/notification';

import { Search as SearchIcon } from 'lucide-react';

const NotifikasiPage = memo(function NotifikasiPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');

  const { data: notifCount = 0 } = useNotificationCount();
  const readMutation = useReadNotification();
  const readAllMutation = useReadAllNotifications();
  const deleteMutation = useDeleteNotification();

  const { data: allListMeta } = useNotificationList({ page: 1, per_page: 1, filter: 'all' });
  const allCount = allListMeta?.total ?? 0;

  const headerRight = (
    <Button
      onClick={() => readAllMutation.mutate()}
      disabled={readAllMutation.isPending}
      className='rounded-md bg-orange-500 px-6 py-2 text-white hover:bg-orange-600'>
      Mark All as Read
    </Button>
  );

  const renderNotification = (n: NotificationItem) => {
    const isUnread =
      !n.is_read || (n.is_read as any) === 0 || (n.is_read as any) === '0' || (n.is_read as any) === false;
    const time = useMemo(
      () =>
        new Date(n.created_at).toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      [n.created_at]
    );

    const kindLabel = n.type === 'chat' ? 'CHAT' : 'KONSUMEN';
    const message =
      n.type === 'chat'
        ? `${n.pengirim?.name ?? 'Pengirim'} mengirim pesan${n.message ? `: ${n.message}` : ''}`
        : `Mitra berusaha menginputkan data Konsumen yang sudah ada. Konsumen dengan nama ${n.konsumen?.name ?? '-'} dan no. telp ${n.konsumen?.phone ?? n.phone ?? '-'}`;

    return (
      <div key={n.id} className={`rounded-xl border p-4 shadow-sm ${isUnread ? 'bg-emerald-50' : 'bg-white'}`}>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <h4 className='text-base font-semibold text-gray-900'>
              {n.type === 'chat' ? 'Pesan baru' : 'Notifikasi Konsumen'}
            </h4>
            <p className='mt-1 text-sm text-gray-700'>{message}</p>
            <div className='mt-2 flex items-center gap-3'>
              <Badge variant='outline' className='text-xs'>
                {kindLabel}
              </Badge>
              <span className='text-xs text-gray-500'>{time}</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              className='bg-green-600 text-white hover:bg-green-700'
              disabled={!isUnread || readMutation.isPending}
              onClick={() => readMutation.mutate(n.id)}>
              Mark as Read
            </Button>
            <Button
              size='sm'
              variant='outline'
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(n.id)}>
              Hapus
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className='space-y-4 p-4'>
      <header className='flex items-center justify-between bg-transparent px-4 py-3'>
        {/* Search Section */}
        <div className='relative max-w-md flex-1'>
          <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            type='text'
            placeholder='Cari di sini...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-teal-600'
          />
        </div>

        {/* Navigation Tabs */}
        <div className='mx-8 flex items-center space-x-8'>
          <button
            className={`pb-2 text-sm font-medium ${filter === 'all' ? 'border-b-2 border-teal-600 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setFilter('all')}>
            <span>All</span>
            <Badge className='ml-2 rounded-full bg-teal-600 px-2 py-1 text-xs text-white'>{allCount}</Badge>
          </button>
          <button
            className={`pb-2 text-sm font-medium ${filter === 'unread' ? 'border-b-2 border-teal-600 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setFilter('unread')}>
            <span>Unread</span>
            <Badge className='ml-2 rounded-full bg-gray-400 px-2 py-1 text-xs text-white'>{notifCount}</Badge>
          </button>
        </div>

        {/* Mark All as Read Button */}
        {headerRight}
      </header>

      <PaginateCustom
        url={filter === 'unread' ? '/notifikasi-unread' : '/notifikasi'}
        id='notifications'
        perPage={10}
        queryKey={['/notifikasi', filter, search]}
        renderItem={(item: NotificationItem, index: number) => renderNotification(item)}
        emptyMessage='Tidak ada notifikasi'
        containerClassName='flex flex-col gap-3'
        showToolbar={false}
        payload={{ search }}
      />
    </section>
  );
});

export default NotifikasiPage;
