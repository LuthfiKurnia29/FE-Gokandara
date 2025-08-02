'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { TargetForm } from '@/blocks/target/form';
import { PageTitle } from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useDelete } from '@/hooks/use-delete';
import axios from '@/lib/axios';
import { useCreateTarget, useDeleteTarget, useUpdateTarget } from '@/services/target';
import { CreateTargetData, TargetWithRelations } from '@/types/target';
import { useQueryClient } from '@tanstack/react-query';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const TargetPage = memo(function TargetPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [editTarget, setEditTarget] = useState<TargetWithRelations | null>(null);
  const [data, setData] = useState<TargetWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<TargetWithRelations | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  // CRUD hooks
  const createTarget = useCreateTarget();
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        search,
        include: 'role'
      });
      const res = await axios.get(`/target?${params}`);
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, perPage, search]);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPage(1);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  // Add
  const handleAdd = () => {
    setEditTarget(null);
    setOpenForm(true);
  };

  // Edit
  const handleEdit = (target: TargetWithRelations) => {
    setEditTarget(target);
    setOpenForm(true);
  };

  // Delete
  const handleDelete = (target: TargetWithRelations) => {
    setSelectedTarget(target);
    setOpenDelete(true);
  };

  // Submit form
  const handleFormSubmit = async (data: CreateTargetData) => {
    try {
      if (editTarget) {
        await updateTarget.mutateAsync({ id: editTarget.id, data });
        toast.success('Target berhasil diperbarui');
      } else {
        await createTarget.mutateAsync(data);
        toast.success('Target berhasil dibuat');
      }
      setOpenForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan target');
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedTarget) return;
    try {
      await deleteTarget.mutateAsync(selectedTarget.id);
      toast.success('Target berhasil dihapus');
      setOpenDelete(false);
      setSelectedTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus target');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(total / perPage);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Table columns
  const renderTable = () => (
    <div className='overflow-x-auto rounded-lg border bg-white'>
      <table className='min-w-full text-sm'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left font-semibold'>ID</th>
            <th className='px-4 py-2 text-left font-semibold'>Role</th>
            <th className='px-4 py-2 text-left font-semibold'>Tanggal Awal</th>
            <th className='px-4 py-2 text-left font-semibold'>Tanggal Akhir</th>
            <th className='px-4 py-2 text-left font-semibold'>Min. Penjualan</th>
            <th className='px-4 py-2 text-left font-semibold'>Hadiah</th>
            <th className='px-4 py-2 text-left font-semibold'>Tanggal Dibuat</th>
            <th className='px-4 py-2 text-left font-semibold'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={8} className='p-8 text-center text-gray-500'>
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={8} className='p-8 text-center text-red-500'>
                {error}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={8} className='p-8 text-center text-gray-500'>
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className='border-t'>
                <td className='px-4 py-2 font-mono'>#{row.id}</td>
                <td className='px-4 py-2'>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{row.role?.name || '-'}</span>
                    {row.role?.code && <span className='text-muted-foreground text-xs'>{row.role.code}</span>}
                  </div>
                </td>
                <td className='px-4 py-2'>{format(new Date(row.tanggal_awal), 'dd MMM yyyy', { locale: id })}</td>
                <td className='px-4 py-2'>{format(new Date(row.tanggal_akhir), 'dd MMM yyyy', { locale: id })}</td>
                <td className='px-4 py-2'>Rp {row.min_penjualan.toLocaleString('id-ID')}</td>
                <td className='max-w-[200px] px-4 py-2'>
                  <span className='line-clamp-2'>{row.hadiah}</span>
                </td>
                <td className='px-4 py-2'>
                  <div className='flex flex-col'>
                    <span>{format(new Date(row.created_at), 'dd MMM yyyy', { locale: id })}</span>
                    <span className='text-muted-foreground text-xs'>{format(new Date(row.created_at), 'HH:mm')}</span>
                  </div>
                </td>
                <td className='px-4 py-2'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => handleEdit(row)}>
                        <Pencil className='mr-2 h-4 w-4' /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(row)} className='text-red-600 focus:text-red-600'>
                        <Trash className='mr-2 h-4 w-4' /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Pagination controls
  const renderPagination = () => (
    <div className='flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between'>
      <div className='flex items-center gap-2'>
        <span className='text-sm'>Rows per page:</span>
        <select
          className='rounded border px-2 py-1 text-sm'
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}>
          {PAGE_SIZE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>
          Prev
        </Button>
        <span className='text-sm'>
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={!canNext}>
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <section className='p-4'>
      <PageTitle title='Target Management' />
      <div className='mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-2'>
          <Button onClick={handleAdd} className='gap-2 text-white'>
            <Plus className='h-4 w-4' /> Tambah Target
          </Button>
          <Input
            type='text'
            placeholder='Cari target...'
            className='w-64'
            onChange={handleSearchChange}
            defaultValue={search}
          />
        </div>
        <div className='text-muted-foreground text-sm'>Target penjualan dan bonus untuk setiap role</div>
      </div>
      {renderTable()}
      {renderPagination()}

      {/* Add/Edit Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Target' : 'Tambah Target'}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Perbarui informasi target dan bonus untuk role yang dipilih.'
                : 'Buat target penjualan dan bonus baru untuk role tertentu.'}
            </DialogDescription>
          </DialogHeader>
          <TargetForm
            target={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(false)}
            isLoading={createTarget.isPending || updateTarget.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Hapus Target</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus target ini? Data yang sudah dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpenDelete(false)}>
              Batal
            </Button>
            <Button variant='destructive' onClick={handleConfirmDelete} disabled={deleteTarget.isPending}>
              {deleteTarget.isPending ? (
                <span className='flex items-center gap-2'>
                  <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                  </svg>
                  Menghapus...
                </span>
              ) : (
                'Hapus'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
});

export default TargetPage;
