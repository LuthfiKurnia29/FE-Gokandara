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
import { KonsumenData } from '@/types/konsumen';
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

  const handleFormSubmit = async (data: Omit<KonsumenData, 'id' | 'no'>) => {
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
    return (
      <div className='flex h-full justify-between rounded-lg border bg-white p-4 shadow-sm'>
        <div className='flex-1'>
          <div className='flex gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex justify-between'>
                <div>
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

      <DeleteConfirmDialog />
    </section>
  );
});

export { HistoryFollowUp } from './history_follow_up';
export default KonsumenPage;
