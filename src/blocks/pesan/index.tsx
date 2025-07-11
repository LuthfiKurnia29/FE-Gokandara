'use client';

import { memo, useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateCustom } from '@/components/paginate-custom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChatConversationData } from '@/types/pesan';

import ChatPanel from './chat-panel';
import { MessageCircle, Star } from 'lucide-react';

const ConversationItem = memo(
  ({
    conversation,
    onChatClick,
    isSelected = false
  }: {
    conversation: ChatConversationData;
    onChatClick: (conversation: ChatConversationData) => void;
    isSelected?: boolean;
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

    // For display purposes, we'll show participant_2 as the main contact
    const mainParticipant = conversation.participant_2;

    return (
      <Card
        className={`mb-4 border-0 shadow transition-all hover:translate-y-[-2px] hover:shadow-lg ${isSelected ? 'ring-primary ring-2' : ''}`}>
        <CardContent className='p-4'>
          <div className='flex items-start gap-4'>
            {/* Avatar */}
            <Avatar className='h-12 w-12'>
              <AvatarImage src={mainParticipant.avatar} alt={mainParticipant.name} />
              <AvatarFallback>{mainParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className='flex flex-1 flex-wrap'>
              {/* Content */}
              <div className='min-w-0 lg:mr-10'>
                <div className='mb-1 flex flex-col'>
                  <div className='text-sm font-medium text-blue-600'>
                    <span className='hidden lg:inline'>#{String(mainParticipant.id).padStart(6, '0')}</span>
                  </div>
                  <div className='font-semibold text-gray-900'>{mainParticipant.name}</div>
                </div>

                <div className='mb-2 text-sm text-gray-600'>Join on {formatDate(conversation.created_at)}</div>
              </div>

              <div className='flex-1'>
                <div className='mb-3 line-clamp-2 text-sm text-gray-700'>{conversation.last_message}</div>

                {/* Tags */}
                <div className='mb-3 flex flex-wrap gap-1'>
                  <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                    {mainParticipant.position}
                  </Badge>
                  <Badge variant='secondary' className='bg-green-100 text-green-800'>
                    {mainParticipant.department}
                  </Badge>
                  <Badge variant={mainParticipant.status === 'online' ? 'default' : 'secondary'}>
                    {mainParticipant.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Side - Rating and Actions */}
            <div className='flex flex-col items-end gap-3'>
              {/* Rating */}
              <div className='flex items-center gap-1'>
                <span className='text-lg font-bold'>5.0</span>
                <div className='flex'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onChatClick(conversation)}
                  className='flex cursor-pointer items-center gap-1'>
                  <MessageCircle className='h-4 w-4' />
                  Chat
                </Button>
                {conversation.unread_count > 0 && (
                  <Badge variant='destructive' className='flex h-6 w-6 items-center justify-center rounded-full p-0'>
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ConversationItem.displayName = 'ConversationItem';

const PesanBlocks = memo(() => {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mock current user ID - in real app, this would come from auth context
  const currentUserId = 1;

  const handleChatClick = (conversation: ChatConversationData) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  return (
    <div className='h-full space-y-6'>
      <PageTitle title='Pesan' />

      <div className='grid h-[calc(100vh-120px)] grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Conversation List */}
        <div className={`pb-20 ${isChatOpen ? 'lg:block' : 'col-span-full'}`}>
          <PaginateCustom
            url='/pesan/conversations'
            id='conversations-list'
            perPage={10}
            queryKey={['conversations']}
            emptyMessage='No conversations found'
            renderItem={(conversation: ChatConversationData) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onChatClick={handleChatClick}
                isSelected={selectedConversation?.id === conversation.id}
              />
            )}
            Plugin={() => (
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
            )}
          />
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className='hidden lg:block'>
            <ChatPanel
              conversation={selectedConversation}
              isOpen={isChatOpen}
              onClose={handleChatClose}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>

      {/* Mobile Chat Panel - Full Screen */}
      {isChatOpen && (
        <div className='fixed inset-0 z-50 bg-white lg:hidden'>
          <ChatPanel
            conversation={selectedConversation}
            isOpen={isChatOpen}
            onClose={handleChatClose}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
});

PesanBlocks.displayName = 'PesanBlocks';

export default PesanBlocks;
