'use client';

import { memo, useState } from 'react';

import { SkemaPembayaranForm } from '@/blocks/master-data/skema-pembayaran/form';
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
import {
  useCreateSkemaPembayaran,
  useDeleteSkemaPembayaran,
  useUpdateSkemaPembayaran
} from '@/services/skema-pembayaran';
import { CreateSkemaPembayaranData, SkemaPembayaran } from '@/types/skema-pembayaran';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<SkemaPembayaran>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('nama', {
    header: 'Nama Skema Pembayaran',
    cell: ({ getValue }) => {
      return <span className='font-medium'>{getValue()}</span>;
    },
    meta: { style: { minWidth: '250px' } }
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
      queryClient.invalidateQueries({ queryKey: ['/list-skema-pembayaran'] });
      queryClient.invalidateQueries({ queryKey: ['/all-skema-pembayaran'] });
    }
  });

  const updateSkemaPembayaran = useUpdateSkemaPembayaran();
  const deleteSkemaPembayaran = useDeleteSkemaPembayaran();

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<SkemaPembayaran | null>(null);

  const handleEdit = (skemaPembayaran: SkemaPembayaran) => {
    setSelectedId(skemaPembayaran.id);
    setSelectedData(skemaPembayaran);
    setOpenForm(true);
  };

  const handleDeleteSkemaPembayaran = async (skemaPembayaran: SkemaPembayaran) => {
    handleDelete(`/delete-skema-pembayaran/${skemaPembayaran.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
    setSelectedData(null);
  };

  const handleFormSubmit = async (data: CreateSkemaPembayaranData) => {
    try {
      if (selectedId) {
        await updateSkemaPembayaran.mutateAsync({ id: selectedId, data });
        toast.success('Skema pembayaran berhasil diperbarui');
      }
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan!');
      console.error('Error updating skema pembayaran:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            disabled={updateSkemaPembayaran.isPending || deleteSkemaPembayaran.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updateSkemaPembayaran.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteSkemaPembayaran(row.original)}
            disabled={deleteSkemaPembayaran.isPending}
            variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Skema Pembayaran</DialogTitle>
            <DialogDescription>Edit data skema pembayaran di form berikut.</DialogDescription>
          </DialogHeader>

          <SkemaPembayaranForm
            selectedId={selectedId}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={updateSkemaPembayaran.isPending}
            defaultValues={selectedData ? { nama: selectedData.nama, details: selectedData.details } : undefined}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const SkemaPembayaranPage = memo(function SkemaPembayaranPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);

  // API hooks
  const createSkemaPembayaran = useCreateSkemaPembayaran();

  const handleCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFormSubmit = async (data: CreateSkemaPembayaranData) => {
    try {
      await createSkemaPembayaran.mutateAsync(data);
      toast.success('Skema pembayaran berhasil ditambahkan');
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan!');
      console.error('Error saving skema pembayaran:', error);
    }
  };

  const isFormLoading = createSkemaPembayaran.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='Skema Pembayaran Management' />

      <PaginateTable
        columns={columns}
        url='/list-skema-pembayaran'
        id='skema-pembayaran'
        perPage={10}
        queryKey={['/list-skema-pembayaran']}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah Skema Pembayaran
          </Button>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Skema Pembayaran</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah skema pembayaran baru.</DialogDescription>
          </DialogHeader>

          <SkemaPembayaranForm
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

export default SkemaPembayaranPage;
