'use client';

import { memo } from 'react';

import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserWithRelations } from '@/types/user';
import { createColumnHelper } from '@tanstack/react-table';

import { User } from 'lucide-react';

interface MemberFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (userId: number, userName: string) => void;
}

export const MemberFilterModal = memo(function MemberFilterModal({
  open,
  onOpenChange,
  onSelectMember
}: MemberFilterModalProps) {
  const handleSelectMember = (userId: number, userName: string) => {
    onSelectMember(userId, userName);
    onOpenChange(false);
  };

  const SelectButton = memo(({ user }: { user: UserWithRelations }) => {
    return (
      <Button
        size='sm'
        variant='outline'
        onClick={() => handleSelectMember(user.id, user.name)}
        className='flex items-center gap-2'>
        <User className='h-3 w-3' />
        Pilih
      </Button>
    );
  });

  SelectButton.displayName = 'SelectButton';

  const columnHelper = createColumnHelper<UserWithRelations>();

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: ({ getValue }) => <span className='font-mono text-sm font-medium'>#{getValue()}</span>,
      meta: { style: { width: '80px' } }
    }),
    columnHelper.accessor('name', {
      header: 'Nama',
      cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
      meta: { style: { width: '25%' } }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => <span className='text-muted-foreground text-sm'>{getValue()}</span>,
      meta: { style: { width: '35%' } }
    }),
    columnHelper.accessor('roles', {
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>{role?.name || '-'}</span>
            {role?.code && <span className='text-muted-foreground text-xs'>{role.code}</span>}
          </div>
        );
      },
      meta: { style: { width: '20%' } }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => <SelectButton user={row.original} />,
      meta: { style: { width: '100px' } }
    })
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px]'>
        <DialogHeader>
          <DialogTitle>Filter Berdasarkan Member</DialogTitle>
          <DialogDescription>
            Pilih member untuk memfilter daftar transaksi berdasarkan sales yang menangani.
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4 w-full'>
          <PaginateTable
            columns={columns}
            url='/user'
            id='member-filter'
            perPage={10}
            queryKey={['/user', 'member-filter']}
            payload={{
              role_id: 3,
              include: 'role'
            }}
            Plugin={() => null}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});
