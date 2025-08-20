'use client';

import { memo, useMemo, useState } from 'react';

import { MemberFilterModal } from '@/blocks/konsumen/member-filter-modal';
import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LeaderboardItem } from '@/types/leaderboard';
import { createColumnHelper } from '@tanstack/react-table';

import { Filter, Mail, MessageCircle, Phone, PhoneCall, User, Video, X } from 'lucide-react';

const columnHelper = createColumnHelper<LeaderboardItem>();

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

const LeaderboardPage = memo(function LeaderboardPage() {
  const [memberFilterOpen, setMemberFilterOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string } | null>(null);
  const apiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/leaderboard` : '/api/leaderboard';

  const handleClearFilter = () => setSelectedMember(null);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'employee',
        header: () => <div className='w-full text-left'>Employee</div>,
        cell: ({ row }) => {
          const item = row.original;
          const name = item.name || item.user?.name || '-';
          const avatar = item.avatar_url || item.user?.avatar_url || 'https://github.com/shadcn.png';
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>{name}</span>
                <div className='mt-1 flex items-center gap-3 text-gray-400'>
                  <PhoneCall aria-label='Telepon' className='h-4 w-4' />
                  <Video aria-label='Video' className='h-4 w-4' />
                  <Mail aria-label='Email' className='h-4 w-4' />
                </div>
              </div>
            </div>
          );
        },
        meta: { style: { minWidth: '240px', width: '32%' } }
      }),
      columnHelper.accessor('leads', {
        header: () => <div className='w-full text-center'>Leads</div>,
        cell: ({ getValue }) => (
          <div className='flex w-full justify-center'>
            <Button
              variant='outline'
              className='rounded-full border-blue-500 bg-white px-4 py-1 text-sm font-medium text-blue-500 hover:bg-blue-50 hover:text-blue-600'>
              {getValue()} Leads
            </Button>
          </div>
        ),
        meta: { style: { minWidth: '120px', width: '16%' } }
      }),
      columnHelper.accessor('target_percentage', {
        header: () => <div className='w-full text-center'>Target</div>,
        cell: ({ getValue }) => <div className='w-full text-center font-medium'>{getValue()}%</div>,
        meta: { style: { minWidth: '100px', width: '14%' } }
      }),
      columnHelper.accessor('units_sold', {
        header: () => <div className='w-full text-center'>Unit Terjual</div>,
        cell: ({ getValue }) => <div className='w-full text-center font-medium'>{getValue()}</div>,
        meta: { style: { minWidth: '110px', width: '14%' } }
      }),
      columnHelper.accessor('revenue', {
        header: () => <div className='w-full text-center'>Revenue</div>,
        cell: ({ getValue }) => {
          const n = Number(getValue() || 0);
          const formatted = n.toLocaleString('id-ID');
          return <div className='w-full text-center font-medium'>Rp {formatted}</div>;
        },
        meta: { style: { minWidth: '160px', width: '24%' } }
      })
    ],
    []
  );

  return (
    <section className='p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <PageTitle title='Leaderboard' />
        <DateRangePicker />
      </div>

      {/* Top Sales Cards (fixed 3) */}
      <div className='mb-6 flex justify-center gap-6'>
        {[
          { name: 'Nama Sales', leads: 23, target: '100%', unitTerjual: 8, revenue: '16,5M' },
          { name: 'Nama Sales', leads: 23, target: '100%', unitTerjual: 8, revenue: '16,5M' },
          { name: 'Nama Sales', leads: 23, target: '100%', unitTerjual: 8, revenue: '16,5M' }
        ].map((sales, index) => (
          <Card key={`top-card-${index}`} className='w-96 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gray-300'>
                <User className='h-10 w-10 text-white' />
              </div>
            </div>
            <h3 className='mb-3 text-center text-lg font-semibold text-gray-900'>{sales.name}</h3>
            <div className='mb-6 flex justify-center gap-4'>
              <Phone className='h-5 w-5 text-gray-400' />
              <MessageCircle className='h-5 w-5 text-gray-400' />
              <Mail className='h-5 w-5 text-gray-400' />
            </div>
            <div className='mb-8 flex justify-center'>
              <Button
                variant='outline'
                className='rounded-full border-blue-500 bg-transparent px-6 py-2 text-blue-500 hover:bg-blue-50'>
                {sales.leads} Leads
              </Button>
            </div>
            <div className='flex items-end justify-between'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>{sales.target}</div>
                <div className='text-xs tracking-wide text-gray-500 uppercase'>TARGET</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>{sales.unitTerjual}</div>
                <div className='text-xs tracking-wide text-gray-500 uppercase'>UNIT TERJUAL</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>{sales.revenue}</div>
                <div className='text-xs tracking-wide text-gray-500 uppercase'>REVENUE</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <PaginateTable
        columns={columns}
        url={apiUrl}
        id='leaderboard-table'
        perPage={10}
        queryKey={['/leaderboard', selectedMember?.id?.toString() || 'all']}
        payload={{ ...(selectedMember?.id ? { member_id: selectedMember.id } : {}) }}
        Plugin={() => (
          <div className='flex items-center gap-2'>
            {selectedMember && (
              <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-3 py-1'>
                <span className='text-sm font-medium'>Filter: {selectedMember.name}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleClearFilter}
                  className='hover:bg-primary/20 h-6 w-6 p-0'>
                  <X className='h-3 w-3' />
                </Button>
              </div>
            )}
            <Button variant='outline' onClick={() => setMemberFilterOpen(true)} className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              Filter Berdasarkan Member
            </Button>
          </div>
        )}
      />

      <MemberFilterModal
        open={memberFilterOpen}
        onOpenChange={setMemberFilterOpen}
        onSelectMember={(userId, userName) => setSelectedMember({ id: userId, name: userName })}
      />
    </section>
  );
});

export default LeaderboardPage;
