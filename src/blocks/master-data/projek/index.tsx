'use client';

import { memo, useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createProjek, deleteProjek, getAllProjek, updateProjek } from '@/services/projek';
import { CreateProjekData, ProjekData } from '@/types/projek';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { ProjekForm } from './form';
import { Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id',
    cell: (row: any) => <span className='font-mono text-sm'>#{row.getValue()}</span>,
    meta: { style: { width: '80px' } }
  },
  {
    header: 'Nama',
    accessorKey: 'name',
    cell: (row: any) => <span className='font-medium'>{row.getValue()}</span>,
    meta: { style: { minWidth: '180px' } }
  },
  {
    header: 'Actions',
    id: 'actions',
    cell: ({ row }: any) => <ActionCell row={row} />,
    meta: { style: { width: '80px' } }
  }
];

const ActionCell = memo(function ActionCell({ row }: { row: any }) {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedData, setSelectedData] = useState<ProjekData | null>(null);

  const handleEdit = (data: ProjekData) => {
    setSelectedData(data);
    setOpenForm(true);
  };

  const handleDelete = async (data: ProjekData) => {
    try {
      await deleteProjek(data.id);
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
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
      <Button variant='outline' size='sm' onClick={() => handleEdit(row.original)}>
        <Pencil className='h-4 w-4' />
      </Button>
      <Button variant='outline' size='sm' onClick={() => handleDelete(row.original)}>
        <Trash className='h-4 w-4' />
      </Button>
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit Projek</DialogTitle>
            <DialogDescription>Edit data projek di form berikut.</DialogDescription>
          </DialogHeader>
          <ProjekForm
            selectedData={selectedData}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>
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
            selectedData={null}
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
