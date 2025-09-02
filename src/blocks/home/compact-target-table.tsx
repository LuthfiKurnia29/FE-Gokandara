'use client';

import { PaginateTable } from '@/components/paginate-table';
import { ComponentWithDashboardProps } from '@/types/dashboard';
import { TargetWithRelations } from '@/types/target';
import { createColumnHelper } from '@tanstack/react-table';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const columnHelper = createColumnHelper<TargetWithRelations>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('role.name', {
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{role?.name || '-'}</span>
          {role?.code && <span className='text-muted-foreground text-xs'>{role.code}</span>}
        </div>
      );
    },
    meta: { style: { minWidth: '150px' } }
  }),
  columnHelper.accessor('tanggal_awal', {
    header: 'Tanggal Awal',
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return (
        <div className='flex flex-col'>
          <span className='text-sm'>{format(date, 'dd MMM yyyy', { locale: id })}</span>
        </div>
      );
    },
    meta: { style: { width: '120px' } }
  }),
  columnHelper.accessor('tanggal_akhir', {
    header: 'Tanggal Akhir',
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return (
        <div className='flex flex-col'>
          <span className='text-sm'>{format(date, 'dd MMM yyyy', { locale: id })}</span>
        </div>
      );
    },
    meta: { style: { width: '120px' } }
  }),
  columnHelper.accessor('min_penjualan', {
    header: 'Min. Penjualan',
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>Rp {value.toLocaleString('id-ID')}</span>
        </div>
      );
    },
    meta: { style: { minWidth: '150px' } }
  }),
  columnHelper.accessor('hadiah', {
    header: 'Hadiah',
    cell: ({ getValue }) => {
      const hadiah = getValue();
      return (
        <div className='max-w-[200px]'>
          <span className='line-clamp-2 text-sm'>{hadiah}</span>
        </div>
      );
    },
    meta: { style: { minWidth: '200px' } }
  }),
  columnHelper.accessor('created_at', {
    header: 'Tanggal Dibuat',
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return (
        <div className='flex flex-col'>
          <span className='text-sm'>{format(date, 'dd MMM yyyy', { locale: id })}</span>
          <span className='text-muted-foreground text-xs'>{format(date, 'HH:mm')}</span>
        </div>
      );
    },
    meta: { style: { width: '140px' } }
  })
];

// Compact Target Table Component for Dashboard
const CompactTargetTable = ({ dashboardData }: ComponentWithDashboardProps) => {
  // Extract filter parameters from dashboard data context
  const filterParams = dashboardData?.filterParams || {};

  return (
    <PaginateTable
      columns={columns}
      url='/target'
      id='target-dashboard'
      perPage={10}
      queryKey={['/target', 'dashboard']}
      payload={{ ...filterParams, include: 'role' }}
      Plugin={() => null} // No plugin/button
    />
  );
};

export default CompactTargetTable;
