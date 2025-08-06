'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useProspekById } from '@/services/prospek';
import { CreateProspekData, ProspekData } from '@/types/prospek';
import { zodResolver } from '@hookform/resolvers/zod';

import { CheckIcon, ChevronDown, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const prospekSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
  color: z.string().min(1, 'Warna wajib dipilih')
});

type ProspekFormData = z.infer<typeof prospekSchema>;

// Color options with visual indicators
const colorOptions = [
  { value: 'blue', label: 'Blue', color: '#3B82F6' },
  { value: 'green', label: 'Green', color: '#10B981' },
  { value: 'red', label: 'Red', color: '#EF4444' },
  { value: 'yellow', label: 'Yellow', color: '#F59E0B' },
  { value: 'purple', label: 'Purple', color: '#8B5CF6' },
  { value: 'orange', label: 'Orange', color: '#F97316' },
  { value: 'gray', label: 'Gray', color: '#6B7280' }
];

// Custom ColorSelect component
interface ColorSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ColorSelect = memo(function ColorSelect({ value, onChange, placeholder, disabled }: ColorSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOption = colorOptions.find((option) => option.value === value);
  const filteredOptions = colorOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue);
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
          onClick={() => {
            if (!disabled) {
              setOpen(!open);
            }
          }}
          disabled={disabled}>
          <div className='flex items-center gap-2 truncate'>
            {selectedOption ? (
              <>
                <div
                  className='h-4 w-4 flex-shrink-0 rounded-full border border-gray-300'
                  style={{ backgroundColor: selectedOption.color }}
                />
                <span>{selectedOption.label}</span>
              </>
            ) : (
              <span className='text-muted-foreground mr-auto'>{placeholder}</span>
            )}
          </div>
          <div className='text-muted-foreground/60 hover:text-foreground flex items-center self-stretch pl-1'>
            {value ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  if (!disabled) {
                    handleClear();
                  }
                }}>
                <X className='size-4' />
              </div>
            ) : (
              <div>
                <ChevronDown className='size-4' />
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
        <Command>
          <div className='relative'>
            <CommandInput
              value={searchTerm}
              onValueChange={(e) => setSearchTerm(e)}
              placeholder='Search colors...'
              className='h-9'
            />
            {searchTerm && (
              <div
                className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3'
                onClick={() => setSearchTerm('')}>
                <X className='size-4' />
              </div>
            )}
          </div>
          <CommandList>
            <CommandEmpty>No colors found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea>
                <div className='max-h-64'>
                  {filteredOptions.map((option) => (
                    <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                      <div className='flex w-full items-center gap-2'>
                        <div
                          className='h-4 w-4 flex-shrink-0 rounded-full border border-gray-300'
                          style={{ backgroundColor: option.color }}
                        />
                        <span>{option.label}</span>
                        {option.value === value && <CheckIcon className='ml-auto h-4 w-4' />}
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

interface ProspekFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreateProspekData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProspekForm = memo(function ProspekForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: ProspekFormProps) {
  // Get existing data for edit mode using React Query hook
  const { data: existingData, isFetching } = useProspekById(selectedId || null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<ProspekFormData>({
    resolver: zodResolver(prospekSchema),
    defaultValues: { name: '', color: '' }
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (existingData && selectedId) {
      reset({ name: existingData.name, color: existingData.color });
    } else if (!selectedId) {
      reset({ name: '', color: '' });
    }
  }, [existingData, reset, selectedId]);

  const handleFormSubmit = (data: ProspekFormData) => {
    onSubmit({ name: data.name, color: data.color });
  };

  const handleCancel = () => {
    reset({ name: '', color: '' });
    onCancel();
  };

  // Show skeleton while fetching prospek data for edit mode
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
        <Label htmlFor='name'>Nama Prospek *</Label>
        <Input id='name' type='text' {...register('name')} placeholder='Masukkan nama prospek' disabled={isLoading} />
        {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='color'>Color *</Label>
        <Controller
          name='color'
          control={control}
          render={({ field }) => (
            <ColorSelect
              value={field.value}
              onChange={field.onChange}
              placeholder='Select an option'
              disabled={isLoading}
            />
          )}
        />
        {errors.color && <p className='text-sm text-red-600'>{errors.color.message}</p>}
      </div>

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
