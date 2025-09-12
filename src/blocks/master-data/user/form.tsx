'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoleList, useSupervisorList, useUserById } from '@/services/user';
import { CreateUserData, UserData } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';

import { Eye, EyeOff } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod validation schema
const userSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    nip: z.string(),
    role_id: z.number().min(1, 'Role wajib dipilih'),
    parent_id: z.number().optional().nullable(),
    password: z.string().optional(),
    password_confirmation: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // Add atasan validation for role_id 3
    if (data.role_id === 3 && (!data.parent_id || data.parent_id === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Atasan wajib dipilih untuk role ini',
        path: ['parent_id']
      });
    }

    // For new users, password is required
    if (!data.password || data.password.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password wajib diisi',
        path: ['password']
      });
    } else if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password minimal 6 karakter',
        path: ['password']
      });
    }

    // Password confirmation validation
    if (data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Konfirmasi password tidak sesuai',
        path: ['password_confirmation']
      });
    }
  });

// Schema for editing users (password optional)
const userEditSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    nip: z.string(),
    role_id: z.number().min(1, 'Role wajib dipilih'),
    parent_id: z.number().optional().nullable(),
    password: z.string().optional(),
    password_confirmation: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // Add atasan validation for role_id 3
    if (data.role_id === 3 && (!data.parent_id || data.parent_id === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Atasan wajib dipilih untuk role ini',
        path: ['parent_id']
      });
    }

    // For editing, password is optional but if provided, must meet requirements
    if (data.password && data.password.length > 0) {
      if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password minimal 6 karakter',
          path: ['password']
        });
      }

      // Password confirmation validation
      if (data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Konfirmasi password tidak sesuai',
          path: ['password_confirmation']
        });
      }
    }
  });

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateUserData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm = memo(function UserForm({ selectedId, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const { data: user, isFetching } = useUserById(selectedId || null, ['role']);
  const { data: roleData } = useRoleList();
  const { data: supervisorData } = useSupervisorList();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(selectedId ? userEditSchema : userSchema),
    defaultValues: {
      name: '',
      email: '',
      role_id: 0,
      parent_id: null,
      password: '',
      password_confirmation: ''
    }
  });

  // Watch role_id to conditionally render atasan select
  const roleId = watch('role_id');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordConfirmationVisibility = () => {
    setShowPasswordConfirmation(!showPasswordConfirmation);
  };

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role_id: user.roles[0].role_id,
        parent_id: Number(user.parent_id) || null,
        password: user.enc_pw || '',
        password_confirmation: user.enc_pw || ''
      });
    } else {
      reset({
        name: '',
        email: '',
        role_id: 0,
        parent_id: null,
        password: '',
        password_confirmation: ''
      });
    }
    setShowPassword(false);
    setShowPasswordConfirmation(false);
  }, [user, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    // For editing, only include password if it's provided
    const submitData: CreateUserData = {
      name: data.name,
      email: data.email,
      role_id: data.role_id,
      nip: data.nip,
      password: data.password || '',
      parent_id: data.role_id === 3 ? data.parent_id : null
    };

    // If editing and password is empty, remove password from data
    if (selectedId && (!data.password || data.password.length === 0)) {
      const { password, ...dataWithoutPassword } = submitData;
      onSubmit(dataWithoutPassword as CreateUserData);
    } else {
      onSubmit(submitData);
    }
  };

  const handleCancel = () => {
    reset({
      name: '',
      email: '',
      role_id: 0,
      parent_id: null,
      password: '',
      password_confirmation: ''
    });
    setShowPassword(false);
    setShowPasswordConfirmation(false);
    onCancel();
  };

  // Show skeleton while fetching user data for edit mode
  if (selectedId && isFetching) {
    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='flex justify-end space-x-2 pt-4'>
          <Skeleton className='h-10 w-16' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama' disabled={isLoading} />
        {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email *</Label>
        <Input id='email' type='email' {...register('email')} placeholder='Masukkan email' disabled={isLoading} />
        {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='nip'>NIP *</Label>
        <Input id='nip' type='nip' {...register('nip')} placeholder='Masukkan nip' disabled={isLoading} />
        {errors.nip && <p className='text-sm text-red-600'>{errors.nip.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='role_id'>Role *</Label>
        <Controller
          name='role_id'
          control={control}
          render={({ field }) => (
            <Select
              options={
                roleData?.data?.map((role) => ({
                  value: role.id.toString(),
                  label: role.name
                })) || []
              }
              value={field.value.toString()}
              onChange={(value) => field.onChange(Number(value))}
              placeholder='Pilih role'
              disabled={isLoading}
            />
          )}
        />
        {errors.role_id && <p className='text-sm text-red-600'>{errors.role_id.message}</p>}
      </div>

      {roleId === 3 && (
        <div className='space-y-2'>
          <Label htmlFor='parent_id'>Atasan *</Label>
          <Controller
            name='parent_id'
            control={control}
            render={({ field }) => (
              <Select
                options={
                  supervisorData?.data?.map((supervisor: UserData) => ({
                    value: supervisor.id.toString(),
                    label: supervisor.name
                  })) || []
                }
                value={field.value?.toString() || ''}
                onChange={(value) => field.onChange(Number(value))}
                placeholder='Pilih atasan'
                disabled={isLoading}
              />
            )}
          />
          {errors.parent_id && <p className='text-sm text-red-600'>{errors.parent_id.message}</p>}
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='password'>Password {selectedId ? '(Kosongkan jika tidak ingin mengubah)' : '*'}</Label>
        <div className='relative'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder='Masukkan password'
            disabled={isLoading}
            className='pr-10'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
            onClick={togglePasswordVisibility}
            disabled={isLoading}>
            {showPassword ? <EyeOff className='h-4 w-4 text-gray-500' /> : <Eye className='h-4 w-4 text-gray-500' />}
          </Button>
        </div>
        {errors.password && <p className='text-sm text-red-600'>{errors.password.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password_confirmation'>
          Konfirmasi Password {selectedId ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
        </Label>
        <div className='relative'>
          <Input
            id='password_confirmation'
            type={showPasswordConfirmation ? 'text' : 'password'}
            {...register('password_confirmation')}
            placeholder='Konfirmasi password'
            disabled={isLoading}
            className='pr-10'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
            onClick={togglePasswordConfirmationVisibility}
            disabled={isLoading}>
            {showPasswordConfirmation ? (
              <EyeOff className='h-4 w-4 text-gray-500' />
            ) : (
              <Eye className='h-4 w-4 text-gray-500' />
            )}
          </Button>
        </div>
        {errors.password_confirmation && <p className='text-sm text-red-600'>{errors.password_confirmation.message}</p>}
      </div>

      {selectedId && (
        <div className='rounded-md bg-blue-50 p-3'>
          <div className='flex'>
            <div className='text-sm text-blue-800'>
              <strong>Catatan:</strong> Kosongkan field password jika tidak ingin mengubah password yang sudah ada.
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : selectedId ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});
