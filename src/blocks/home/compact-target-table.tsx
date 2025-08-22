'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from '@/lib/axios';
import { TargetWithRelations } from '@/types/target';
import { useQuery } from '@tanstack/react-query';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Compact Target Table Component for Dashboard
const CompactTargetTable = () => {
  const [page, setPage] = React.useState(1);
  const perPage = 8; // Increased from 5 to make table larger

  const { data, isLoading } = useQuery({
    queryKey: ['/target', 'dashboard', page],
    queryFn: async () => {
      const response = await axios.get('/target', {
        params: {
          page,
          per: perPage,
          include: 'role'
        }
      });
      return response.data;
    }
  });

  const totalPages = data?.last_page || 1;
  const targets = data?.data || [];

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader className='bg-gray-50'>
            <TableRow>
              <TableHead className='py-3 text-sm font-medium'>ID</TableHead>
              <TableHead className='py-3 text-sm font-medium'>Role</TableHead>
              <TableHead className='py-3 text-sm font-medium'>Tanggal Awal</TableHead>
              <TableHead className='py-3 text-sm font-medium'>Tanggal Akhir</TableHead>
              <TableHead className='py-3 text-sm font-medium'>Min. Penjualan</TableHead>
              <TableHead className='py-3 text-sm font-medium'>Hadiah</TableHead>
              <TableHead className='py-3 text-sm font-medium'>Tanggal Dibuat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center text-sm text-gray-500'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : targets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center text-sm text-gray-500'>
                  Tidak ada data target
                </TableCell>
              </TableRow>
            ) : (
              targets.map((target: TargetWithRelations) => (
                <TableRow key={target.id} className='hover:bg-gray-50'>
                  <TableCell className='py-3'>
                    <span className='font-mono text-sm'>#{target.id}</span>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{target.role?.name || '-'}</span>
                      {target.role?.code && <span className='text-muted-foreground text-xs'>{target.role.code}</span>}
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex flex-col'>
                      <span className='text-sm'>
                        {format(new Date(target.tanggal_awal), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex flex-col'>
                      <span className='text-sm'>
                        {format(new Date(target.tanggal_akhir), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex flex-col'>
                      <span className='font-medium'>Rp {target.min_penjualan.toLocaleString('id-ID')}</span>
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='max-w-[200px]'>
                      <span className='line-clamp-2 text-sm'>{target.hadiah}</span>
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex flex-col'>
                      <span className='text-sm'>
                        {format(new Date(target.created_at), 'dd MMM yyyy', { locale: id })}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        {format(new Date(target.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>
            Halaman {page} dari {totalPages}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className='h-9 px-3'>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className='h-9 px-3'>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactTargetTable;
