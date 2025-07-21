'use client';

import { memo, useState } from 'react';

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
import { createTipe, deleteTipe, getAllTipe, updateTipe } from '@/services/tipe';
import { CreateTipeData, TipeData } from '@/types/tipe';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { TipeForm } from './form';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<TipeData>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('name', {
    header: 'Nama',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
    meta: { style: { minWidth: '180px' } }
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
      queryClient.invalidateQueries({ queryKey: ['/tipe'] });
    }
  });

  const [openForm, setOpenForm] = useState(false);
  const [selectedData, setSelectedData] = useState<TipeData | null>(null);

  const handleEdit = (data: TipeData) => {
    setSelectedData(data);
    setOpenForm(true);
  };

  const handleDeleteTipe = async (data: TipeData) => {
    handleDelete(`/tipe/${data.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedData(null);
  };

  const handleFormSubmit = async (data: CreateTipeData) => {
    try {
      if (selectedData) {
        await updateTipe(selectedData.id, data);
      }
      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['/tipe'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeleteTipe(row.original)} variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Tipe</DialogTitle>
            <DialogDescription>Edit data tipe di form berikut.</DialogDescription>
          </DialogHeader>
          <TipeForm
            selectedId={selectedData?.id ?? null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const TipePage = memo(function TipePage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery(['/tipe'], getAllTipe);
  const createMutation = useMutation(createTipe, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/tipe'] })
  });

  const handleCreate = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleFormSubmit = async (data: CreateTipeData) => {
    try {
      await createMutation.mutateAsync(data);
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <section className='p-4'>
      <PageTitle title='Master Tipe' />
      <PaginateTable
        columns={columns}
        id='tipe'
        perPage={10}
        queryKey={['/tipe']}
        url='/tipe'
        Plugin={() => (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className='text-white'>
            <Plus />
            Tambah Tipe
          </Button>
        )}
      />
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Tipe</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah tipe baru.</DialogDescription>
          </DialogHeader>
          <TipeForm
            selectedId={null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
});

export default TipePage;
