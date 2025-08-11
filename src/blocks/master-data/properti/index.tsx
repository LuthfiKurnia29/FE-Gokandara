'use client';

import { memo, useState } from 'react';

import { PropertiForm } from '@/blocks/master-data/properti/form';
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
import { useCreateProperty, useDeleteProperty, useUpdateProperty } from '@/services/properti';
import { CreatePropertyData, PropertyData, UpdatePropertyData } from '@/types/properti';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { PropertyDetailModal } from './detail';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<PropertyData>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('lokasi', {
    header: 'Lokasi',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
    meta: { style: { minWidth: '200px' } }
  }),
  columnHelper.display({
    id: 'luas',
    header: 'Luas (LB/LT)',
    cell: ({ row }) => {
      const properti = row.original;
      return (
        <span className='text-muted-foreground'>
          {properti.luas_bangunan} / {properti.luas_tanah}
        </span>
      );
    },
    meta: { style: { width: '120px' } }
  }),
  columnHelper.accessor('kelebihan', {
    header: 'Kelebihan',
    cell: ({ getValue }) => <span className='text-sm'>{getValue()}</span>,
    meta: { style: { minWidth: '150px' } }
  }),
  //   columnHelper.display({
  //     id: 'harga',
  //     header: 'Harga',
  //     cell: ({ row }) => {
  //       const harga = row.original.harga;
  //       return <span className='font-medium text-green-600'>Rp {harga.toLocaleString('id-ID')}</span>;
  //     },
  //     meta: { style: { width: '150px' } }
  //   }),
  columnHelper.display({
    id: 'relations',
    header: 'Proyek',
    cell: ({ row }) => {
      const properti = row.original;
      return (
        <div className='flex flex-col text-xs'>
          <span className='font-medium'>{properti.projek?.name || '-'}</span>
        </div>
      );
    },
    meta: { style: { minWidth: '150px' } }
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
      queryClient.invalidateQueries({ queryKey: ['/properti'] });
      toast.success('Data properti berhasil dihapus');
    }
  });

  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const createProperty = useCreateProperty();

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);

  const handleEdit = (property: PropertyData) => {
    console.log('Edit clicked for property:', property.id, property);
    setSelectedId(property.id);
    setOpenForm(true);
  };

  const handleDeleteProperty = async (property: PropertyData) => {
    handleDelete(`/properti/${property.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
  };

  const handleOpenDetail = (property: PropertyData) => {
    setSelectedId(property.id);
    setOpenDetailModal(true);
  };

  const handleFormSubmit = async (data: CreatePropertyData | UpdatePropertyData) => {
    try {
      if (selectedId) {
        // Edit mode - data is UpdatePropertyData
        await updateProperty.mutateAsync({ id: selectedId, data: data as UpdatePropertyData });
        toast.success('Data properti berhasil diperbarui');
      } else {
        // Create mode - data is CreatePropertyData
        await createProperty.mutateAsync(data as CreatePropertyData);
        toast.success('Data properti berhasil ditambahkan');
      }
      handleCloseForm();
    } catch (error: any) {
      console.error('Error submitting property data:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
      toast.error(errorMessage);

      // Log detailed error information
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' disabled={updateProperty.isPending || deleteProperty.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleOpenDetail(row.original)}>
            <Eye className='mr-2 h-4 w-4' />
            Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updateProperty.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteProperty(row.original)}
            disabled={deleteProperty.isPending}
            variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog key={`edit-dialog-${row.original.id || 'unknown'}`} open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Edit Data Properti</DialogTitle>
            <DialogDescription>Edit data properti yang sudah ada di form berikut.</DialogDescription>
          </DialogHeader>

          <PropertiForm
            selectedId={selectedId}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={updateProperty.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <PropertyDetailModal
        propertyId={selectedId}
        isOpen={openDetailModal}
        onOpenChange={(open) => {
          setOpenDetailModal(open);
          if (!open) {
            setSelectedId(null);
          }
        }}
      />

      <DeleteConfirmDialog />
    </>
  );
});

const PropertiPage = memo(function PropertiPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);

  // API hooks
  const createProperty = useCreateProperty();

  const handleCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFormSubmit = async (data: CreatePropertyData | UpdatePropertyData) => {
    try {
      // Create mode - data is CreatePropertyData
      await createProperty.mutateAsync(data as CreatePropertyData);
      toast.success('Data properti berhasil ditambahkan');
      handleCloseForm();
    } catch (error: any) {
      console.error('Error creating property data:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menambahkan data';
      toast.error(errorMessage);

      // Log detailed error information
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
  };

  const isFormLoading = createProperty.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='Master Properti' />

      <PaginateTable
        columns={columns}
        url='/properti'
        id='properti'
        perPage={10}
        queryKey={['/properti']}
        payload={{ include: ['projek', 'properti_gambar'] }}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah Properti
          </Button>
        )}
      />

      {/* Form Dialog */}
      <Dialog key='create-dialog-properti' open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Tambah Data Properti</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambahkan data properti baru ke dalam sistem.
            </DialogDescription>
          </DialogHeader>

          <PropertiForm
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

export default PropertiPage;
