'use client';

import { useState } from 'react';

import { KonsumenData } from '@/app/types/konsumen';
import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import Title from '@/components/ui/title';
import { useDelete } from '@/hooks/use-delete';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { Pencil, Trash } from 'lucide-react';

const columnHelper = createColumnHelper<KonsumenData>();

export default function KonsumenPage() {
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleEdit = (uuid: string) => {
    setSelected(uuid);
    setOpenForm(true);
  };

  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });

  const columns = [
    columnHelper.accessor('no', {
      header: '#',
      meta: {
        style: {
          width: '25px'
        }
      }
    }),
    columnHelper.accessor('name', {
      header: 'Nama Konsumen'
    }),
    columnHelper.accessor('id', {
      id: 'id',
      header: 'Aksi',
      cell: (cell) => (
        <div className='flex gap-2'>
          <Button variant={'secondary'} size={'icon'} onClick={() => handleEdit(cell.getValue() as string)}>
            <Pencil />
          </Button>
          <Button
            variant={'outline'}
            className='border-red-300 text-red-500 hover:bg-red-400 hover:text-white dark:border-red-600 dark:hover:bg-red-700'
            size={'icon'}
            onClick={() => handleDelete(`/konsumen/${cell.getValue()}`)}>
            <Trash />
          </Button>
        </div>
      )
    })
  ];

  return (
    <section className='p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <Title>Konsumen</Title>
        <Button onClick={() => setOpenForm(true)}>Tambah Konsumen</Button>
      </div>
      <PaginateTable url='/konsumen' id='konsumen' columns={columns} />

      <DeleteConfirmDialog />
    </section>
  );
}
