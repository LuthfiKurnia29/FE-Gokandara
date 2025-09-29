'use client';

import { memo, useState } from 'react';

import { UserForm } from '@/blocks/master-data/user/form';
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
import { useCreateUser, useDeleteUser, useUpdateUser } from '@/services/user';
import { CreateUserData, UserWithRelations } from '@/types/user';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Plus, Trash, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<UserWithRelations>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('name', {
    header: 'Nama',
    cell: ({ getValue }) => {
      return <span className='font-medium'>{getValue()}</span>;
    },
    meta: { style: { minWidth: '180px' } }
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: ({ getValue }) => {
      return <span className='text-muted-foreground'>{getValue()}</span>;
    },
    meta: { style: { minWidth: '200px' } }
  }),
  columnHelper.accessor('nip', {
    header: 'NIP',
    cell: ({ getValue }) => {
      return <span className='text-muted-foreground'>{getValue()}</span>;
    },
    meta: { style: { minWidth: '100px' } }
  }),
  columnHelper.accessor('roles', {
    header: 'Role',
    cell: ({ row, getValue }) => {
      const role = row.original.role;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{getValue()?.[0]?.role?.name || '-'}</span>
          {role?.code && <span className='text-muted-foreground text-xs'>{role.code}</span>}
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
      queryClient.invalidateQueries({ queryKey: ['/user'] });
    }
  });

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleEdit = (user: UserWithRelations) => {
    setSelectedId(user.id);
    setOpenForm(true);
  };

  const handleDeleteUser = async (user: UserWithRelations) => {
    handleDelete(`/user/${user.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
  };

  const handleFormSubmit = async (data: CreateUserData) => {
    try {
      if (selectedId) {
        await updateUser.mutateAsync({ id: selectedId, data });
      }
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi sesuatu Error!');
      console.error('Error updating user:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' disabled={updateUser.isPending || deleteUser.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updateUser.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteUser(row.original)}
            disabled={deleteUser.isPending}
            variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-h-[85vh] max-w-lg overflow-y-auto sm:max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Edit data user di form berikut.</DialogDescription>
          </DialogHeader>

          <UserForm
            selectedId={selectedId}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={updateUser.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const UserPage = memo(function UserPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);

  // API hooks
  const createUser = useCreateUser();

  const handleCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFormSubmit = async (data: CreateUserData) => {
    try {
      await createUser.mutateAsync(data);
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi sesuatu Error!');
      console.error('Error saving user:', error);
    }
  };

  const isFormLoading = createUser.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='User Management' />

      <PaginateTable
        columns={columns}
        url='/user'
        id='user'
        perPage={10}
        queryKey={['/user']}
        payload={{ include: 'role' }}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah User
          </Button>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-h-[85vh] max-w-lg overflow-y-auto sm:max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>Tambah User</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambah user baru.</DialogDescription>
          </DialogHeader>

          <UserForm
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

export default UserPage;
