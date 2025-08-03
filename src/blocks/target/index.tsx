'use client';

import { memo, useState } from 'react';

import { TargetForm } from '@/blocks/target/form';
import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import { useCreateTarget, useDeleteTarget, useUpdateTarget } from '@/services/target';
import { CreateTargetData, TargetWithRelations } from '@/types/target';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Plus, Trash, Users } from 'lucide-react';
import { toast } from 'react-toastify';

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
      queryClient.invalidateQueries({ queryKey: ['/target'] });
    }
  });

  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleEdit = (target: TargetWithRelations) => {
    setSelectedId(target.id);
    setOpenForm(true);
  };

  const handleDeleteTarget = async (target: TargetWithRelations) => {
    handleDelete(`/target/${target.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
  };

  const handleFormSubmit = async (data: CreateTargetData) => {
    try {
      if (selectedId) {
        await updateTarget.mutateAsync({ id: selectedId, data });
      }
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi sesuatu Error!');
      console.error('Error updating target:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' disabled={updateTarget.isPending || deleteTarget.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updateTarget.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteTarget(row.original)}
            disabled={deleteTarget.isPending}
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
            <DialogTitle>Edit Target</DialogTitle>
            <DialogDescription>Edit data target di form berikut.</DialogDescription>
          </DialogHeader>

          <TargetForm
            target={row.original}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={updateTarget.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const TargetPage = memo(function TargetPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);

  // API hooks
  const createTarget = useCreateTarget();

  const handleCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFormSubmit = async (data: CreateTargetData) => {
    try {
      await createTarget.mutateAsync(data);
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi sesuatu Error!');
      console.error('Error saving target:', error);
    }
  };

  const isFormLoading = createTarget.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='Target Management' />

      <PaginateTable
        columns={columns}
        url='/target'
        id='target'
        perPage={10}
        queryKey={['/target']}
        payload={{ include: 'role' }}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah Target
          </Button>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Target</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah target baru.</DialogDescription>
          </DialogHeader>

          <TargetForm target={null} onSubmit={handleFormSubmit} onCancel={handleCloseForm} isLoading={isFormLoading} />
        </DialogContent>
      </Dialog>
    </section>
  );
});

export default TargetPage;
