'use client';

import { memo, useMemo, useState } from 'react';

import { AddTransaksiModal } from '@/blocks/transaksi/add-transaksi-modal';
import BookingForm from '@/blocks/transaksi/booking-form';
import { EditTransaksiModal } from '@/blocks/transaksi/edit-transaksi-modal';
import PropertyTypeModal from '@/blocks/transaksi/form';
import { MemberFilterModal } from '@/blocks/transaksi/member-filter-modal';
import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import { useCurrentUser, usePermissions } from '@/services/auth';
import {
  useCreatePenjualan,
  useDeletePenjualan,
  usePenjualanById,
  useUpdatePenjualan,
  useUpdatePenjualanStatus
} from '@/services/penjualan';
import { useAllSkemaPembayaran } from '@/services/skema-pembayaran';
import { CreatePenjualanData, PenjualanWithRelations, UpdatePenjualanData } from '@/types/penjualan';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import MetricsSection from './metric-section';
import {
  CheckCircle,
  Clock,
  Eye,
  Filter,
  History,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

// Helper function to format currency consistently
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const columnHelper = createColumnHelper<PenjualanWithRelations>();

// Mapping from skema_pembayaran_id to skema name, updated inside component via hook
let skemaPembayaranMap: Record<number, string> = {};

const ActionCell = memo(function ActionCell({ row }: { row: any }) {
  const queryClient = useQueryClient();
  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/list-transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['/penjualan-metrics'] });
    }
  });

  const updatePenjualan = useUpdatePenjualan();
  const deletePenjualan = useDeletePenjualan();
  const updatePenjualanStatus = useUpdatePenjualanStatus();
  const { getUserData } = usePermissions();

  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;
  const userId = userData?.user?.id || 0;

  const canChangeStatus = () => {
    return userRole === 'Administrator' || userRole === 'Admin' || userRoleId === 1;
  };

  const canUpdateToNegotiation = (currentStatus: string) => {
    return (canChangeStatus() || userRoleId === 2) && currentStatus === 'Pending';
  };

  const canUpdateToApproved = (currentStatus: string) => {
    return canChangeStatus() && currentStatus === 'Negotiation';
  };

  const canUpdateToRejected = (currentStatus: string) => {
    return canChangeStatus() && currentStatus === 'Negotiation';
  };

  const canUpdateToPending = (currentStatus: string) => {
    return false;
  };

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const { data: detail, isFetching: isLoadingDetail } = usePenjualanById(detailId, [
    'konsumen',
    'properti',
    'blok',
    'tipe',
    'unit',
    // Sesuaikan nama relasi dengan konvensi backend
    'projek',
    'skema_pembayaran',
    'created_by'
  ]);

  // Perhitungan rincian pembayaran untuk popup Detail
  const selectedSkemaNama = (detail as any)?.skema_pembayaran?.nama || (detail as any)?.skemaPembayaran?.nama || '';
  const hargaDetail = Number(
    (detail as any)?.harga ??
      (detail as any)?.harga_asli ??
      (detail?.properti as any)?.harga ??
      detail?.grand_total ??
      0
  );
  const dpValueDetail = Number((detail as any)?.dp ?? 0);
  const dpPercentDetail = hargaDetail > 0 ? Math.round((dpValueDetail / hargaDetail) * 100) : 0;
  const sisaPembayaranDetail = Math.max(hargaDetail - dpValueDetail, 0);

  const paymentRowsDetail = useMemo(() => {
    const rows: { label: string; amount: number; periode: string }[] = [];
    if (!selectedSkemaNama) return rows;
    rows.push({ label: 'DP', amount: dpValueDetail, periode: '-' });

    if (selectedSkemaNama.includes('Cash By progress 3 lantai')) {
      const lantaiPct = dpPercentDetail >= 50 ? 15 : 20;
      const parts = [
        { label: 'Pengecoran Plat lantai 2', pct: lantaiPct },
        { label: 'Pengecoran Plat lantai 3', pct: lantaiPct },
        { label: 'Bangunan Hitam (Sudah Mau Masuk Acian)', pct: 10 },
        { label: 'Pengecatan Terakhir sebelum PDAM/PLN ter instal', pct: 10 }
      ];
      let assigned = dpValueDetail;
      for (let i = 0; i < parts.length; i++) {
        if (i < parts.length - 1) {
          const amt = Math.round((hargaDetail * parts[i].pct) / 100);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
          assigned += amt;
        } else {
          const amt = Math.max(hargaDetail - assigned, 0);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
        }
      }
    } else if (selectedSkemaNama.includes('Cash By progress 2 lantai')) {
      const platPct = dpPercentDetail >= 50 ? 30 : 40;
      const parts = [
        { label: 'Pengecoran Plat lantai 2', pct: platPct },
        { label: 'Bata terpasang 100%', pct: 10 },
        { label: 'Pengecatan Terakhir sebelum PDAM/PLN ter instal', pct: 10 }
      ];
      let assigned = dpValueDetail;
      for (let i = 0; i < parts.length; i++) {
        if (i < parts.length - 1) {
          const amt = Math.round((hargaDetail * parts[i].pct) / 100);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
          assigned += amt;
        } else {
          const amt = Math.max(hargaDetail - assigned, 0);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
        }
      }
    } else if (selectedSkemaNama.includes('Inhouse 3x')) {
      const n = 3;
      const total = sisaPembayaranDetail;
      let assigned = 0;
      for (let i = 1; i <= n; i++) {
        const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
        rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
        assigned += amt;
      }
    } else if (selectedSkemaNama.includes('Inhouse 6x')) {
      const n = 6;
      const total = sisaPembayaranDetail;
      let assigned = 0;
      for (let i = 1; i <= n; i++) {
        const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
        rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
        assigned += amt;
      }
    } else if (selectedSkemaNama.includes('Inhouse 12x')) {
      const n = 12;
      const total = sisaPembayaranDetail;
      let assigned = 0;
      for (let i = 1; i <= n; i++) {
        const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
        rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
        assigned += amt;
      }
    }
    return rows;
  }, [selectedSkemaNama, dpPercentDetail, dpValueDetail, hargaDetail, sisaPembayaranDetail]);

  const handleEdit = (penjualan: PenjualanWithRelations) => {
    if (penjualan.status === 'Approved' || penjualan.status === 'Rejected') {
      toast.warning('Transaksi dengan status Approved/Rejected tidak dapat diedit.');
      return;
    }
    setSelectedId(penjualan.id);
    setOpenForm(true);
  };

  const handleShowDetail = (penjualan: PenjualanWithRelations) => {
    setDetailId(penjualan.id);
    setOpenDetail(true);
  };

  const handleDeletePenjualan = async (penjualan: PenjualanWithRelations) => {
    handleDelete(`/delete-transaksi/${penjualan.id}`, 'delete');
  };

  const handleOpenRiwayat = (penjualan: PenjualanWithRelations) => {
    const skema = (penjualan as any).skema_pembayaran as string | undefined;
    if (skema === 'Cash Tempo' || skema === 'Kredit') {
      window.location.href = `/transaksi/${penjualan.id}`;
      return;
    }
    toast.info('Riwayat Pembayaran hanya untuk skema Cash Tempo atau Kredit');
  };

  const handleUpdateToNegotiation = async (penjualan: PenjualanWithRelations) => {
    try {
      await updatePenjualanStatus.mutateAsync({ id: penjualan.id, data: { status: 'Negotiation' } });
      toast.success('Status transaksi berhasil diubah menjadi Negotiation');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah status');
    }
  };

  const handleUpdateToApproved = async (penjualan: PenjualanWithRelations) => {
    try {
      await updatePenjualanStatus.mutateAsync({ id: penjualan.id, data: { status: 'Approved' } });
      toast.success('Status transaksi berhasil diubah menjadi Approved');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah status');
    }
  };

  const handleUpdateToRejected = async (penjualan: PenjualanWithRelations) => {
    try {
      await updatePenjualanStatus.mutateAsync({ id: penjualan.id, data: { status: 'Rejected' } });
      toast.success('Status transaksi berhasil diubah menjadi Rejected');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah status');
    }
  };

  const handleUpdateToPending = async (penjualan: PenjualanWithRelations) => {
    try {
      await updatePenjualanStatus.mutateAsync({ id: penjualan.id, data: { status: 'Pending' } });
      toast.success('Status transaksi berhasil diubah menjadi Pending');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah status');
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setShowBookingForm(false);
    setSelectedId(null);
    setFormData(null);
  };

  const handleProceedToBooking = (data: any) => {
    setFormData(data);
    setOpenForm(false);
    setShowBookingForm(true);
  };

  const handleBackToTypeSelection = () => {
    setShowBookingForm(false);
    setOpenForm(true);
  };

  const handleFormSubmit = async (data: CreatePenjualanData | UpdatePenjualanData) => {
    try {
      if (selectedId) {
        await updatePenjualan.mutateAsync({ id: selectedId, data: data as UpdatePenjualanData });
        toast.success('Data transaksi berhasil diperbarui');
      }
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            disabled={updatePenjualan.isPending || deletePenjualan.isPending || updatePenjualanStatus.isPending}>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleShowDetail(row.original)}>
            <Eye className='mr-2 h-4 w-4' />
            Detail
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleEdit(row.original)}
            disabled={updatePenjualan.isPending || ['Approved', 'Rejected'].includes(row.original.status)}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          {/* {(row.original as any).skema_pembayaran_id > 1 && (
            <DropdownMenuItem onClick={() => handleOpenRiwayat(row.original)} className='text-amber-600'>
              <History className='mr-2 h-4 w-4' />
              Riwayat Pembayaran
            </DropdownMenuItem>
          )} */}
          {canUpdateToNegotiation(row.original.status) && (
            <DropdownMenuItem
              onClick={() => handleUpdateToNegotiation(row.original)}
              disabled={updatePenjualanStatus.isPending}
              className='text-blue-600'>
              <MessageSquare className='mr-2 h-4 w-4' />
              Move to Negotiation
            </DropdownMenuItem>
          )}
          {canUpdateToApproved(row.original.status) && (
            <DropdownMenuItem
              onClick={() => handleUpdateToApproved(row.original)}
              disabled={updatePenjualanStatus.isPending}
              className='text-green-600'>
              <CheckCircle className='mr-2 h-4 w-4' />
              Approve
            </DropdownMenuItem>
          )}
          {canUpdateToRejected(row.original.status) && (
            <DropdownMenuItem
              onClick={() => handleUpdateToRejected(row.original)}
              disabled={updatePenjualanStatus.isPending}
              className='text-red-600'>
              <X className='mr-2 h-4 w-4' />
              Reject
            </DropdownMenuItem>
          )}
          {/* Removed "Move to Pending" option - Rejected status is final */}
          <DropdownMenuItem
            onClick={() => handleDeletePenjualan(row.original)}
            disabled={deletePenjualan.isPending}
            variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Transaksi Modal (menyamakan dengan create) */}
      <EditTransaksiModal open={openForm} onOpenChange={setOpenForm} transaksiId={selectedId} />

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className='max-h-[85vh] w-full max-w-[95vw] border-0 p-6 lg:max-w-[900px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>Ringkasan data transaksi</DialogDescription>
          </DialogHeader>

          <div className='max-h-[70vh] overflow-y-auto pt-2'>
            {!detail || isLoadingDetail ? (
              <div className='py-8 text-center text-sm text-gray-600'>Memuat detail transaksi...</div>
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>No. Transaksi</span>
                    <span className='font-mono text-sm font-medium'>#{detail.no_transaksi ?? '-'}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>Status</span>
                    <span className='text-sm font-medium'>{detail.status}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>Konsumen</span>
                    <span className='text-sm font-medium'>
                      {detail.konsumen?.name || (detail as any)?.konsumen?.nama || '-'}
                    </span>
                  </div>
                  {(detail.konsumen as any)?.email && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Email</span>
                      <span className='text-sm'>{(detail.konsumen as any)?.email}</span>
                    </div>
                  )}
                  {(detail.konsumen as any)?.telepon && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Telepon</span>
                      <span className='text-sm'>{(detail.konsumen as any)?.telepon}</span>
                    </div>
                  )}
                  {((detail as any)?.projek || detail.properti) && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Projek</span>
                      <span className='text-sm font-medium'>
                        {(detail as any)?.projek?.name || detail.properti?.lokasi || '-'}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>Tipe</span>
                    <span className='text-sm font-medium'>
                      {(detail as any)?.tipe?.nama || detail.tipe?.name || '-'}
                    </span>
                  </div>
                  {detail.blok?.name && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Blok</span>
                      <span className='text-sm font-medium'>{detail.blok?.name}</span>
                    </div>
                  )}
                  {detail.unit?.name && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Unit</span>
                      <span className='text-sm font-medium'>{detail.unit?.name}</span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  {(detail as any)?.kavling_dipesan !== undefined && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Kavling Dipesan</span>
                      <span className='text-sm font-medium'>{(detail as any)?.kavling_dipesan}</span>
                    </div>
                  )}
                  {detail.diskon !== null && detail.diskon !== undefined && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Diskon</span>
                      <span className='text-sm font-medium'>
                        {detail.tipe_diskon === 'percent'
                          ? `${detail.diskon}%`
                          : formatRupiah(Number(detail.diskon || 0))}
                        {detail.tipe_diskon ? ` (${detail.tipe_diskon})` : ''}
                      </span>
                    </div>
                  )}
                  {(detail as any)?.kelebihan_tanah !== undefined && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Kelebihan Tanah</span>
                      <span className='text-sm font-medium'>{(detail as any)?.kelebihan_tanah}</span>
                    </div>
                  )}
                  {(detail as any)?.harga_per_meter !== undefined && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Harga per Meter</span>
                      <span className='text-sm font-bold text-green-600'>
                        {formatRupiah(Number((detail as any)?.harga_per_meter || 0))}
                      </span>
                    </div>
                  )}
                  {(detail as any)?.harga !== undefined && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Harga</span>
                      <span className='text-sm font-bold text-green-600'>
                        {formatRupiah(Number((detail as any)?.harga || (detail.properti as any)?.harga || 0))}
                      </span>
                    </div>
                  )}
                  {detail.dp !== null && detail.dp !== undefined && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>DP</span>
                      <span className='text-sm font-bold text-green-600'>{formatRupiah(Number(detail.dp || 0))}</span>
                    </div>
                  )}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>Grand Total</span>
                    <span className='text-sm font-bold text-green-600'>
                      {formatRupiah(Number(detail.grand_total || 0))}
                    </span>
                  </div>
                  {(detail as any)?.skemaPembayaran?.nama && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Skema Pembayaran</span>
                      <span className='text-sm font-medium'>{(detail as any)?.skemaPembayaran?.nama}</span>
                    </div>
                  )}
                </div>

                {/* Rincian Pembayaran */}
                <div className='space-y-2 md:col-span-2'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Rincian Pembayaran</span>
                    <span className='text-sm text-gray-500'>Skema: {selectedSkemaNama || '-'}</span>
                  </div>
                  <div className='rounded-md border'>
                    {paymentRowsDetail.map((row, idx) => (
                      <div key={idx} className='flex items-center justify-between border-b p-3 last:border-b-0'>
                        <div>
                          <div className='text-sm font-medium'>{row.label}</div>
                          <div className='text-xs text-gray-500'>Periode: {row.periode}</div>
                        </div>
                        <div className='text-right font-medium'>Rp {row.amount.toLocaleString('id-ID')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='col-span-1 mt-4 grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>Dibuat</span>
                    <span className='text-sm'>
                      {detail.created_at
                        ? new Date(detail.created_at).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '-'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>Diperbarui</span>
                    <span className='text-sm'>
                      {detail.updated_at
                        ? new Date(detail.updated_at).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '-'}
                    </span>
                  </div>
                  {(detail as any)?.createdBy?.name && (
                    <div className='flex items-center justify-between md:col-span-2'>
                      <span className='text-sm text-gray-500'>Dibuat Oleh</span>
                      <span className='text-sm font-medium'>{(detail as any)?.createdBy?.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const PenjualanPage = memo(function PenjualanPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [showAddTransaksi, setShowAddTransaksi] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [showMemberFilter, setShowMemberFilter] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const { getUserData } = usePermissions();

  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;
  const userId = userData?.user?.id || 0;

  const canChangeStatus = () => {
    return userRole === 'Administrator' || userRole === 'Admin' || userRoleId === 1;
  };

  const canSeeFilterButton = () => {
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRole === 'Telemarketing' ||
      userRoleId === 1 ||
      userRoleId === 2 ||
      userRoleId === 5
    );
  };

  const canUpdateToNegotiation = (currentStatus: string) => {
    return (canChangeStatus() || userRoleId === 2) && currentStatus === 'Pending';
  };

  const canUpdateToApproved = (currentStatus: string) => {
    return canChangeStatus() && currentStatus === 'Negotiation';
  };

  const canUpdateToRejected = (currentStatus: string) => {
    return canChangeStatus() && currentStatus === 'Negotiation';
  };

  const canUpdateToPending = (currentStatus: string) => {
    return false;
  };

  const createPenjualan = useCreatePenjualan();
  const { data: skemaPembayaranOptions = [] } = useAllSkemaPembayaran();

  // Build a memoized map from id -> nama so columns can render names
  const skemaMap = useMemo(() => {
    const map: Record<number, string> = {};
    skemaPembayaranOptions.forEach((s: any) => {
      if (s && typeof s.id === 'number') {
        map[s.id] = s.nama;
      }
    });
    return map;
  }, [skemaPembayaranOptions]);

  // Expose to column cell (module-level variable referenced above)
  skemaPembayaranMap = skemaMap;

  const handleCreate = () => {
    // Hanya create baru; tidak terpengaruh status
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setShowBookingForm(false);
    setFormData(null);
  };

  const handleProceedToBooking = (data: any) => {
    setFormData(data);
    setOpenForm(false);
    setShowBookingForm(true);
  };

  const handleBackToTypeSelection = () => {
    setShowBookingForm(false);
    setOpenForm(true);
  };

  const handleFormSubmit = async (data: CreatePenjualanData | UpdatePenjualanData) => {
    try {
      const submitData: CreatePenjualanData = {
        no_transaksi: (data as any).no_transaksi!,
        konsumen_id: data.konsumen_id!,
        properti_id: data.properti_id!,
        blok_id: data.blok_id!,
        tipe_id: data.tipe_id!,
        unit_id: data.unit_id!,
        diskon: data.diskon ?? null,
        tipe_diskon: (data as any).tipe_diskon || 'percent',
        skema_pembayaran_id: (data as any).skema_pembayaran_id || 1,
        dp: (data as any).dp ?? null,
        jangka_waktu: (data as any).jangka_waktu ?? null,
        grand_total: (data as any).grand_total,
        status: 'Pending'
      };

      await createPenjualan.mutateAsync(submitData);
      toast.success('Data transaksi berhasil ditambahkan');
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menambahkan data');
    }
  };

  // Handle member filter selection
  const handleSelectMember = (userId: number, userName: string) => {
    setSelectedMemberId(userId);
    setSelectedMemberName(userName);
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setSelectedMemberId(null);
    setSelectedMemberName('');
  };

  const isFormLoading = createPenjualan.isPending;

  // Get current user to check role
  const { data: currentUser } = useCurrentUser();

  // Check if current user is Telemarketing
  const isTelemarketing = useMemo(() => {
    if (!currentUser?.roles) return false;
    // Check if user has Telemarketing role based on roles array
    return currentUser.roles.some(
      (userRole) =>
        userRole.role.name.toLowerCase() === 'telemarketing' || userRole.role.code.toLowerCase() === 'telemarketing'
    );
  }, [currentUser]);

  const columns = [
    columnHelper.accessor('no_transaksi', {
      header: 'Order ID',
      cell: ({ getValue }) => <span className='font-mono text-sm font-medium'>#{getValue()}</span>,
      meta: { style: { width: '100px' } }
    }),
    columnHelper.accessor((row) => (row as any).no_transaksi ?? '-', {
      id: 'no_transaksi',
      header: 'No. Transaksi',
      cell: ({ getValue }) => {
        const val = getValue() as number | string;
        return <span className='font-mono text-sm'>{val}</span>;
      },
      meta: { style: { width: '140px' } }
    }),
    columnHelper.accessor('created_at', {
      header: 'Waktu',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>
              {date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className='text-muted-foreground text-xs'>
              {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
      meta: { style: { width: '120px' } }
    }),
    columnHelper.accessor('konsumen.name', {
      header: 'Konsumen',
      cell: ({ row, getValue }) => {
        const konsumen = row.original.konsumen;
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{getValue() || konsumen?.name || '-'}</span>
            {konsumen?.email && <span className='text-muted-foreground text-xs'>{konsumen.email}</span>}
          </div>
        );
      },
      meta: { style: { minWidth: '180px' } }
    }),
    columnHelper.display({
      id: 'lokasi',
      header: 'Lokasi',
      cell: ({ row }) => {
        const projek = row.original.projek;
        return <span className='text-sm'>{projek?.address || '-'}</span>;
      },
      meta: { style: { minWidth: '200px' } }
    }),
    columnHelper.display({
      id: 'projek',
      header: 'Projek',
      cell: ({ row }) => {
        const projekName = (row.original as any)?.projek?.name || row.original.properti?.projek?.name || '-';
        return <span className='text-sm'>{projekName}</span>;
      },
      meta: { style: { minWidth: '200px' } }
    }),
    columnHelper.display({
      id: 'harga_asli',
      header: 'Harga (Sebelum Diskon)',
      cell: ({ row }) => {
        return (
          <div className='flex flex-col'>
            <span className='font-medium text-green-600'>{formatRupiah(row.original.harga_asli)}</span>
          </div>
        );
      },
      meta: { style: { width: '150px' } }
    }),
    columnHelper.display({
      id: 'harga_sesudah_diskon',
      header: 'Harga (Sesudah Diskon)',
      cell: ({ row }) => {
        const grandTotal = row.original.grand_total;

        return (
          <div className='flex flex-col'>
            <span className='font-bold text-green-600'>{formatRupiah(grandTotal)}</span>
          </div>
        );
      },
      meta: { style: { width: '150px' } }
    }),
    columnHelper.accessor((row) => (row as any).skema_pembayaran_id ?? '-', {
      id: 'skema_pembayaran_id',
      header: 'Skema Pembayaran',
      cell: ({ getValue }) => {
        const skemaId = getValue() as number | '-';

        if (skemaId === '-') {
          return <Badge className='rounded-full bg-gray-500 px-3 py-2 text-white hover:bg-gray-600'>-</Badge>;
        }

        const skemaName = skemaPembayaranMap[Number(skemaId)] || `Skema ${skemaId}`;

        // Default styling for all skema pembayaran
        const style = 'bg-emerald-500 text-white hover:bg-emerald-600';

        return <Badge className={`rounded-full px-3 py-2 ${style}`}>{skemaName}</Badge>;
      },
      meta: { style: { width: '160px' } }
    }),
    columnHelper.display({
      id: 'sales',
      header: 'Sales',
      cell: ({ row }) => {
        return <span className='text-muted-foreground'>{row.original.created_by?.name}</span>;
      },
      meta: { style: { width: '100px' } }
    }),
    columnHelper.accessor('tipe.name', {
      header: 'Tipe',
      cell: ({ row, getValue }) => {
        const tipe = row.original.tipe;
        return <span className='font-medium'>{getValue() || tipe?.name || '-'}</span>;
      },
      meta: { style: { width: '80px' } }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        const getStatusStyle = () => {
          switch (status) {
            case 'Approved':
              return 'bg-green-500 text-white hover:bg-green-600';
            case 'Pending':
              return 'bg-orange-500 text-white hover:bg-orange-600';
            case 'Negotiation':
              return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'Rejected':
              return 'bg-red-500 text-white hover:bg-red-600';
            default:
              return 'bg-gray-500 text-white hover:bg-gray-600';
          }
        };

        const getStatusIcon = () => {
          switch (status) {
            case 'Approved':
              return <CheckCircle className='h-3 w-3' />;
            case 'Pending':
              return <Clock className='h-3 w-3' />;
            case 'Negotiation':
              return <MessageSquare className='h-3 w-3' />;
            case 'Rejected':
              return <X className='h-3 w-3' />;
            default:
              return null;
          }
        };

        return (
          <Badge className={`text ${getStatusStyle()} flex items-center gap-1 rounded-full px-3 py-2`}>
            {getStatusIcon()}
            {status}
          </Badge>
        );
      },
      meta: { style: { width: '120px' } }
    }),
    ...(!isTelemarketing
      ? [
          columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => <ActionCell row={row} />,
            meta: { style: { width: '80px' } }
          })
        ]
      : [])
  ];

  return (
    <section className='p-4'>
      <PageTitle title='Penjualan' />

      {/* Metrics Section */}
      <MetricsSection />

      <PaginateTable
        columns={columns}
        url='/list-transaksi'
        id='transaksi'
        perPage={10}
        queryKey={['/list-transaksi', selectedMemberId?.toString() || 'all']}
        payload={{
          include: 'konsumen,properti,blok,tipe,unit,projeks',
          ...(selectedMemberId && { created_id: selectedMemberId })
        }}
        Plugin={() => (
          <div className='flex flex-wrap items-center justify-end gap-2'>
            {canSeeFilterButton() && (
              <div className='flex items-center gap-2'>
                {selectedMemberId && (
                  <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-3 py-1'>
                    <span className='text-sm font-medium'>Filter: {selectedMemberName}</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClearFilter}
                      className='hover:bg-primary/20 h-6 w-6 p-0'>
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                )}
                <Button variant='outline' onClick={() => setShowMemberFilter(true)} className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  Filter Berdasarkan Member
                </Button>
              </div>
            )}
            {!isTelemarketing && (
              <Button onClick={() => setShowAddTransaksi(true)} disabled={isFormLoading} className='text-white'>
                <Plus />
                Tambah Transaksi
              </Button>
            )}
          </div>
        )}
      />

      {/* Property Type Selection Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Tambah Data Transaksi</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambahkan data transaksi baru ke dalam sistem.
            </DialogDescription>
          </DialogHeader>

          <PropertyTypeModal
            onClose={handleCloseForm}
            selectedId={null}
            onSubmit={handleFormSubmit}
            onProceedToBooking={handleProceedToBooking}
          />
        </DialogContent>
      </Dialog>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Tambah Data Transaksi</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambahkan data transaksi baru ke dalam sistem.
            </DialogDescription>
          </DialogHeader>

          {formData && (
            <BookingForm initialData={formData} onBack={handleBackToTypeSelection} onSubmit={handleFormSubmit} />
          )}
        </DialogContent>
      </Dialog>

      {/* Member Filter Modal */}
      <MemberFilterModal
        open={showMemberFilter}
        onOpenChange={setShowMemberFilter}
        onSelectMember={handleSelectMember}
      />

      <AddTransaksiModal open={showAddTransaksi} onOpenChange={setShowAddTransaksi} />

      {/* Property Type Selection Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='h-[90vh] max-h-[90vh] overflow-y-auto w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Edit Data Transaksi</DialogTitle>
            <DialogDescription>Edit data transaksi yang sudah ada di form berikut.</DialogDescription>
          </DialogHeader>

          <PropertyTypeModal
            onClose={handleCloseForm}
            selectedId={selectedId}
            onSubmit={handleFormSubmit}
            onProceedToBooking={handleProceedToBooking}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
});

export default PenjualanPage;
