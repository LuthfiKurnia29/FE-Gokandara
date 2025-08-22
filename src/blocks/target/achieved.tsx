'use client';

import { memo } from 'react';

import { PaginateTable } from '@/components/paginate-table';
import { TargetWithRelations } from '@/types/target';
import { createColumnHelper } from '@tanstack/react-table';

import { format } from 'date-fns';

interface AchievedUser {
  id: number;
  name: string;
  email: string;
  total_penjualan: number;
  created_at?: string;
}

const columnHelper = createColumnHelper<AchievedUser>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('name', {
    header: 'Nama',
    cell: ({ getValue }) => <span className='text-sm font-medium'>{getValue()}</span>,
    meta: { style: { minWidth: '160px' } }
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: ({ getValue }) => <span className='text-sm'>{getValue()}</span>,
    meta: { style: { minWidth: '200px' } }
  }),
  columnHelper.accessor('total_penjualan', {
    header: 'Total Penjualan',
    cell: ({ getValue }) => (
      <span className='text-sm font-medium'>Rp {Number(getValue() || 0).toLocaleString('id-ID')}</span>
    ),
    meta: { style: { minWidth: '160px' } }
  })
];

export const TargetAchievedTable = memo(function TargetAchievedTable({ id }: { id: number }) {
  return (
    <PaginateTable
      columns={columns}
      url={`/target/${id}/achieved`}
      id={`target-achieved-${id}`}
      perPage={10}
      queryKey={[`/target/${id}/achieved`]}
      payload={{}}
      Plugin={() => null}
    />
  );
});
