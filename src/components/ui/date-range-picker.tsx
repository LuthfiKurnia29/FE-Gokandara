'use client';

import { memo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  className?: string;
  startDate?: Date;
  endDate?: Date;
  onChange?: (startDate: Date, endDate: Date) => void;
}

export const DateRangePicker = memo(function DateRangePicker({
  className,
  startDate: controlledStartDate,
  endDate: controlledEndDate,
  onChange
}: DateRangePickerProps) {
  const [internalStartDate, setInternalStartDate] = useState<Date>(new Date(2025, 0, 1));
  const [internalEndDate, setInternalEndDate] = useState<Date>(new Date(2025, 0, 7));
  const [isOpen, setIsOpen] = useState(false);

  // Use controlled values if provided, otherwise use internal state
  const startDate = controlledStartDate || internalStartDate;
  const endDate = controlledEndDate || internalEndDate;

  const handleStartDateChange = (date: Date) => {
    if (onChange) {
      onChange(date, endDate);
    } else {
      setInternalStartDate(date);
    }
  };

  const handleEndDateChange = (date: Date) => {
    if (onChange) {
      onChange(startDate, date);
    } else {
      setInternalEndDate(date);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'h-12 w-fit justify-between rounded-lg border-gray-200 bg-white px-4 py-2 font-normal text-gray-900 hover:bg-gray-50',
            className
          )}>
          <div className='flex items-center gap-3'>
            <span className='text-sm'>{formatDate(startDate)}</span>
            <span className='text-gray-400'>→</span>
            <span className='text-sm'>{formatDate(endDate)}</span>
          </div>
          <ChevronDown className='ml-3 h-4 w-4 text-gray-400' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='flex'>
          <Calendar
            mode='single'
            selected={startDate}
            onSelect={(date) => date && handleStartDateChange(date)}
            initialFocus
          />
          <Calendar mode='single' selected={endDate} onSelect={(date) => date && handleEndDateChange(date)} />
        </div>
      </PopoverContent>
    </Popover>
  );
});
