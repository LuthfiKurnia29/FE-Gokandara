'use client';

import { memo, useState } from 'react';

import { FilterModal, FilterValues } from '@/blocks/konsumen/filter-modal';
import { KonsumenForm } from '@/blocks/konsumen/form';
import { HistoryFollowUp } from '@/blocks/konsumen/history_follow_up';
import { MemberFilterModal } from '@/blocks/konsumen/member-filter-modal';
import { PageTitle } from '@/components/page-title';
import { PaginateCustom } from '@/components/paginate-custom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitive-select';
import { useDelete } from '@/hooks/use-delete';
import { usePermissions } from '@/services/auth';
import { useCreateKonsumen, useDeleteKonsumen, useUpdateKonsumen } from '@/services/konsumen';
import { getAllProspek } from '@/services/prospek';
import { CreateKonsumenData, KonsumenData } from '@/types/konsumen';
import { ProspekData } from '@/types/prospek';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { CheckCircle, Clock, Filter, History, Mail, MessageSquare, MoreHorizontal, Pencil, PhoneCall, Plus, Trash, Video, X } from 'lucide-react';
import moment from 'moment';
import { WhatsappLogo } from 'phosphor-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<KonsumenData>();

const openWhatsApp = (konsumen: KonsumenData) => {
  const parseDate = (value?: string) => {
    if (!value) return undefined;
    const isoLike = value.includes('T') ? value : value.replace(' ', 'T');
    const d = new Date(isoLike);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const now = new Date();
  const fu1 = parseDate(konsumen.tgl_fu_1 as unknown as string);
  const fu2 = parseDate(konsumen.tgl_fu_2 as unknown as string);

  let message = '';
  if (fu1 && now < fu1) {
    message = konsumen.materi_fu_1 || '';
  } else if (fu2 && now < fu2) {
    message = konsumen.materi_fu_2 || konsumen.materi_fu_1 || '';
  } else {
    message = konsumen.materi_fu_2 || konsumen.materi_fu_1 || '';
  }

  const phoneNumber = konsumen.phone || '';
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const waNumber = cleanedNumber.startsWith('0')
    ? `62${cleanedNumber.slice(1)}`
    : cleanedNumber.startsWith('62')
      ? cleanedNumber
      : `62${cleanedNumber}`;

  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

const KonsumenPage = memo(function KonsumenPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openHistory, setOpenHistory] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedKonsumen, setSelectedKonsumen] = useState<KonsumenData | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [showMemberFilter, setShowMemberFilter] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedImageName, setSelectedImageName] = useState<string>('');

  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(moment().startOf('year').format('YYYY-MM-DD')),
    to: new Date(moment().endOf('year').format('YYYY-MM-DD'))
  });
  const [selectedProspekId, setSelectedProspekId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { getUserData } = usePermissions();
  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/konsumen'] });
    }
  });

  // Get current user data for role checking
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;

  // Check if current user is Mitra
  const isMitra = userRole.toLowerCase() === 'mitra' || userRoleId === 4; // Assuming Mitra role_id is 4

  // Check if current user is Mitra
  const isTelem = userRole.toLowerCase() === 'telemarketing' || userRoleId === 5; // Assuming Mitra role_id is 4

  // Check if user can see filter button (Admin and Supervisor only)
  const canSeeFilterButton = () => {
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRoleId === 1 ||
      userRoleId === 2
    );
  };

  // API hooks
  const createKonsumen = useCreateKonsumen();
  const updateKonsumen = useUpdateKonsumen();
  const deleteKonsumen = useDeleteKonsumen();

  // Fetch prospek data for filter
  const { data: prospekData = [] } = useQuery<ProspekData[]>({
    queryKey: ['/prospek'],
    queryFn: () => getAllProspek()
  });

  const handleCreate = () => {
    setMode('create');
    setSelectedId(null);
    setOpenForm(true);
  };

  const handleEdit = (konsumen: KonsumenData) => {
    setMode('edit');
    setSelectedId(konsumen.id);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
    setMode('create');
  };

  const handleOpenHistory = (konsumen: KonsumenData) => {
    setSelectedKonsumen(konsumen);
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedKonsumen(null);
  };

  const handleShowImage = (imageUrl: string, konsumenName: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageName(konsumenName);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
    setSelectedImageName('');
  };

  const handleFormSubmit = async (data: CreateKonsumenData) => {
    try {
      if (mode === 'create') {
        await createKonsumen.mutateAsync(data);
      } else if (selectedId) {
        await updateKonsumen.mutateAsync({ id: selectedId, data });
      }
      handleCloseForm();
    } catch (error: any) {
      const status = error?.response?.status;
      const errors = error?.response?.data?.errors || {};
      const msgFromField = Array.isArray(errors.tgl_fu_2) ? errors.tgl_fu_2[0] : undefined;
      const fallbackMsg = error?.response?.data?.message;
      const message = msgFromField || fallbackMsg ? msgFromField || fallbackMsg : 'Terjadi sesuatu Error!';
      toast.error(message || 'Tanggal follow up 2 minimal 7 hari setelah Tanggal & waktu follow up 1');
    }
  };

  const handleDeleteKonsumen = async (konsumen: KonsumenData) => {
    handleDelete(`/konsumen/${konsumen.id}`, 'delete');
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

  // Handle apply filters from modal
  const handleApplyFilters = (filters: FilterValues) => {
    if (filters.dateRange) {
      setDateRange({
        from: filters.dateRange.from || new Date(moment().startOf('year').format('YYYY-MM-DD')),
        to: filters.dateRange.to || new Date(moment().endOf('year').format('YYYY-MM-DD'))
      });
    }
    setSelectedProspekId(filters.selectedProspekId);
    setSelectedStatus(filters.selectedStatus);
    setSelectedMemberId(filters.selectedMemberId);
    setSelectedMemberName(filters.selectedMemberName);
  };

  // Get current filter values for the modal
  const getCurrentFilters = (): FilterValues => ({
    dateRange: {
      from: dateRange.from,
      to: dateRange.to
    },
    selectedProspekId,
    selectedStatus,
    selectedMemberId,
    selectedMemberName
  });

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setDateRange({
      from: new Date(moment().startOf('year').format('YYYY-MM-DD')),
      to: new Date(moment().endOf('year').format('YYYY-MM-DD'))
    });
    setSelectedProspekId('');
    setSelectedStatus('');
    handleClearFilter();
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedProspekId ||
    selectedStatus ||
    selectedMemberId ||
    (dateRange.from && dateRange.from.getTime() !== new Date(moment().startOf('year').format('YYYY-MM-DD')).getTime()) ||
    (dateRange.to && dateRange.to.getTime() !== new Date(moment().endOf('year').format('YYYY-MM-DD')).getTime());

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderItem = (item: KonsumenData, index: number) => {
    // Determine profile picture source based on role and available data
    const getProfilePicture = () => {
      if (isMitra && item.gambar_url) {
        // For Mitra role, show uploaded image if available
        return item.gambar_url;
      }
      // For other roles or when no image available, show default avatar
      return 'https://github.com/shadcn.png';
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    // Check if avatar should be clickable (Mitra role with image)
    const isAvatarClickable = isMitra && item.gambar_url;

    // Get prospek color
    const getProspekColor = () => {
      return item.prospek?.color || '#6B7280';
    };

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'Approved':
          return 'bg-green-500 text-white hover:bg-green-600';
        case 'Pending':
          return 'bg-orange-500 text-white hover:bg-orange-600';
        case 'Negotiation':
          return 'bg-blue-500 text-white hover:bg-blue-600';
        case 'Rejected':
          return 'bg-red-500 text-white hover:bg-red-600';
        case 'ITJ':
          return 'bg-emerald-600 text-white hover:bg-emerald-700';
        case 'Akad':
          return 'bg-teal-600 text-white hover:bg-teal-700';
        case 'Refund':
          return 'bg-yellow-600 text-white hover:bg-yellow-700';
        default:
          return 'bg-gray-500 text-white hover:bg-gray-600';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'Approved':
          return <CheckCircle className='h-3 w-3' />;
        case 'Pending':
          return <Clock className='h-3 w-3' />;
        case 'Negotiation':
          return <MessageSquare className='h-3 w-3' />;
        case 'Rejected':
          return <X className='h-3 w-3' />;
        case 'ITJ':
          return <CheckCircle className='h-3 w-3' />;
        case 'Akad':
          return <CheckCircle className='h-3 w-3' />;
        case 'Refund':
          return <History className='h-3 w-3' />;
        default:
          return null;
      }
    };

    return (
      <div className='flex h-full justify-between rounded-lg border bg-white p-4 shadow-sm'>
        <div className='flex-1'>
          <div className='flex gap-4'>
            <Avatar
              className={`h-16 w-16 ${isAvatarClickable ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
              onClick={isAvatarClickable ? () => handleShowImage(item.gambar_url!, item.name) : undefined}>
              <AvatarImage src={getProfilePicture()} alt={`Profile ${item.name}`} />
              <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex justify-between'>
                <div>
                  {item.prospek && (
                    <div className='mb-1 flex items-center gap-1'>
                      <div
                        className='h-3 w-3 rounded-full border border-gray-300'
                        style={{ backgroundColor: getProspekColor() }}
                        title={`Prospek: ${item.prospek.name}`}
                      />
                      <span className='text-xs text-gray-500 capitalize'>{item.prospek.name}</span>
                    </div>
                  )}
                  {item.latest_transaksi && (
                    <div className='mb-1'>
                      <Badge className={`${getStatusStyle(item.latest_transaksi.status)} flex items-center gap-1 rounded-full px-3 py-1 text-xs`}>
                        {getStatusIcon(item.latest_transaksi.status)}
                        {item.latest_transaksi.status}
                      </Badge>
                    </div>
                  )}
                  <h3 className='text-lg font-semibold'>{item.name}</h3>
                  {(item as any).status_delete === 1 ||
                  (item as any).status_delete === '1' ||
                  (item as any).status_delete === 'pending' ? (
                    <div className='mt-1'>
                      <Badge className='border border-amber-200 bg-amber-100 text-amber-800'>
                        Menunggu persetujuan hapus
                      </Badge>
                    </div>
                  ) : null}
                  {item.description && <p className='text-sm text-gray-600'>{item.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' disabled={updateKonsumen.isPending || deleteKonsumen.isPending}>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => handleEdit(item)} disabled={updateKonsumen.isPending}>
                      <Pencil className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenHistory(item)}>
                      <History className='mr-2 h-4 w-4' />
                      History Follow Up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteKonsumen(item)}
                      disabled={deleteKonsumen.isPending}
                      variant='destructive'>
                      <Trash className='mr-2 h-4 w-4' />
                      {userRole.toLowerCase() === 'sales' || userRoleId === 3 ? 'Ajukan Hapus' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='my-2 flex items-center gap-2'>
                <Button
                  size='sm'
                  onClick={() => openWhatsApp(item)}
                  aria-label='Chat di WhatsApp'
                  className='flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-green-700'>
                  <WhatsappLogo className='!h-5 !w-5' weight='fill' />
                  <span>Chat di WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-2 space-y-1'>
            {isTelem && (
              <p className='text-sm'>
                <span className='font-medium'>Assigned To:</span>{' '}
                <span className='line-clamp-2'>{item.created_by?.name}</span>
              </p>
            )}
            <p className='text-sm'>
              <span className='font-medium'>Phone:</span> {item.phone}
            </p>
            {item.created_at && (
              <p className='text-sm'>
                <span className='font-medium'>Dibuat:</span>{' '}
                {(function () {
                  const val = item.created_at as unknown as string;
                  const tryIso = val?.includes('T') ? val : (val || '').replace(' ', 'T');
                  const d = new Date(tryIso);
                  return isNaN(d.getTime())
                    ? val
                    : d.toLocaleString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                })()}
              </p>
            )}
            {(item as any).assign_name && (
              <p className='text-sm'>
                <span className='font-medium'>Assign:</span> {(item as any).assign_name}
              </p>
            )}
            {item.address && (
              <p className='text-sm'>
                <span className='font-medium'>Alamat:</span> <span className='line-clamp-2'>{item.address}</span>
              </p>
            )}
            {item.tgl_fu_1 && (
              <p className='text-sm'>
                <span className='font-medium'>Tanggal Follow Up:</span>{' '}
                {new Date(item.tgl_fu_1).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isFormLoading = createKonsumen.isPending || updateKonsumen.isPending;

  return (
    <section className='p-4'>
      <PageTitle title='Data Konsumen' />

      <PaginateCustom
        url='/konsumen'
        id='konsumen'
        perPage={12}
        queryKey={[
          '/konsumen',
          selectedMemberId?.toString() || 'all',
          formatDateForAPI(dateRange.from) || 'no-start',
          formatDateForAPI(dateRange.to) || 'no-end',
          selectedProspekId || 'all-prospek',
          selectedStatus || 'all-status'
        ]}
        payload={{
          ...(selectedMemberId && { created_id: selectedMemberId }),
          ...(dateRange.from && { dateStart: formatDateForAPI(dateRange.from) }),
          ...(dateRange.to && { dateEnd: formatDateForAPI(dateRange.to) }),
          ...(selectedProspekId && { prospek_id: selectedProspekId }),
          ...(selectedStatus && { status: selectedStatus })
        }}
        containerClassName='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'
        renderItem={renderItem}
        Plugin={() => (
          <div className='flex w-full flex-col gap-3'>
            {/* Action Buttons Section */}
            <div className='flex flex-wrap items-center gap-2'>
              {/* Filter Section */}
              <div className='flex flex-wrap items-center gap-2'>
                {/* Open Filter Modal Button */}
                <Button variant='outline' onClick={() => setShowFilterModal(true)} className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  Filter Data
                  {hasActiveFilters && (
                    <span className='bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs'>
                      Aktif
                    </span>
                  )}
                </Button>

                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                  <Button variant='ghost' size='sm' onClick={handleClearAllFilters} className='flex items-center gap-2'>
                    <X className='h-4 w-4' />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Member Filter Button - Only show for Admin and Supervisor */}
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
                  {!selectedMemberId && (
                    <Button
                      variant='outline'
                      onClick={() => setShowMemberFilter(true)}
                      className='flex items-center gap-2'>
                      <Filter className='h-4 w-4' />
                      Filter Berdasarkan Member
                    </Button>
                  )}
                </div>
              )}
              <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
                <Plus />
                Tambah Konsumen
              </Button>
            </div>
          </div>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent
          className='max-h-[700px] w-full max-w-[95vw] border-0 p-0 lg:top-[40%] lg:max-w-[1000px] xl:max-w-[1200px]'
          style={{
            height: 'min(700px, 85vh)',
            maxHeight: 'min(700px, 85vh)',
            minHeight: '500px'
          }}>
          {/* Add DialogTitle for accessibility (visually hidden) */}
          <DialogTitle className='sr-only'>
            {mode === 'edit' ? 'Edit Data Konsumen' : 'Tambah Data Konsumen'}
          </DialogTitle>

          {/* Add DialogDescription for accessibility (visually hidden) */}
          <DialogDescription className='sr-only'>
            {mode === 'edit'
              ? 'Form untuk mengedit data konsumen yang sudah ada'
              : 'Form untuk menambahkan data konsumen baru ke dalam sistem'}
          </DialogDescription>

          <KonsumenForm
            selectedId={mode === 'edit' ? selectedId : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>

      {/* History Follow Up Dialog */}
      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent
          className='max-h-[700px] w-full max-w-[95vw] overflow-hidden border-0 p-0 lg:max-w-[1000px] xl:max-w-[1200px]'
          style={{
            height: 'min(700px, 85vh)',
            maxHeight: 'min(700px, 85vh)',
            minHeight: '500px'
          }}>
          <DialogTitle className='sr-only'>History Follow Up</DialogTitle>
          <DialogDescription className='sr-only'>Modal untuk menampilkan riwayat follow up konsumen</DialogDescription>

          <HistoryFollowUp konsumen={selectedKonsumen} onClose={handleCloseHistory} />
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <FilterModal
        open={showFilterModal}
        onOpenChange={setShowFilterModal}
        onApplyFilters={handleApplyFilters}
        initialFilters={getCurrentFilters()}
        prospekData={prospekData}
      />

      {/* Member Filter Modal */}
      <MemberFilterModal
        open={showMemberFilter}
        onOpenChange={setShowMemberFilter}
        onSelectMember={handleSelectMember}
      />

      {/* Image Modal for Mitra Role */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className='h-[90vh] max-h-[90vh] max-w-2xl overflow-y-auto border-0 p-0'>
          <DialogTitle className='sr-only'>Gambar Konsumen</DialogTitle>
          <DialogDescription className='sr-only'>
            Modal untuk menampilkan gambar konsumen dalam ukuran penuh
          </DialogDescription>

          <div className='relative'>
            {/* Close button */}
            <Button
              variant='outline'
              size='icon'
              className='absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white'
              onClick={handleCloseImageModal}>
              <X className='h-4 w-4' />
            </Button>

            {/* Image container */}
            <div className='relative aspect-square w-full overflow-hidden rounded-lg'>
              <img
                src={selectedImage}
                alt={`Gambar ${selectedImageName}`}
                className='h-full w-full object-cover'
                onError={(e) => {
                  // Fallback jika gambar gagal dimuat
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://github.com/shadcn.png';
                }}
              />
            </div>

            {/* Image info */}
            <div className='bg-white p-4'>
              <h3 className='text-lg font-semibold text-gray-900'>{selectedImageName}</h3>
              <p className='text-sm text-gray-600'>Gambar konsumen yang diupload oleh Mitra</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </section>
  );
});

export { HistoryFollowUp } from './history_follow_up';
export default KonsumenPage;
