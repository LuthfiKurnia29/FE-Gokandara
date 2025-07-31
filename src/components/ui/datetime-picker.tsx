'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { format, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  format?: string;
  withInput?: boolean;
  minDate?: Date; // Minimum allowed date
}

function formatDateTime(date: Date | undefined, formatStr: string = 'PPP p') {
  if (!date) {
    return '';
  }
  return format(date, formatStr);
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

// Function to check if a date is before today
function isDateBeforeToday(date: Date): boolean {
  const today = startOfDay(new Date());
  return isBefore(date, today);
}

// Helper function to format time for HTML time input
function formatTimeForInput(date: Date | undefined): string {
  if (!date) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  disabled = false,
  className,
  format: displayFormat = 'PPP p',
  withInput = false,
  minDate = startOfDay(new Date()) // Default to today
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [month, setMonth] = React.useState<Date | undefined>(value || new Date());
  const [inputValue, setInputValue] = React.useState(formatDateTime(value, displayFormat));

  // Sync with external value changes
  React.useEffect(() => {
    if (value !== date) {
      setDate(value);
      setInputValue(formatDateTime(value, displayFormat));
      if (value) {
        setMonth(value);
      }
    }
  }, [value, date, displayFormat]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If we have an existing time, preserve it
      const currentTime = date
        ? {
            hours: date.getHours(),
            minutes: date.getMinutes()
          }
        : {
            hours: new Date().getHours(),
            minutes: new Date().getMinutes()
          };

      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(currentTime.hours, currentTime.minutes, 0, 0);

      setDate(newDateTime);
      setInputValue(formatDateTime(newDateTime, displayFormat));
      onChange?.(newDateTime);
    } else {
      setDate(undefined);
      setInputValue('');
      onChange?.(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (date && e.target.value) {
      const [hours, minutes] = e.target.value.split(':').map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, 0, 0);

      setDate(newDateTime);
      setInputValue(formatDateTime(newDateTime, displayFormat));
      onChange?.(newDateTime);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the input value
    try {
      if (newValue) {
        const parsedDate = new Date(newValue);
        if (isValidDate(parsedDate)) {
          setDate(parsedDate);
          setMonth(parsedDate);
          onChange?.(parsedDate);
        }
      } else {
        setDate(undefined);
        onChange?.(undefined);
      }
    } catch (error) {
      // Handle parsing errors silently
    }
  };

  const handleInputBlur = () => {
    // Reset input to the selected date format if value doesn't match a valid date
    if (date) {
      setInputValue(formatDateTime(date, displayFormat));
    } else {
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  };

  // Disable dates before today
  const disabledDays = React.useMemo(() => {
    return {
      before: minDate
    };
  }, [minDate]);

  if (withInput) {
    return (
      <div className={cn('relative', className)}>
        <Input
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          className='pr-10'
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              disabled={disabled}
              className='absolute top-0 right-0 h-full px-3 hover:bg-transparent'>
              <CalendarIcon className='text-muted-foreground h-4 w-4' />
              <span className='sr-only'>Open calendar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <div className='p-3'>
              <Calendar
                mode='single'
                selected={date}
                onSelect={handleDateSelect}
                month={month}
                onMonthChange={setMonth}
                captionLayout='dropdown'
                startMonth={new Date(1970, 0)}
                endMonth={new Date(2050, 11)}
                disabled={disabledDays}
              />
              <div className='mt-3 border-t pt-3'>
                <div className='mb-2 flex items-center gap-2'>
                  <Clock className='text-muted-foreground h-4 w-4' />
                  <span className='text-sm font-medium'>Time</span>
                </div>
                <Input
                  type='time'
                  value={formatTimeForInput(date)}
                  onChange={handleTimeChange}
                  disabled={disabled}
                  className='w-full'
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Button-only version
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground', className)}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? formatDateTime(date, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='p-3'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            captionLayout='dropdown'
            startMonth={new Date(1970, 0)}
            endMonth={new Date(2050, 11)}
            disabled={disabledDays}
          />
          <div className='mt-3 border-t pt-3'>
            <div className='mb-2 flex items-center gap-2'>
              <Clock className='text-muted-foreground h-4 w-4' />
              <span className='text-sm font-medium'>Time</span>
            </div>
            <Input
              type='time'
              value={formatTimeForInput(date)}
              onChange={handleTimeChange}
              disabled={disabled}
              className='w-full'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export additional variants for specific use cases
export function DateTimePickerButton(props: Omit<DateTimePickerProps, 'withInput'>) {
  return <DateTimePicker {...props} withInput={false} />;
}

export function DateTimePickerInput(props: Omit<DateTimePickerProps, 'withInput'>) {
  return <DateTimePicker {...props} withInput={true} />;
}
