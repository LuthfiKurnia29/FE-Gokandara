'use client';

import { memo, useState } from 'react';

import { KonsumenForm } from '@/blocks/konsumen/form';
import { HistoryFollowUp } from '@/blocks/konsumen/history_follow_up';
import { MemberFilterModal } from '@/blocks/konsumen/member-filter-modal';
import { PageTitle } from '@/components/page-title';
import { PaginateCustom } from '@/components/paginate-custom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import { usePermissions } from '@/services/auth';
import { useCreateKonsumen, useDeleteKonsumen, useUpdateKonsumen } from '@/services/konsumen';
import { CreateKonsumenData, KonsumenData } from '@/types/konsumen';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import { Filter, History, Mail, MoreHorizontal, Pencil, PhoneCall, Plus, Trash, Video, X } from 'lucide-react';
import { WhatsappLogo } from 'phosphor-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<KonsumenData>();

const openWhatsApp = (phoneNumber: string) => {
  // Normalisasi nomor telepon
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const waNumber = cleanedNumber.startsWith('0')
    ? `62${cleanedNumber.slice(1)}`
    : cleanedNumber.startsWith('62')
      ? cleanedNumber
      : `62${cleanedNumber}`;

  const whatsappUrl = `https://wa.me/${waNumber}`;
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
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
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
      toast.error(error.response?.data?.message || 'Terjadi sesuatu Error!');
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
      const colorMap: { [key: string]: string } = {
        blue: '#3B82F6',
        green: '#10B981',
        red: '#EF4444',
        yellow: '#F59E0B',
        purple: '#8B5CF6',
        orange: '#F97316',
        gray: '#6B7280'
      };
      return colorMap[item.prospek?.color || 'gray'] || '#6B7280';
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
                  <h3 className='text-lg font-semibold'>{item.name}</h3>
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
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='my-2 -ml-2 flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => openWhatsApp(item.phone)}
                  className='p-2 text-green-600 hover:bg-green-50'
                  title='Hubungi via WhatsApp'>
                  <WhatsappLogo className='!h-6 !w-6' weight='fill' />
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-2 space-y-1'>
            <p className='text-sm'>
              <span className='font-medium'>Phone:</span> {item.phone}
            </p>
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
        queryKey={['/konsumen', selectedMemberId?.toString() || 'all']}
        payload={{
          ...(selectedMemberId && { created_id: selectedMemberId })
        }}
        containerClassName='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        renderItem={renderItem}
        Plugin={() => (
          <div className='flex items-center gap-2'>
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
                <Button variant='outline' onClick={() => setShowMemberFilter(true)} className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  Filter Berdasarkan Member
                </Button>
              </div>
            )}
            <Button onClick={handleCreate} disabled={isFormLoading} className='text-white'>
              <Plus />
              Tambah Konsumen
            </Button>
          </div>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent
          className='max-h-[700px] w-full max-w-[95vw] border-0 p-0 lg:max-w-[1000px] xl:max-w-[1200px]'
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

      {/* Member Filter Modal */}
      <MemberFilterModal
        open={showMemberFilter}
        onOpenChange={setShowMemberFilter}
        onSelectMember={handleSelectMember}
      />

      {/* Image Modal for Mitra Role */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className='max-w-2xl border-0 p-0'>
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
