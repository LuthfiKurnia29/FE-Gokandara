'use client';

import { memo, useState } from 'react';

import BookingForm from '@/blocks/transaksi/booking-form';
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
import { usePermissions } from '@/services/auth';
import {
  useCreatePenjualan,
  useDeletePenjualan,
  useUpdatePenjualan,
  useUpdatePenjualanStatus
} from '@/services/penjualan';
import { CreatePenjualanData, PenjualanWithRelations, UpdatePenjualanData } from '@/types/penjualan';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import MetricsSection from './metric-section';
import { CheckCircle, Clock, Filter, MessageSquare, MoreHorizontal, Pencil, Plus, Trash, X } from 'lucide-react';
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

const columns = [
  columnHelper.accessor('id', {
    header: 'Order ID',
    cell: ({ getValue }) => <span className='font-mono text-sm font-medium'>#{getValue()}</span>,
    meta: { style: { width: '100px' } }
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
    id: 'properti',
    header: 'Properti',
    cell: ({ row }) => {
      const properti = row.original.properti;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{properti?.lokasi || '-'}</span>
          {properti?.luas_bangunan && properti?.luas_tanah && (
            <span className='text-muted-foreground text-xs'>
              {properti.luas_bangunan}/{properti.luas_tanah}
            </span>
          )}
        </div>
      );
    },
    meta: { style: { minWidth: '180px' } }
  }),
  columnHelper.display({
    id: 'lokasi',
    header: 'Lokasi',
    cell: ({ row }) => {
      const properti = row.original.properti;
      return <span className='text-sm'>{properti?.lokasi || '-'}</span>;
    },
    meta: { style: { minWidth: '200px' } }
  }),
  columnHelper.display({
    id: 'harga_sebelum_diskon',
    header: 'Harga (Sebelum Diskon)',
    cell: ({ row }) => {
      const properti = row.original.properti;
      const diskon = row.original.diskon;
      const tipeDiskon = row.original.tipe_diskon;
      const grandTotal = row.original.grand_total;

      // Calculate base price from grand_total and discount
      let basePrice = grandTotal;
      if (diskon && diskon > 0) {
        if (tipeDiskon === 'percent') {
          const discountPercent = Math.min(diskon, 100);
          basePrice = grandTotal / (1 - discountPercent / 100);
        } else if (tipeDiskon === 'fixed') {
          basePrice = grandTotal + diskon;
        }
      }

      return (
        <div className='flex flex-col'>
          <span className='font-medium text-green-600'>{formatRupiah(basePrice)}</span>
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
  columnHelper.accessor('unit.name', {
    header: 'Unit',
    cell: ({ row, getValue }) => {
      const unit = row.original.unit;
      return <span className='font-medium'>{getValue() || unit?.name || '-'}</span>;
    },
    meta: { style: { width: '80px' } }
  }),
  columnHelper.display({
    id: 'sales',
    header: 'Sales',
    cell: ({ row }) => {
      return <span className='text-muted-foreground'>-</span>;
    },
    meta: { style: { width: '100px' } }
  }),
  columnHelper.accessor('blok.name', {
    header: 'Blok',
    cell: ({ row, getValue }) => {
      const blok = row.original.blok;
      return <span className='font-medium'>{getValue() || blok?.name || '-'}</span>;
    },
    meta: { style: { width: '80px' } }
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
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionCell row={row} />,
    meta: { style: { width: '80px' } }
  })
];

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
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRoleId === 1 ||
      userRoleId === 2
    );
  };

  const canUpdateToNegotiation = (currentStatus: string) => {
    return canChangeStatus() && currentStatus === 'Pending';
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

  const handleEdit = (penjualan: PenjualanWithRelations) => {
    setSelectedId(penjualan.id);
    setOpenForm(true);
  };

  const handleDeletePenjualan = async (penjualan: PenjualanWithRelations) => {
    handleDelete(`/delete-transaksi/${penjualan.id}`, 'delete');
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
          <DropdownMenuItem onClick={() => handleEdit(row.original)} disabled={updatePenjualan.isPending}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
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

      {/* Property Type Selection Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
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

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className='w-full max-w-[95vw] border-0 p-6 lg:max-w-[1000px] xl:max-w-[1200px] [&>button]:rounded-full [&>button]:bg-gray-200 [&>button]:p-2 [&>button]:transition-colors [&>button]:hover:bg-gray-300'>
          <DialogHeader>
            <DialogTitle>Edit Data Transaksi</DialogTitle>
            <DialogDescription>Edit data transaksi yang sudah ada di form berikut.</DialogDescription>
          </DialogHeader>

          {formData && (
            <BookingForm
              initialData={formData}
              selectedId={selectedId}
              onBack={handleBackToTypeSelection}
              onSubmit={handleFormSubmit}
            />
          )}
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
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRoleId === 1 ||
      userRoleId === 2
    );
  };

  const canSeeFilterButton = () => {
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRoleId === 1 ||
      userRoleId === 2
    );
  };

  const canUpdateToNegotiation = (currentStatus: string) => {
    return canChangeStatus() && currentStatus === 'Pending';
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

  const handleCreate = () => {
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
        konsumen_id: data.konsumen_id!,
        properti_id: data.properti_id!,
        blok_id: data.blok_id!,
        tipe_id: data.tipe_id!,
        unit_id: data.unit_id!,
        diskon: data.diskon,
        tipe_diskon: data.tipe_diskon || 'percent',
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
          include: 'konsumen,properti,blok,tipe,unit',
          ...(selectedMemberId && { created_id: selectedMemberId })
        }}
        Plugin={() => (
          <div className='flex items-center gap-2'>
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
            <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
              <Plus />
              Tambah Transaksi
            </Button>
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
    </section>
  );
});

export default PenjualanPage;
