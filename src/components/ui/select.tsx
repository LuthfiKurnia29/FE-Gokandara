import React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { CheckIcon, ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectBoxProps {
  options: Option[];
  value?: string[] | string;
  onChange?: (values: string[] | string) => void;
  placeholder?: string;
  inputPlaceholder?: string;
  emptyPlaceholder?: string;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLInputElement, SelectBoxProps>(
  (
    { inputPlaceholder, emptyPlaceholder, placeholder, className, options, value, onChange, multiple, disabled },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [open, setOpen] = React.useState(false);

    const handleSelect = (selectedValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(selectedValue)
          ? currentValues.filter((v) => v !== selectedValue)
          : [...currentValues, selectedValue];
        onChange?.(newValues);
      } else {
        onChange?.(selectedValue);
        setOpen(false);
      }
    };

    const handleClear = () => {
      onChange?.(multiple ? [] : '');
    };

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const selectedOption = React.useMemo(() => {
      if (multiple) {
        return options.filter((option) => (Array.isArray(value) ? value.includes(option.value) : false));
      }
      return options.find((option) => option.value === value);
    }, [multiple, options, value]);

    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={cn('w-full justify-between', className)}
            onClick={() => {
              if (!disabled) {
                setOpen(!open);
              }
            }}
            disabled={disabled}>
            <div className='flex items-center gap-1 truncate'>
              {multiple ? (
                <div className='flex flex-wrap gap-1'>
                  {Array.isArray(selectedOption) && selectedOption.length > 0 ? (
                    selectedOption.map((option) => (
                      <div key={option.value} className='bg-accent flex items-center gap-1 rounded-md px-1 text-sm'>
                        {option.label}
                      </div>
                    ))
                  ) : (
                    <span className='text-muted-foreground mr-auto'>{placeholder}</span>
                  )}
                </div>
              ) : !Array.isArray(selectedOption) && selectedOption ? (
                selectedOption.label
              ) : (
                <span className='text-muted-foreground mr-auto'>{placeholder}</span>
              )}
            </div>
            <div className='text-muted-foreground/60 hover:text-foreground flex items-center self-stretch pl-1 [&>div]:flex [&>div]:items-center [&>div]:self-stretch'>
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
                ref={ref}
                placeholder={inputPlaceholder ?? 'Search...'}
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
              <CommandEmpty>{emptyPlaceholder ?? 'No results found.'}</CommandEmpty>
              <CommandGroup>
                <ScrollArea>
                  <div className='max-h-64'>
                    {filteredOptions?.map((option) => {
                      const isSelected = Array.isArray(value) && value.includes(option.value);
                      return (
                        <CommandItem
                          key={option.value}
                          // value={option.value}
                          onSelect={() => handleSelect(option.value)}>
                          {multiple && (
                            <div
                              className={cn(
                                'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                              )}>
                              <CheckIcon />
                            </div>
                          )}
                          <span>{option.label}</span>
                          {!multiple && option.value === value && (
                            <CheckIcon
                              className={cn('ml-auto', option.value === value ? 'opacity-100' : 'opacity-0')}
                            />
                          )}
                        </CommandItem>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

Select.displayName = 'Select';

export { Select };
