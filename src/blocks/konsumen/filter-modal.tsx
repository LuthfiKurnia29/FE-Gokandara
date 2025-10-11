'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitive-select';
import { ProspekData } from '@/types/prospek';

import moment from 'moment';
import { type DateRange } from 'react-day-picker';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterValues) => void;
  initialFilters: FilterValues;
  prospekData: ProspekData[];
}

export interface FilterValues {
  dateRange: DateRange | undefined;
  selectedProspekId: string;
  selectedStatus: string;
  selectedMemberId: number | null;
  selectedMemberName: string;
}

export function FilterModal({ open, onOpenChange, onApplyFilters, initialFilters, prospekData }: FilterModalProps) {
  // Local state for filters
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  // Update local state when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range
    }));
  };

  // Handle prospek change
  const handleProspekChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedProspekId: value
    }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedStatus: value
    }));
  };

  // Handle member change
  const handleMemberChange = (memberId: number | null, memberName: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedMemberId: memberId,
      selectedMemberName: memberName
    }));
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    const clearedFilters: FilterValues = {
      dateRange: {
        from: new Date(moment().startOf('year').format('YYYY-MM-DD')),
        to: new Date(moment().endOf('year').format('YYYY-MM-DD'))
      },
      selectedProspekId: '',
      selectedStatus: '',
      selectedMemberId: null,
      selectedMemberName: ''
    };
    setFilters(clearedFilters);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  // Check if any filters are active
  const hasActiveFilters = filters.selectedProspekId || filters.selectedStatus || filters.selectedMemberId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Filter Data Konsumen</DialogTitle>
          <DialogDescription>Atur filter untuk menampilkan data konsumen sesuai kebutuhan</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Date Range Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Tanggal Range</label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              className='w-full'
            />
          </div>

          {/* Prospek Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Prospek</label>
            <Select value={filters.selectedProspekId} onValueChange={handleProspekChange}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Pilih Prospek' />
              </SelectTrigger>
              <SelectContent>
                {prospekData.map((prospek) => (
                  <SelectItem key={prospek.id} value={prospek.id.toString()}>
                    <div className='flex items-center gap-2'>
                      <div
                        className='h-3 w-3 rounded-full border border-gray-300'
                        style={{ backgroundColor: prospek.color || '#6B7280' }}
                      />
                      <span>{prospek.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Status</label>
            <Select value={filters.selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Pilih Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Pending'>Pending</SelectItem>
                <SelectItem value='Negotiation'>Negotiation</SelectItem>
                <SelectItem value='Approved'>Approved</SelectItem>
                <SelectItem value='ITJ'>ITJ</SelectItem>
                <SelectItem value='Akad'>Akad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Member Filter Display */}
          {filters.selectedMemberId && (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Filter Member</label>
              <div className='bg-primary/10 text-primary flex items-center justify-between rounded-lg px-3 py-2'>
                <span className='text-sm font-medium'>{filters.selectedMemberName}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleMemberChange(null, '')}
                  className='hover:bg-primary/20 h-6 w-6 p-0'>
                  <span className='sr-only'>Clear member filter</span>×
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          {hasActiveFilters && (
            <Button variant='outline' onClick={handleClearAllFilters}>
              Reset All
            </Button>
          )}
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleApplyFilters}>Terapkan Filter</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
