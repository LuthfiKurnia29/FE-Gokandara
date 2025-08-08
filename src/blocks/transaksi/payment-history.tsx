'use client';

import { memo, useMemo, useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import { uncurrency } from '@/lib/utils';
import { useCreateRiwayatPembayaran, useUpdateRiwayatPembayaran } from '@/services/riwayat-pembayaran';
import { RiwayatPembayaranData } from '@/types/riwayat-pembayaran';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import PaymentHistoryForm, { PaymentHistoryFormData } from './payment-history-form';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<RiwayatPembayaranData>();

interface PaymentHistoryPageProps {
  transaksiId: number;
}

const PaymentHistoryPage = memo(function PaymentHistoryPage({ transaksiId }: PaymentHistoryPageProps) {
  const queryClient = useQueryClient();
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const createMutation = useCreateRiwayatPembayaran();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
        meta: { style: { width: '80px' } }
      }),
      columnHelper.accessor('tanggal', {
        header: 'Tanggal',
        cell: ({ getValue }) => <span className='text-sm'>{format(new Date(getValue()), 'dd/MM/yyyy')}</span>,
        meta: { style: { width: '140px' } }
      }),
      columnHelper.accessor('nominal', {
        header: 'Nominal',
        cell: ({ getValue }) => (
          <span className='font-semibold text-green-600'>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
              getValue()
            )}
          </span>
        ),
        meta: { style: { width: '160px' } }
      }),
      columnHelper.accessor('keterangan', {
        header: 'Keterangan'
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionCell row={row} transaksiId={transaksiId} />,
        meta: { style: { width: '80px' } }
      })
    ],
    [transaksiId]
  );

  const handleCreate = () => setOpenCreateForm(true);
  const handleCloseCreate = () => setOpenCreateForm(false);

  return (
    <section className='p-4'>
      <PageTitle title={`Riwayat Pembayaran #${transaksiId}`} />

      <div className='mb-4 flex items-center justify-end'>
        <Button onClick={handleCreate} className='text-white'>
          <Plus className='mr-2 h-4 w-4' /> Tambah Riwayat
        </Button>
      </div>

      <PaginateTable
        columns={columns}
        url={`/riwayat-pembayaran/${transaksiId}`}
        id='riwayat-pembayaran'
        perPage={10}
        queryKey={['/riwayat-pembayaran', transaksiId.toString()]}
      />

      {/* Create Dialog */}
      <Dialog open={openCreateForm} onOpenChange={setOpenCreateForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Riwayat Pembayaran</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah riwayat baru.</DialogDescription>
          </DialogHeader>
          <PaymentHistoryForm
            selectedData={null}
            onSubmit={async (data) => {
              try {
                await createMutation.mutateAsync({
                  transaksi_id: transaksiId,
                  tanggal: data.tanggal,
                  nominal: uncurrency(data.nominal),
                  keterangan: data.keterangan ?? ''
                });
                toast.success('Riwayat pembayaran berhasil dibuat');
                queryClient.invalidateQueries({ queryKey: ['/riwayat-pembayaran', transaksiId.toString()] });
                handleCloseCreate();
              } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Gagal membuat riwayat pembayaran');
              }
            }}
            onCancel={handleCloseCreate}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
});

interface ActionCellProps {
  row: any;
  transaksiId: number;
}
const ActionCell = memo(function ActionCell({ row, transaksiId }: ActionCellProps) {
  const queryClient = useQueryClient();
  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/riwayat-pembayaran', transaksiId.toString()] })
  });
  const updateMutation = useUpdateRiwayatPembayaran();
  const [openForm, setOpenForm] = useState(false);
  const [selectedData, setSelectedData] = useState<RiwayatPembayaranData | null>(null);

  const handleEdit = (data: RiwayatPembayaranData) => {
    setSelectedData(data);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedData(null);
  };

  const handleSubmit = async (data: PaymentHistoryFormData) => {
    try {
      if (selectedData) {
        await updateMutation.mutateAsync({
          id: selectedData.id,
          data: {
            tanggal: data.tanggal,
            nominal: uncurrency(data.nominal),
            keterangan: data.keterangan ?? ''
          }
        });
        toast.success('Riwayat pembayaran berhasil diupdate');
      }
      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['/riwayat-pembayaran', transaksiId.toString()] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal mengupdate riwayat pembayaran');
    }
  };

  const handleDeleteRow = (data: RiwayatPembayaranData) => {
    handleDelete(`/delete-riwayat-pembayaran/${data.id}`, 'delete');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' disabled={updateMutation.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updateMutation.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeleteRow(row.original)} variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Riwayat Pembayaran</DialogTitle>
            <DialogDescription>Edit data riwayat pembayaran di form berikut.</DialogDescription>
          </DialogHeader>
          <PaymentHistoryForm
            selectedData={selectedData}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

export default PaymentHistoryPage;
