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
import { createProjek, deleteProjek, getAllProjek, updateProjek } from '@/services/projek';
import { CreateProjekData, ProjekData } from '@/types/projek';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { ProjekForm } from './form';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<ProjekData>();

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
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
    }
  });

  const [openForm, setOpenForm] = useState(false);
  const [selectedData, setSelectedData] = useState<ProjekData | null>(null);

  const handleEdit = (data: ProjekData) => {
    setSelectedData(data);
    setOpenForm(true);
  };

  const handleDeleteProjek = async (data: ProjekData) => {
    handleDelete(`/projek/${data.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedData(null);
  };

  const handleFormSubmit = async (data: CreateProjekData) => {
    try {
      if (selectedData) {
        await updateProjek(selectedData.id, data);
      }
      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
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
          <DropdownMenuItem onClick={() => handleDeleteProjek(row.original)} variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Projek</DialogTitle>
            <DialogDescription>Edit data projek di form berikut.</DialogDescription>
          </DialogHeader>
          <ProjekForm
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

const ProjekPage = memo(function ProjekPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery(['/projek'], getAllProjek);
  const createMutation = useMutation(createProjek, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/projek'] })
  });

  const handleCreate = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleFormSubmit = async (data: CreateProjekData) => {
    try {
      await createMutation.mutateAsync(data);
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <section className='p-4'>
      <PageTitle title='Master Projek' />
      <PaginateTable
        columns={columns}
        id='projek'
        perPage={10}
        queryKey={['/projek']}
        url='/projek'
        Plugin={() => (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className='text-white'>
            <Plus />
            Tambah Projek
          </Button>
        )}
      />
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Projek</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah projek baru.</DialogDescription>
          </DialogHeader>
          <ProjekForm
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

export default ProjekPage;
