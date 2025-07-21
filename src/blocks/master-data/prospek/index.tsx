'use client';

import { memo, useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createProspek, deleteProspek, getAllProspek, updateProspek } from '@/services/prospek';
import { CreateProspekData, ProspekData } from '@/types/prospek';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { ProspekForm } from './form';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
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
  const [selectedData, setSelectedData] = useState<ProspekData | null>(null);

  const handleEdit = (data: ProspekData) => {
    setSelectedData(data);
    setOpenForm(true);
  };

  const handleDelete = async (data: ProspekData) => {
    try {
      await deleteProspek(data.id);
      queryClient.invalidateQueries({ queryKey: ['/prospek'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedData(null);
  };

  const handleFormSubmit = async (data: CreateProspekData) => {
    try {
      if (selectedData) {
        await updateProspek(selectedData.id, data);
      }
      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['/prospek'] });
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
            <DialogTitle>Edit Prospek</DialogTitle>
            <DialogDescription>Edit data prospek di form berikut.</DialogDescription>
          </DialogHeader>
          <ProspekForm
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

const ProspekPage = memo(function ProspekPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery(['/prospek'], getAllProspek);
  const createMutation = useMutation(createProspek, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/prospek'] })
  });

  const handleCreate = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleFormSubmit = async (data: CreateProspekData) => {
    try {
      await createMutation.mutateAsync(data);
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <section className='p-4'>
      <PageTitle title='Master Prospek' />
      <PaginateTable
        columns={columns}
        id='prospek'
        perPage={10}
        queryKey={['/prospek']}
        url='/prospek'
        Plugin={() => (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className='text-white'>
            <Plus />
            Tambah Prospek
          </Button>
        )}
      />
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Tambah Prospek</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah prospek baru.</DialogDescription>
          </DialogHeader>
          <ProspekForm
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

export default ProspekPage;
