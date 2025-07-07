import { ReactNode, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import axios from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

import { ChevronDown, Loader2 } from 'lucide-react';

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
interface PaginateCustomProps<TData> {
  url: string;
  id: string;
  payload?: Record<string, any>;
  renderItem: (item: TData, index: number) => ReactNode;
  Plugin?: () => ReactNode;
  queryKey?: string[];
  perPage?: number;
  emptyMessage?: string;
  containerClassName?: string;
}

// Define types for the component ref
export interface PaginateCustomRef {
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

const PaginateCustom = memo(
  forwardRef<PaginateCustomRef, PaginateCustomProps<any>>(
    (
      {
        url,
        id,
        payload = {},
        renderItem,
        Plugin = () => null,
        queryKey,
        perPage = 10,
        emptyMessage = 'Data not found',
        containerClassName = ''
      },
      ref
    ) => {
      const [search, setSearch] = useState('');
      const debouncedSearch = useDebounce(search, 500);
      const [page, setPage] = useState(1);
      const [per, setPer] = useState(perPage);
      const [isSearching, setIsSearching] = useState(false);

      const { data, isFetching, refetch } = useQuery<PaginationData>({
        queryKey: queryKey ? queryKey : [url, payload],
        queryFn: () =>
          axios
            .post(url, {
              search: debouncedSearch,
              page,
              per: Number(per),
              ...payload
            })
            .then((res) => res.data),
        placeholderData: { data: [] }
      });

      useImperativeHandle(ref, () => ({
        refetch,
        data
      }));

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
        <Card>
          <CardContent>
            <div id={id} className='relative w-full'>
              <LoadingOverlay isLoading={showLoading} />
              <div className='mb-4 flex flex-wrap justify-between gap-2 pt-4'>
                <div className='flex items-center gap-4'>
                  <Plugin />
                </div>
                <div className='flex items-center gap-2'>
                  <form onSubmit={handleSearch} className='flex'>
                    <Input
                      type='search'
                      className='w-full'
                      placeholder='Cari ...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </form>
                </div>
              </div>

              {/* Custom items container */}
              <div className={cn('space-y-4', containerClassName)}>
                {data?.data?.length ? (
                  data.data.map((item, index) => (
                    <div key={item.uuid || item.id || index}>{renderItem(item, index)}</div>
                  ))
                ) : (
                  <div className='flex h-24 items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>{emptyMessage}</p>
                  </div>
                )}
              </div>

              <div className='mt-4 flex items-center justify-end gap-2'>
                <div className='flex flex-1 flex-shrink-0 items-center gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>Items per page</span>
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
                        <PaginationLink
                          isActive={item === page}
                          className='cursor-pointer'
                          onClick={() => setPage(item)}>
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
            </div>
          </CardContent>
        </Card>
      );
    }
  )
);

PaginateCustom.displayName = 'PaginateCustom';

export { PaginateCustom };
