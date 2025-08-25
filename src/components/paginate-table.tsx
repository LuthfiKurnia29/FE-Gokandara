import { ReactNode, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, VisibilityState, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { format } from 'date-fns';
import { ChevronDown, Loader2, Settings2 } from 'lucide-react';

// Custom hook to debounce values
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Define types for the component props
interface PaginateTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  url: string;
  id: string;
  payload?: Record<string, any>;
  massSelect?: string[] | number[];
  onChangeMassSelect?: (values: any) => void;
  massSelectField?: string;
  Plugin?: () => ReactNode;
  grouped?: boolean;
  queryKey?: string[];
  perPage?: number;
  // When used inside another <form>, avoid nested <form> to prevent hydration errors
  searchIsForm?: boolean;
}

// Define types for the component ref
export interface PaginateTableRef {
  refetch: () => void;
  data: any;
}

// Define types for pagination data
interface PaginationData {
  data: any[];
  from?: number;
  to?: number;
  total?: number;
  current_page?: number;
  last_page?: number;
}

// Column visibility component
interface DataTableViewOptionsProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
}

function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ml-auto flex h-8 items-center gap-1'>
          <Settings2 className='h-4 w-4' />
          <span>View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Loading overlay component
const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className='bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
        <p className='text-muted-foreground text-sm'>Loading...</p>
      </div>
    </div>
  );
};

const perOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
];

