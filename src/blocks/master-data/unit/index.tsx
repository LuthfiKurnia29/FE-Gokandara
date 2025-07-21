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
import { createUnit, deleteUnit, getAllUnit, updateUnit } from '@/services/unit';
import { CreateUnitData, UnitData } from '@/types/unit';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { UnitForm } from './form';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<UnitData>();

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
      queryClient.invalidateQueries({ queryKey: ['/unit'] });
    }
  });

  const [openForm, setOpenForm] = useState(false);
  const [selectedData, setSelectedData] = useState<UnitData | null>(null);

  const handleEdit = (data: UnitData) => {
    setSelectedData(data);
    setOpenForm(true);
  };

  const handleDeleteUnit = async (data: UnitData) => {
    handleDelete(`/unit/${data.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedData(null);
  };

  const handleFormSubmit = async (data: CreateUnitData) => {
    try {
      if (selectedData) {
        await updateUnit(selectedData.id, data);
      }
      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['/unit'] });
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
          <DropdownMenuItem onClick={() => handleDeleteUnit(row.original)} variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Edit data unit di form berikut.</DialogDescription>
          </DialogHeader>
          <UnitForm
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

const UnitPage = memo(function UnitPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery(['/unit'], getAllUnit);
  const createMutation = useMutation(createUnit, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/unit'] })
  });

  const handleCreate = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleFormSubmit = async (data: CreateUnitData) => {
    try {
      await createMutation.mutateAsync(data);
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <section className='p-4'>
      <PageTitle title='Master Unit' />
      <PaginateTable
        columns={columns}
        id='unit'
        perPage={10}
        queryKey={['/unit']}
        url='/unit'
        Plugin={() => (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className='text-white'>
            <Plus />
            Tambah Unit
          </Button>
        )}
      />
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Unit</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah unit baru.</DialogDescription>
          </DialogHeader>
          <UnitForm
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

export default UnitPage;
