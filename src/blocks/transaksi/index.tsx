'use client';

import { memo, useState } from 'react';

import BookingForm from '@/blocks/transaksi/booking-form';
import PropertyTypeModal from '@/blocks/transaksi/form';
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
import { CheckCircle, Clock, MessageSquare, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

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
      const hargaSebelumDiskon = properti?.harga || 0;

      return (
        <div className='flex flex-col'>
          <span className='font-medium text-green-600'>Rp {hargaSebelumDiskon.toLocaleString('id-ID')}</span>
          {diskon && <span className='text-muted-foreground text-xs'>Diskon: {diskon}%</span>}
        </div>
      );
    },
    meta: { style: { width: '150px' } }
  }),
  columnHelper.display({
    id: 'harga_sesudah_diskon',
    header: 'Harga (Sesudah Diskon)',
    cell: ({ row }) => {
      const properti = row.original.properti;
      const diskon = row.original.diskon;
      const hargaSebelumDiskon = properti?.harga || 0;
      const diskonAmount = (hargaSebelumDiskon * (diskon || 0)) / 100;
      const hargaSesudahDiskon = hargaSebelumDiskon - diskonAmount;

      return <span className='font-bold text-green-600'>Rp {hargaSesudahDiskon.toLocaleString('id-ID')}</span>;
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
      // TODO: Backend belum ada data sales, tampilkan placeholder
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

  // Get current user data for role checking
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;
  const userId = userData?.user?.id || 0;

  // Role-based status update permissions based on user seeder
  const canUpdateToNegotiation = (currentStatus: string) => {
    // Supervisor (ID: 2) can update from Pending to Negotiation
    return (userId === 2 || userRole === 'Supervisor' || userRoleId === 2) && currentStatus === 'Pending';
  };

  const canUpdateToApproved = (currentStatus: string) => {
    // Administrator (ID: 1) can update from Negotiation to Approved
    return (
      (userId === 1 || userRole === 'Administrator' || userRole === 'Admin' || userRoleId === 1) &&
      currentStatus === 'Negotiation'
    );
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
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateToApproved = async (penjualan: PenjualanWithRelations) => {
    try {
      await updatePenjualanStatus.mutateAsync({ id: penjualan.id, data: { status: 'Approved' } });
      toast.success('Status transaksi berhasil diubah menjadi Approved');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengubah status');
      console.error('Error updating status:', error);
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
      console.error('Error updating transaksi:', error);
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
            <BookingForm initialData={formData} onBack={handleBackToTypeSelection} onSubmit={handleFormSubmit} />
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
  const { getUserData } = usePermissions();

  // Get current user data for role checking
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;
  const userId = userData?.user?.id || 0;

  // Role-based status update permissions based on user seeder
  const canUpdateToNegotiation = (currentStatus: string) => {
    // Supervisor (ID: 2) can update from Pending to Negotiation
    return (userId === 2 || userRole === 'Supervisor' || userRoleId === 2) && currentStatus === 'Pending';
  };

  const canUpdateToApproved = (currentStatus: string) => {
    // Administrator (ID: 1) can update from Negotiation to Approved
    return (
      (userId === 1 || userRole === 'Administrator' || userRole === 'Admin' || userRoleId === 1) &&
      currentStatus === 'Negotiation'
    );
  };

  // API hooks
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
      await createPenjualan.mutateAsync(data as CreatePenjualanData);
      toast.success('Data transaksi berhasil ditambahkan');
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menambahkan data');
      console.error('Error creating transaksi:', error);
    }
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
        queryKey={['/list-transaksi']}
        payload={{ include: 'konsumen,properti,blok,tipe,unit' }}
        Plugin={() => (
          <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
            <Plus />
            Tambah Transaksi
          </Button>
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
    </section>
  );
});

export default PenjualanPage;
