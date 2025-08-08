'use client';

import { memo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { uncurrency } from '@/lib/utils';
import { useRoleList } from '@/services/user';
import { CreateTargetData, TargetWithRelations } from '@/types/target';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validation schema
const targetSchema = z
  .object({
    role_id: z
      .number({
        required_error: 'Role harus dipilih'
      })
      .min(1, 'Role harus dipilih'),
    tanggal_awal: z
      .string({
        required_error: 'Tanggal awal harus diisi'
      })
      .min(1, 'Tanggal awal harus diisi'),
    tanggal_akhir: z
      .string({
        required_error: 'Tanggal akhir harus diisi'
      })
      .min(1, 'Tanggal akhir harus diisi'),
    min_penjualan: z
      .string({ required_error: 'Minimal penjualan harus diisi' })
      .min(1, 'Minimal penjualan harus diisi')
      .refine(
        (val) => {
          const num = uncurrency(String(val ?? ''));
          return !isNaN(num) && num >= 0;
        },
        { message: 'Minimal penjualan harus berupa angka positif' }
      ),
    hadiah: z
      .string({
        required_error: 'Hadiah harus diisi'
      })
      .min(1, 'Hadiah harus diisi')
  })
  .refine(
    (data) => {
      const startDate = new Date(data.tanggal_awal);
      const endDate = new Date(data.tanggal_akhir);
      return endDate >= startDate;
    },
    {
      message: 'Tanggal akhir harus lebih besar atau sama dengan tanggal awal',
      path: ['tanggal_akhir']
    }
  );

type TargetFormData = z.infer<typeof targetSchema>;

interface TargetFormProps {
  target?: TargetWithRelations | null;
  onSubmit: (data: CreateTargetData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TargetForm = memo(function TargetForm({ target, onSubmit, onCancel, isLoading = false }: TargetFormProps) {
  const { data: rolesData, isLoading: isLoadingRoles } = useRoleList();

  const form = useForm<TargetFormData>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      role_id: target?.role_id || 0,
      tanggal_awal: target?.tanggal_awal || '',
      tanggal_akhir: target?.tanggal_akhir || '',
      min_penjualan: target?.min_penjualan?.toString() || '',
      hadiah: target?.hadiah || ''
    }
  });

  // Update form when target changes
  useEffect(() => {
    if (target) {
      form.reset({
        role_id: target.role_id,
        tanggal_awal: target.tanggal_awal,
        tanggal_akhir: target.tanggal_akhir,
        min_penjualan: target.min_penjualan.toString(),
        hadiah: target.hadiah
      });
    } else {
      form.reset({
        role_id: 0,
        tanggal_awal: '',
        tanggal_akhir: '',
        min_penjualan: '',
        hadiah: ''
      });
    }
  }, [target, form]);

  const handleSubmit = (data: TargetFormData) => {
    const submitData: CreateTargetData = {
      role_id: data.role_id,
      tanggal_awal: data.tanggal_awal,
      tanggal_akhir: data.tanggal_akhir,
      min_penjualan: uncurrency(data.min_penjualan),
      hadiah: data.hadiah
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='role_id'>Role *</Label>
        <Select
          options={
            isLoadingRoles
              ? []
              : rolesData?.data?.map((role) => ({
                  value: role.id.toString(),
                  label: `${role.name} (${role.code})`
                })) || []
          }
          value={form.watch('role_id')?.toString() || ''}
          onChange={(value: string | string[]) => {
            if (typeof value === 'string') {
              form.setValue('role_id', parseInt(value));
            }
          }}
          placeholder='Pilih role'
          disabled={isLoading}
        />
        {form.formState.errors.role_id && (
          <p className='text-sm text-red-600'>{form.formState.errors.role_id.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='min_penjualan'>Minimal Penjualan *</Label>
        <Input
          id='min_penjualan'
          type='currency'
          placeholder='Masukkan minimal penjualan'
          disabled={isLoading}
          {...form.register('min_penjualan')}
        />
        {form.formState.errors.min_penjualan && (
          <p className='text-sm text-red-600'>{form.formState.errors.min_penjualan.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='tanggal_awal'>Tanggal Awal *</Label>
        <DateTimePicker
          value={form.watch('tanggal_awal') ? new Date(form.watch('tanggal_awal')) : undefined}
          onChange={(date: Date | undefined) => {
            form.setValue('tanggal_awal', date ? date.toISOString().split('T')[0] : '');
          }}
          placeholder='Pilih tanggal awal'
          format='dd/MM/yyyy'
          className='h-12'
          withInput={false}
          disabled={isLoading}
        />
        {form.formState.errors.tanggal_awal && (
          <p className='text-sm text-red-600'>{form.formState.errors.tanggal_awal.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='tanggal_akhir'>Tanggal Akhir *</Label>
        <DateTimePicker
          value={form.watch('tanggal_akhir') ? new Date(form.watch('tanggal_akhir')) : undefined}
          onChange={(date: Date | undefined) => {
            form.setValue('tanggal_akhir', date ? date.toISOString().split('T')[0] : '');
          }}
          placeholder='Pilih tanggal akhir'
          format='dd/MM/yyyy'
          className='h-12'
          withInput={false}
          disabled={isLoading}
        />
        {form.formState.errors.tanggal_akhir && (
          <p className='text-sm text-red-600'>{form.formState.errors.tanggal_akhir.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='hadiah'>Deskripsi Hadiah *</Label>
        <Textarea
          id='hadiah'
          {...form.register('hadiah')}
          placeholder='Masukkan deskripsi hadiah atau bonus yang akan diberikan'
          disabled={isLoading}
          rows={4}
        />
        {form.formState.errors.hadiah && <p className='text-sm text-red-600'>{form.formState.errors.hadiah.message}</p>}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' disabled={isLoading} className='text-white'>
          {isLoading ? 'Menyimpan...' : target ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});
