'use client';

import { memo, useState } from 'react';

import { PenjualanForm } from '@/blocks/transaksi/form';
import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import {
  useCreatePenjualan,
  useDeletePenjualan,
  useUpdatePenjualan,
  useUpdatePenjualanStatus
} from '@/services/penjualan';
import { CreatePenjualanData, PenjualanWithRelations } from '@/types/penjualan';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import MetricsSection from './metric-section';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, MoreHorizontal, Pencil, Plus, ShieldCheck, ShoppingCart, Trash, Users } from 'lucide-react';

const columnHelper = createColumnHelper<PenjualanWithRelations>();

const columns = [
  columnHelper.accessor('id', {
    header: 'Order ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('createdAt', {
    header: 'Tanggal',
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return (
        <div className='flex flex-col'>
          <span className='text-sm'>{format(date, 'dd MMM yyyy', { locale: id })}</span>
          <span className='text-muted-foreground text-xs'>{format(date, 'HH:mm')}</span>
        </div>
      );
    },
    meta: { style: { width: '120px' } }
  }),
  columnHelper.accessor('konsumen.name', {
    header: 'Konsumen',
    cell: ({ row, getValue }) => {
      const konsumen = row.original.konsumen;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{getValue() || konsumen?.name || '-'}</span>
          {konsumen?.email && <span className='text-muted-foreground text-xs'>{konsumen.email}</span>}
        </div>
      );
    },
    meta: { style: { minWidth: '180px' } }
  }),
  columnHelper.accessor('property.name', {
    header: 'Properti',
    cell: ({ row, getValue }) => {
      const property = row.original.property;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{getValue() || property?.name || '-'}</span>
          {property?.code && <span className='text-muted-foreground text-xs'>{property.code}</span>}
        </div>
      );
    },
    meta: { style: { minWidth: '180px' } }
  }),
  columnHelper.accessor('property.location', {
    header: 'Lokasi',
    meta: { style: { minWidth: '180px' } }
  }),
  columnHelper.accessor('grandTotal', {
    header: 'Harga',
    cell: ({ getValue }) => {
      const total = getValue();
      return <span className='font-mono font-semibold'>Rp {total.toLocaleString('id-ID')}</span>;
    },
    meta: { style: { width: '140px' } }
  }),
  columnHelper.accessor('sales', {
    header: 'Sales'
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue();
      const getStatusStyle = () => {
        switch (status) {
          case 'Approved':
            return 'bg-green-500 text-white hover:bg-green-600';
          case 'Pending':
            return 'bg-orange-500 text-white hover:bg-orange-600';
          case 'Negotiation':
            return 'bg-blue-500 text-white hover:bg-blue-600';
          default:
            return 'bg-gray-500 text-white hover:bg-gray-600';
        }
      };

      return <Badge className={`text ${getStatusStyle()} rounded-full px-3 py-2`}>{status}</Badge>;
    },
    meta: { style: { width: '100px' } }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionCell row={row} />,
    meta: { style: { width: '80px' } }
  })
];

const ActionCell = memo(function ActionCell({ row }: { row: any }) {
  const queryClient = useQueryClient();
  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/penjualan'] });
    }
  });

  const updatePenjualan = useUpdatePenjualan();
  const deletePenjualan = useDeletePenjualan();
  const updatePenjualanStatus = useUpdatePenjualanStatus();

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleEdit = (penjualan: PenjualanWithRelations) => {
    setSelectedId(penjualan.id);
    setOpenForm(true);
  };

  const handleDeletePenjualan = async (penjualan: PenjualanWithRelations) => {
    handleDelete(`/penjualan/${penjualan.id}`, 'delete');
  };

  const handleApprovePenjualan = async (penjualan: PenjualanWithRelations) => {
    try {
      await updatePenjualanStatus.mutateAsync({ id: penjualan.id, data: { status: 'Approved' } });
    } catch (error) {
      // Error handled by mutation's onError callback and toast notifications
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
  };

  const handleFormSubmit = async (data: CreatePenjualanData) => {
    try {
      if (selectedId) {
        await updatePenjualan.mutateAsync({ id: selectedId, data });
      }
      handleCloseForm();
    } catch (error) {
      // Error handled by mutation's onError callback and toast notifications
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            disabled={updatePenjualan.isPending || deletePenjualan.isPending || updatePenjualanStatus.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updatePenjualan.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          {row.original.status !== 'Approved' && (
            <DropdownMenuItem
              onClick={() => handleApprovePenjualan(row.original)}
              disabled={updatePenjualanStatus.isPending}
              className='text-green-600'>
              <CheckCircle className='mr-2 h-4 w-4' />
              Approve
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => handleDeletePenjualan(row.original)}
            disabled={deletePenjualan.isPending}
            variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent
          className='max-h-[700px] w-full max-w-[95vw] border-0 p-0 lg:max-w-[1000px] xl:max-w-[1200px]'
          style={{
            height: 'min(700px, 85vh)',
            maxHeight: 'min(700px, 85vh)',
            minHeight: '500px'
          }}>
          {/* Add DialogTitle for accessibility (visually hidden) */}
          <DialogTitle className='sr-only'>{selectedId ? 'Edit Data Transaksi' : 'Tambah Data Transaksi'}</DialogTitle>

          {/* Add DialogDescription for accessibility (visually hidden) */}
          <DialogDescription className='sr-only'>
            {selectedId
              ? 'Form untuk mengedit data transaksi yang sudah ada'
              : 'Form untuk menambahkan data transaksi baru ke dalam sistem'}
          </DialogDescription>

          <PenjualanForm
            selectedId={selectedId}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={updatePenjualan.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const PenjualanPage = memo(function PenjualanPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);

  // API hooks
  const createPenjualan = useCreatePenjualan();

  const handleCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFormSubmit = async (data: CreatePenjualanData) => {
    try {
      await createPenjualan.mutateAsync(data);
      handleCloseForm();
    } catch (error) {
      // Error handled by mutation's onError callback and toast notifications
    }
  };

  const isFormLoading = createPenjualan.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='Penjualan' />

      {/* Metrics Section */}
      <MetricsSection />

      <PaginateTable
        columns={columns}
        url='/penjualan'
        id='penjualan'
        perPage={10}
        queryKey={['/penjualan']}
        payload={{ include: 'konsumen,property' }}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah Transaksi
          </Button>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent
          className='max-h-[700px] w-full max-w-[95vw] border-0 p-0 lg:max-w-[1000px] xl:max-w-[1200px]'
          style={{
            height: 'min(700px, 85vh)',
            maxHeight: 'min(700px, 85vh)',
            minHeight: '500px'
          }}>
          {/* Add DialogTitle for accessibility (visually hidden) */}
          <DialogTitle className='sr-only'>Tambah Data Transaksi</DialogTitle>

          {/* Add DialogDescription for accessibility (visually hidden) */}
          <DialogDescription className='sr-only'>
            Form untuk menambahkan data transaksi baru ke dalam sistem
          </DialogDescription>

          <PenjualanForm
            selectedId={null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
});

export default PenjualanPage;
