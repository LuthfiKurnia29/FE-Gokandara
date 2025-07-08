'use client';

import { useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateCustom } from '@/components/paginate-custom';
import { Button } from '@/components/ui/button';
import { useDelete } from '@/hooks/use-delete';
import { KonsumenData } from '@/types/konsumen';
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

  const renderItem = (item: KonsumenData, index: number) => {
    return <div>{item.name}</div>;
  };

  return (
    <section className='p-4'>
      <PageTitle title='Data Konsumen' />
      <div className='mb-4 flex items-center justify-between'>
        <Button onClick={() => setOpenForm(true)}>Tambah Konsumen</Button>
      </div>
      <PaginateCustom url='/konsumen' id='konsumen' renderItem={renderItem} />

      <DeleteConfirmDialog />
    </section>
  );
}
