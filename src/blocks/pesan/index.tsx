'use client';

import { memo, useCallback, useRef, useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateCustom, PaginateCustomRef } from '@/components/paginate-custom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCreatePesan } from '@/services/pesan';
import { CreatePesanData, PesanData } from '@/types/pesan';
import { useQueryClient } from '@tanstack/react-query';

import { PesanForm } from './form';
// import ChatPanel from './chat-panel';
import { ArrowRight, ExternalLink, Info, MessageCircle, Plus, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const ConversationItem = memo(
  ({
    conversation,
    onChatClick,
    isSelected = false,
    isOpen = false
  }: {
    conversation: PesanData;
    onChatClick: (conversation: PesanData) => void;
    isSelected?: boolean;
    isOpen: boolean;
  }) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleOpenFile = () => {
      window.open(conversation.file_url, '_blank', 'noopener,noreferrer');
    };

    const formattedId = String(conversation.id).padStart(6, '0');
    const createdAtDate = new Date(conversation.created_at);
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(createdAtDate);

    const senderRole = conversation.pengirim.roles[0]?.role.name || 'User';
    const firstRecipient = conversation.penerima[0];
    const firstRecipientRole = firstRecipient?.roles[0]?.role.name || 'User';
    const additionalRecipients = conversation.penerima.slice(1);
    const additionalRecipientsCount = additionalRecipients.length;

    return (
      <TooltipProvider>
        <Card className='mb-4 flex w-full flex-col items-start justify-between gap-4 rounded-xl border-0 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg md:flex-row md:items-center'>
          <div className='flex flex-grow items-center gap-4'>
            <Avatar className='h-12 w-12 border-2 border-blue-400 shadow-md'>
              <AvatarImage src='/placeholder.svg?height=48&width=48' alt={conversation.pengirim.name} />
              <AvatarFallback className='bg-blue-500 text-lg font-semibold text-white'>
                {conversation.pengirim.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className='grid gap-1'>
              <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                <span className='text-base font-bold text-blue-700'>#{formattedId}</span>
                <span className='text-lg font-semibold text-gray-800'>{conversation.pengirim.name}</span>
                <Badge
                  variant='secondary'
                  className='rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800'>
                  {senderRole}
                </Badge>
                <ArrowRight className='mx-1 h-4 w-4 text-gray-500' />
                {firstRecipient && (
                  <>
                    <span className='text-lg font-semibold text-gray-800'>{firstRecipient.name}</span>
                    <Badge
                      variant='secondary'
                      className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'>
                      {firstRecipientRole}
                    </Badge>
                  </>
                )}
                {additionalRecipientsCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='ml-1 flex cursor-pointer items-center text-sm text-gray-600 hover:underline'>
                        <Info className='mr-1 h-3 w-3' /> {/* Info icon added here */}
                        {'and '}
                        {additionalRecipientsCount}
                        {' other'}
                        {additionalRecipientsCount > 1 ? 's' : ''}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs rounded-md bg-gray-800 p-2 text-white shadow-lg'>
                      <p className='mb-1 font-semibold'>Recipients:</p>
                      <ul className='list-inside list-disc'>
                        {additionalRecipients.map((recipient) => (
                          <li key={recipient.id} className='text-sm'>
                            {recipient.name} ({recipient.roles[0]?.role.name || 'User'})
                          </li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <span className='text-sm text-gray-500'>{formattedDate}</span>
              <p className='mt-1 line-clamp-2 text-base text-gray-700'>{conversation.pesan}</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm' className='flex cursor-pointer items-center gap-1'>
                <MessageCircle className='h-4 w-4' />
                Open
              </Button>
            </DialogTrigger>
            <DialogContent className='w-lg max-w-[calc(100vw-2rem)] md:w-2xl'>
              <DialogHeader>
                <DialogTitle>{conversation.pengirim.name}</DialogTitle>
                <DialogDescription>{formatDate(conversation.created_at)}</DialogDescription>
              </DialogHeader>

              <article className='mb-2'>{conversation.pesan}</article>

              {Boolean(conversation.file_url) && (
                <Button onClick={handleOpenFile} className='bg-gray-800 text-white hover:bg-gray-700'>
                  Lihat File
                  <ExternalLink className='ml-2 h-4 w-4' />
                </Button>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Tutup</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </TooltipProvider>
    );
  }
);

ConversationItem.displayName = 'ConversationItem';

const PesanBlocks = memo(() => {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<PesanData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number>(0);

  const handleChatClick = (conversation: PesanData) => {
    setSelectedConversation(conversation);
    setCurrentUserId(conversation.id);
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  const paginateRef = useRef<PaginateCustomRef>(null);
  const refetchPaginate = useCallback(() => {
    paginateRef.current?.refetch();
  }, []);

  const [openForm, setOpenForm] = useState<boolean>(false);

  // API hooks
  const createPesan = useCreatePesan();

  const handleCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFormSubmit = async (data: CreatePesanData) => {
    try {
      await createPesan.mutateAsync(data);
      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi sesuatu Error!');
      console.error('Error saving chatting:', error);
    }
  };

  const isFormLoading = createPesan.isPending;

  return (
    <div className='h-full space-y-6'>
      <PageTitle title='Pesan' />

      <div className='grid h-[calc(100vh-120px)] grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Conversation List */}
        <div className={`pb-20 ${isChatOpen ? 'lg:block' : 'col-span-full'}`}>
          <PaginateCustom
            ref={paginateRef}
            url='/chatting'
            id='conversations-list'
            perPage={10}
            queryKey={['conversations']}
            emptyMessage='No conversations found'
            renderItem={(conversation: PesanData) => (
              <ConversationItem
                key={conversation.id}
                isOpen={isChatOpen}
                conversation={conversation}
                onChatClick={handleChatClick}
                isSelected={selectedConversation?.id === conversation.id}
              />
            )}
            Plugin={() => (
              <div className='flex flex-col items-end'>
                <Button onClick={handleCreate} disabled={isFormLoading} className='mb-4 text-white'>
                  <Plus />
                  Kirim Pesan
                </Button>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm'>
                      All
                    </Button>
                    <Button variant='ghost' size='sm'>
                      Published
                    </Button>
                    <Button variant='ghost' size='sm'>
                      Archived
                    </Button>
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* Chat Panel */}
        {/* {isChatOpen && (
          <div className='hidden lg:block'>
            <ChatPanel
              conversation={selectedConversation}
              isOpen={isChatOpen}
              onClose={handleChatClose}
              currentUserId={currentUserId}
              refetchPaginate={refetchPaginate}
            />
          </div>
        )} */}
      </div>

      {/* Mobile Chat Panel - Full Screen */}
      {/* {isChatOpen && (
        <div className='fixed inset-0 z-50 bg-white lg:hidden'>
          <ChatPanel
            conversation={selectedConversation}
            isOpen={isChatOpen}
            onClose={handleChatClose}
            currentUserId={currentUserId}
            refetchPaginate={refetchPaginate}
          />
        </div>
      )} */}

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-3xl max-w-[calc(100vw-2rem)] sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Kirim Pesan</DialogTitle>
            <DialogDescription>Isi form berikut untuk mengirim pesan.</DialogDescription>
          </DialogHeader>

          <PesanForm
            selectedId={null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});

PesanBlocks.displayName = 'PesanBlocks';

export default PesanBlocks;
