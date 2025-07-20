'use client';

import { memo, useState } from 'react';

import { KonsumenForm } from '@/blocks/konsumen/form';
import { PageTitle } from '@/components/page-title';
import { PaginateCustom } from '@/components/paginate-custom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import { useCreateKonsumen, useDeleteKonsumen, useUpdateKonsumen } from '@/services/konsumen';
import { KonsumenData } from '@/types/konsumen';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { Mail, MoreHorizontal, Pencil, PhoneCall, Plus, Trash, Video } from 'lucide-react';

const columnHelper = createColumnHelper<KonsumenData>();

const KonsumenPage = memo(function KonsumenPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });

  // API hooks
  const createKonsumen = useCreateKonsumen();
  const updateKonsumen = useUpdateKonsumen();
  const deleteKonsumen = useDeleteKonsumen();

  const handleCreate = () => {
    setMode('create');
    setSelectedId(null);
    setOpenForm(true);
  };

  const handleEdit = (konsumen: KonsumenData) => {
    setMode('edit');
    setSelectedId(konsumen.id);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
    setMode('create');
  };

  const handleFormSubmit = async (data: Omit<KonsumenData, 'id' | 'no'>) => {
    try {
      if (mode === 'create') {
        await createKonsumen.mutateAsync(data);
      } else if (selectedId) {
        await updateKonsumen.mutateAsync({ id: selectedId, data });
      }
      handleCloseForm();
    } catch (error) {
      // Error is handled by React Query's error boundary and toast notifications
      // No need for console.error in production
    }
  };

  const handleDeleteKonsumen = async (konsumen: KonsumenData) => {
    handleDelete(`/konsumen/${konsumen.id}`, 'delete');
  };

  const renderItem = (item: KonsumenData, index: number) => {
    return (
      <div className='flex h-full justify-between rounded-lg border bg-white p-4 shadow-sm'>
        <div className='flex-1'>
          <div className='flex gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex justify-between'>
                <div>
                  <h3 className='text-lg font-semibold'>{item.name}</h3>
                  {item.description && <p className='text-sm text-gray-600'>{item.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' disabled={updateKonsumen.isPending || deleteKonsumen.isPending}>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => handleEdit(item)} disabled={updateKonsumen.isPending}>
                      <Pencil className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteKonsumen(item)}
                      disabled={deleteKonsumen.isPending}
                      variant='destructive'>
                      <Trash className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='my-2 -ml-2 flex items-center gap-2'>
                <Button variant='ghost' size='icon'>
                  <PhoneCall className='h-4 w-4 text-gray-600' fill='currentColor' />
                </Button>
                <Button variant='ghost' size='icon'>
                  <Video className='h-4 w-4 text-gray-600' fill='currentColor' />
                </Button>
                <Button variant='ghost' size='icon'>
                  <Mail className='h-4 w-4 text-gray-600' fill='currentColor' />
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-2 space-y-1'>
            <p className='text-sm'>
              <span className='font-medium'>Email:</span> {item.email}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Phone:</span> {item.phone}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Alamat:</span> {item.address}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const isFormLoading = createKonsumen.isPending || updateKonsumen.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='Data Konsumen' />

      <PaginateCustom
        url='/konsumen'
        id='konsumen'
        perPage={12}
        containerClassName='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        renderItem={renderItem}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah Konsumen
          </Button>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent
          className='left-[56%] max-h-[700px] w-full max-w-[95vw] border-0 p-0 sm:max-w-[900px] md:max-w-[1000px] lg:max-w-[1200px]'
          style={{
            height: 'min(700px, 85vh)',
            maxHeight: 'min(700px, 85vh)',
            minHeight: '500px'
          }}>
          {/* Add DialogTitle for accessibility (visually hidden) */}
          <DialogTitle className='sr-only'>
            {mode === 'edit' ? 'Edit Data Konsumen' : 'Tambah Data Konsumen'}
          </DialogTitle>

          {/* Add DialogDescription for accessibility (visually hidden) */}
          <DialogDescription className='sr-only'>
            {mode === 'edit'
              ? 'Form untuk mengedit data konsumen yang sudah ada'
              : 'Form untuk menambahkan data konsumen baru ke dalam sistem'}
          </DialogDescription>

          <KonsumenForm
            selectedId={mode === 'edit' ? selectedId : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </section>
  );
});

export default KonsumenPage;
