'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/services/auth';
import { useBlokById } from '@/services/blok';
import { CreatePesanData } from '@/types/pesan';
import { UserWithRelations } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { createColumnHelper } from '@tanstack/react-table';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const pesanSchema = z.object({
  user_penerima_id: z.array(z.number()).min(1, {
    message: 'Array must contain at least 1 number'
  }),
  pesan: z.string().min(1, 'Pesan wajib diisi'),
  file: z.array(z.any()).optional()
});

type PesanFormData = z.infer<typeof pesanSchema>;

interface PesanFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreatePesanData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<UserWithRelations>();

export const PesanForm = memo(function PesanForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: PesanFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    setValue,
    watch
  } = useForm<PesanFormData>({
    resolver: zodResolver(pesanSchema),
    defaultValues: { pesan: '' }
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (!selectedId) {
      reset({ pesan: '' });
    }
  }, [reset, selectedId]);

  const handleFormSubmit = (data: PesanFormData) => {
    const formData = new FormData();
    formData.append('pesan', data.pesan);
    data.user_penerima_id.forEach((id) => {
      formData.append('user_penerima_id[]', id.toString());
    });
    const file = watch('file');
    if (file && file?.length > 0) {
      formData.append('file', file[0].file as File);
    }
    onSubmit(formData as unknown as CreatePesanData);
  };

  const handleCancel = () => {
    reset({ pesan: '' });
    onCancel();
  };

  const { data: currentUser } = useCurrentUser();

  const [selectedUserId, setSelectedUserId] = useState<number[]>([]);
  const handlePilih = useCallback(
    (id: number) => {
      if (selectedUserId.includes(id)) {
        setSelectedUserId(selectedUserId.filter((item) => item != id));
      } else {
        const filtered = selectedUserId.filter((item) => item != id);
        filtered.push(id);
        setSelectedUserId(filtered);
      }
    },
    [selectedUserId]
  );

  useEffect(() => {
    setValue('user_penerima_id', selectedUserId);
  }, [selectedUserId]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        id: 'actions',
        header: 'check',
        cell: (cell) => (
          <Checkbox
            onClick={() => handlePilih(cell.getValue())}
            checked={selectedUserId.includes(cell.getValue())}
            className='h-5 w-5'>
            Pilih
          </Checkbox>
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nama',
        cell: ({ getValue }) => {
          return <span className='font-medium'>{getValue()}</span>;
        }
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ getValue }) => {
          return <span className='text-muted-foreground'>{getValue()}</span>;
        }
      }),
      columnHelper.accessor('nip', {
        header: 'NIP',
        cell: ({ getValue }) => {
          return <span className='text-muted-foreground'>{getValue()}</span>;
        }
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
        }
      })
    ],
    [selectedUserId, handlePilih]
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='max-h-[600px] space-y-6 overflow-y-auto'>
        <div className='space-y-2'>
          <Label htmlFor='pesan'>Kirim Pesan Kepada *</Label>
          <PaginateTable
            columns={columns}
            url='/user'
            id='user'
            perPage={10}
            queryKey={['/user']}
            payload={{
              include: 'role',
              roles: currentUser?.roles?.[0]?.role.name == 'Admin' ? ['Supervisor', 'Sales'] : ['Sales']
            }}
            massSelect={selectedUserId}
            onChangeMassSelect={setSelectedUserId}
            massSelectField='id'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='pesan'>Isi Pesan *</Label>
          <Textarea id='pesan' {...register('pesan')} placeholder='Masukkan isi pesan' disabled={isLoading} rows={5} />
          {errors.pesan && <p className='text-sm text-red-600'>{errors.pesan.message}</p>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='pesan'>
            File <span className='text-muted-foreground'>(Optional)</span>
          </Label>
          <Controller
            control={control}
            name='file'
            render={({ field: { value, onChange, ...field } }) => {
              return (
                <FileUpload
                  //   initialFiles={value ? value : []}
                  onupdatefiles={onChange}
                  allowMultiple={false}
                  labelIdle="Drag & Drop your logo or <span class='filepond--label-action'>Browse</span>"
                  acceptedFileTypes={['image/*']}
                  {...field}
                />
              );
            }}
          />
        </div>
      </div>
      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' disabled={isLoading}>
          Kirim Pesan
        </Button>
      </div>
    </form>
  );
});
