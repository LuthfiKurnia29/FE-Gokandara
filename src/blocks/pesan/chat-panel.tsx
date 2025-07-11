'use client';

import { memo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useConversationMessages, useCreatePesan } from '@/services/pesan';
import { ChatConversationData, PesanData } from '@/types/pesan';

import { Clock, Send, X } from 'lucide-react';

interface ChatPanelProps {
  conversation: ChatConversationData | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
}

const ChatPanel = memo(({ conversation, isOpen, onClose, currentUserId }: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const createPesan = useCreatePesan();

  // Get messages for this conversation
  const otherParticipantId =
    conversation?.participant_1_id === currentUserId ? conversation?.participant_2_id : conversation?.participant_1_id;

  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(
    otherParticipantId || null,
    currentUserId
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    const receiverId =
      conversation.participant_1_id === currentUserId ? conversation.participant_2_id : conversation.participant_1_id;

    try {
      await createPesan.mutateAsync({
        sender_id: currentUserId,
        receiver_id: receiverId,
        message: newMessage.trim(),
        message_type: 'text'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation || !isOpen) return null;

  const otherParticipant =
    conversation.participant_1_id === currentUserId ? conversation.participant_2 : conversation.participant_1;

  return (
    <Card className='sticky top-4 flex h-full max-h-screen flex-col lg:max-h-[calc(100vh-120px)]'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-semibold'>{otherParticipant.name}</span>
            <span className='text-muted-foreground text-sm'>{otherParticipant.position}</span>
          </div>
          <Badge variant={otherParticipant.status === 'online' ? 'default' : 'secondary'}>
            {otherParticipant.status}
          </Badge>
        </div>
        <Button variant='ghost' size='icon' onClick={onClose} className='h-8 w-8'>
          <X className='h-4 w-4' />
        </Button>
      </CardHeader>

      <Separator />

      <CardContent className='flex flex-1 flex-col p-0'>
        <div className='flex h-full flex-col'>
          {/* Messages Area */}
          <ScrollArea className='flex-1 p-4'>
            {messagesLoading ? (
              <div className='flex h-full items-center justify-center'>
                <div className='text-muted-foreground'>Loading messages...</div>
              </div>
            ) : (
              <div className='space-y-4'>
                {messagesData?.data?.map((message: PesanData) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender_id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                      <div className='text-sm'>{message.message}</div>
                      <div
                        className={`mt-1 flex items-center gap-1 text-xs ${
                          message.sender_id === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                        <Clock className='h-3 w-3' />
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Message Input */}
          <div className='p-4'>
            <div className='flex gap-2'>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Type a message...'
                className='flex-1'
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || createPesan.isPending} size='icon'>
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ChatPanel.displayName = 'ChatPanel';

export default ChatPanel;
