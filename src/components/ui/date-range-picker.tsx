'use client';

import { memo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  className?: string;
}

export const DateRangePicker = memo(function DateRangePicker({ className }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 0, 7));
  const [isOpen, setIsOpen] = useState(false);

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
          <Calendar mode='single' selected={startDate} onSelect={(date) => date && setStartDate(date)} initialFocus />
          <Calendar mode='single' selected={endDate} onSelect={(date) => date && setEndDate(date)} />
        </div>
      </PopoverContent>
    </Popover>
  );
});