const PaginateTable = memo(
  forwardRef<PaginateTableRef, PaginateTableProps<any>>(
    (
      {
        columns,
        url,
        id,
        payload = {},
        massSelect = [],
        onChangeMassSelect = () => {
          // No-op default implementation
        },
        massSelectField = 'uuid',
        Plugin = () => null,
        grouped = false,
        queryKey,
        perPage = 10,
        searchIsForm = true
      },
      ref
    ) => {
      const [search, setSearch] = useState('');
      const debouncedSearch = useDebounce(search, 500);
      const [page, setPage] = useState(1);
      const [per, setPer] = useState(perPage);
      const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
      const [isSearching, setIsSearching] = useState(false);

      const { data, isFetching, refetch } = useQuery<PaginationData>({
        queryKey: queryKey ? queryKey : [url, payload],
        queryFn: () =>
          axios
            .get(url, {
              params: {
                search: debouncedSearch,
                page,
                per: Number(per),
                // Mirror param for Laravel-style pagination
                per_page: Number(per),
                ...payload
              }
            })
            .then((res) => res.data),
        placeholderData: { data: [] }
      });

      useImperativeHandle(ref, () => ({
        refetch,
        data
      }));

      const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
          columnVisibility
        }
      });

      useEffect(() => {
        refetch();
      }, [debouncedSearch, per, page, refetch]);

      // Handle search input changes
      useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
          setIsSearching(false);
        }, 500);
        return () => clearTimeout(timer);
      }, [search]);

      const pagination = useMemo(() => {
        const lastPage = data?.last_page || 0;
        const limit = lastPage <= page + 1 ? 5 : 2;
        return Array.from({ length: lastPage }, (_, i) => i + 1).filter(
          (i) => i >= (page < 3 ? 3 : page) - limit && i <= (page < 3 ? 3 : page) + limit
        );
      }, [data?.current_page, page, data?.last_page]);

      const handleMassSelect = useCallback(
        (checked: boolean) => {
          if (checked && data?.data) {
            onChangeMassSelect(
              data.data.map((item) =>
                isNaN(item[massSelectField]) ? String(item[massSelectField]) : item[massSelectField]
              )
            );
          } else {
            onChangeMassSelect([]);
          }
        },
        [data?.data, massSelectField, onChangeMassSelect]
      );

      const handleSearch = useCallback(
        (e: React.FormEvent) => {
          e.preventDefault();
          refetch();
        },
        [refetch]
      );

      // Determine if we should show the loading overlay
      const showLoading = isFetching;

      return (
        <Card id={id} className='relative w-full'>
          <CardContent>
            <LoadingOverlay isLoading={showLoading} />
            <div className='mb-4 flex flex-wrap justify-between gap-2 pt-4'>
              <div className='flex items-center gap-2'>
                <DataTableViewOptions table={table} />
                {searchIsForm ? (
                  <form onSubmit={handleSearch} className='flex'>
                    <Input
                      type='search'
                      className='w-full'
                      placeholder='Cari ...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </form>
                ) : (
                  <div className='flex'>
                    <Input
                      type='search'
                      className='w-full'
                      placeholder='Cari ...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className='flex items-center gap-4'>
                <Plugin />
              </div>
            </div>
            <div className='rounded-md border'>
              <ScrollArea className='w-full max-w-full overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-muted'>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className='py-4 font-medium'
                            style={(header.column.columnDef.meta as any)?.style}>
                            {header.column.columnDef.header === 'check' && Boolean(data?.data?.length) ? (
                              <div className='flex h-4 w-4 items-center'>
                                <Checkbox
                                  className='h-5 w-5 cursor-pointer'
                                  checked={massSelect?.length === data?.data?.length}
                                  onCheckedChange={(checked) => handleMassSelect(checked as boolean)}
                                />
                              </div>
                            ) : header.isPlaceholder ? null : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, idx) => (
                        <TableRow
                          key={
                            grouped
                              ? `row.${row.original.type === 'group' ? row.original.date : (row.original.data?.uuid ?? idx)}`
                              : `row.${row.original.uuid ?? row.original.id ?? idx}`
                          }>
                          {row.original.type === 'group' ? (
                            <TableCell
                              key={`cell.${row.id}.${row.original.type === 'group' ? row.original.date : (row.original.data?.uuid ?? row.original.data?.id ?? idx)}`}
                              className={`py-4 ${
                                row.original.type === 'group' ? 'bg-blue-600/10 dark:bg-blue-300/10' : ''
                              }`}
                              colSpan={row.original.type === 'group' ? columns.length : 1}>
                              <div className='flex flex-col gap-2'>
                                {/* Patch: Client-only date formatting to prevent hydration mismatch */}
                                {(() => {
                                  const [formattedDate, setFormattedDate] = useState('');
                                  useEffect(() => {
                                    setFormattedDate(format(new Date(row.original.date), 'EEEE, dd MMMM yyyy'));
                                  }, [row.original.date]);
                                  return <p className='text-sm font-medium'>{formattedDate}</p>;
                                })()}
                              </div>
                            </TableCell>
                          ) : (
                            row.getVisibleCells().map((cell, indexCell) => {
                              if (grouped) {
                                return (
                                  <TableCell
                                    key={`cell.${cell.id}.${cell.row.original.uuid ?? cell.row.original.id ?? indexCell}`}
                                    className={`py-4 ${cell.row.original.type === 'group' ? 'bg-muted' : ''}`}
                                    colSpan={cell.row.original.type === 'group' ? columns.length : 1}
                                    style={(cell.column.columnDef.meta as any)?.style}>
                                    {cell.row.original.type === 'group' ? (
                                      <div className='flex flex-col gap-2'>
                                        {/* Patch: Client-only date formatting to prevent hydration mismatch */}
                                        {(() => {
                                          const [formattedDate, setFormattedDate] = useState('');
                                          useEffect(() => {
                                            setFormattedDate(
                                              format(new Date(cell.row.original.date), 'EEEE, dd MMMM yyyy')
                                            );
                                          }, [cell.row.original.date]);
                                          return <p className='text-sm font-medium'>{formattedDate}</p>;
                                        })()}
                                      </div>
                                    ) : (
                                      flexRender(cell.column.columnDef.cell, cell.getContext())
                                    )}
                                  </TableCell>
                                );
                              } else {
                                return (
                                  <TableCell
                                    key={`cell.${cell.id}.${cell.row.original.uuid ?? cell.row.original.id ?? indexCell}`}
                                    className='py-4'
                                    style={(cell.column.columnDef.meta as any)?.style}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCell>
                                );
                              }
                            })
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow key='no-data'>
                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                          <p className='text-muted-foreground text-sm'>Data not found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
            <div className='mt-4 flex items-center justify-end gap-2'>
              <div className='flex flex-1 flex-shrink-0 items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-sm'>Rows per page</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='sm' className='flex h-8 items-center gap-1'>
                        {per} <ChevronDown className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      {perOptions.map((option) => (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={per === option.value}
                          onCheckedChange={() => setPer(option.value)}>
                          {option.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className='text-muted-foreground text-sm'>
                  Page {data?.current_page || 1} of {data?.last_page || 1}
                </div>
              </div>
              <Pagination className='mx-0 w-auto'>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={cn('cursor-pointer', data?.current_page === 1 && 'pointer-events-none opacity-50')}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    />
                  </PaginationItem>

                  {pagination.map((item: number) => (
                    <PaginationItem key={item}>
                      <PaginationLink isActive={item === page} className='cursor-pointer' onClick={() => setPage(item)}>
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      className={cn(
                        'cursor-pointer',
                        data?.current_page === data?.last_page && 'pointer-events-none opacity-50'
                      )}
                      onClick={() => setPage((prev) => prev + 1)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      );
    }
  )
);

PaginateTable.displayName = 'PaginateTable';

export { PaginateTable };
