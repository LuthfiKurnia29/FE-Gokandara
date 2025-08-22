'use client';

import { memo, useState } from 'react';

import { useRouter } from 'next/navigation';

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
import axios from '@/lib/axios';
import { useCurrentUser } from '@/services/auth';
import { useCreateTarget, useDeleteTarget, useUpdateTarget } from '@/services/target';
import { CreateTargetData, TargetWithRelations } from '@/types/target';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Plus, Trash, Users } from 'lucide-react';
import { toast } from 'react-toastify';

// Helper function to format currency consistently
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

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
          <span className='font-medium'>{formatRupiah(value)}</span>
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
  // New columns for non-admin users
  columnHelper.accessor('total_penjualan', {
    header: 'Total Penjualan',
    cell: ({ getValue, row }) => {
      const value = getValue();
      // Only show for non-admin users (when total_penjualan exists)
      if (value !== undefined) {
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{formatRupiah(value)}</span>
          </div>
        );
      }
      return <span className='text-muted-foreground'>-</span>;
    },
    meta: { style: { minWidth: '150px' } }
  }),
  columnHelper.accessor('percentage', {
    header: 'Pencapaian',
    cell: ({ getValue, row }) => {
      const value = getValue();
      // Only show for non-admin users (when percentage exists)
      if (value !== undefined) {
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{value}%</span>
            <span className='text-muted-foreground text-xs'>dari target</span>
          </div>
        );
      }
      return <span className='text-muted-foreground'>-</span>;
    },
    meta: { style: { minWidth: '120px' } }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionCell row={row} />,
    meta: { style: { width: '100px' } }
  })
];

const ActionCell = memo(function ActionCell({ row }: { row: any }) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isAdmin = (currentUser?.roles || []).some(
    (r) => r.role.name?.toLowerCase() === 'admin' || r.role.code?.toLowerCase() === 'admin'
  );

  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/target'] });
    }
  });

  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();
  const router = useRouter();

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleEdit = (target: TargetWithRelations) => {
    setSelectedId(target.id);
    setOpenForm(true);
  };

  const handleDeleteTarget = async (target: TargetWithRelations) => {
    handleDelete(`/target/${target.id}`, 'delete');
  };

  const handleAchieved = (target: TargetWithRelations) => {
    router.push(`/target/${target.id}/achieved`);
  };

  const handleClaim = async (target: TargetWithRelations) => {
    try {
      await axios.post(`/target/${target.id}/claim`);
      toast.success('Berhasil claim bonus. Silakan tunggu konfirmasi Admin');
      // Refresh the data to update claim status
      queryClient.invalidateQueries({ queryKey: ['/target'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal melakukan claim');
    }
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
      {isAdmin ? (
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
            <DropdownMenuItem onClick={() => handleAchieved(row.original)}>
              <Users className='mr-2 h-4 w-4' />
              Pencapaian
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
      ) : (
        <div className='flex flex-col gap-1'>
          {row.original.has_claimed ? (
            <Badge variant='secondary' className='text-xs'>
              Sudah Claim
            </Badge>
          ) : row.original.is_achieved ? (
            <Button size='sm' onClick={() => handleClaim(row.original)} className='text-white' disabled={false}>
              Claim
            </Button>
          ) : (
            <Badge variant='outline' className='text-xs'>
              Belum Dicapai
            </Badge>
          )}
        </div>
      )}

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
  const { data: currentUser } = useCurrentUser();
  const isAdmin = (currentUser?.roles || []).some(
    (r) => r.role.name?.toLowerCase() === 'admin' || r.role.code?.toLowerCase() === 'admin'
  );

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
        Plugin={() =>
          isAdmin ? (
            <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
              <Plus />
              Tambah Target
            </Button>
          ) : null
        }
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
