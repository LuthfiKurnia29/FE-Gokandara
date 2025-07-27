'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCreatePesan, usePesanList } from '@/services/pesan';
import { PesanData } from '@/types/pesan';

import { Clock, Send, X } from 'lucide-react';

interface ChatPanelProps {
  conversation: {
    id: number;
    name: string;
    avatar?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  refetchPaginate: () => void;
}

const ChatPanel = memo(({ conversation, isOpen, onClose, currentUserId, refetchPaginate }: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const createPesan = useCreatePesan();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this conversation
  const {
    data: messagesResponse,
    isLoading,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage
  } = usePesanList({
    id_user: conversation?.id || 0
  });

  // Flatten and reverse messages
  const flattenedMessages = messagesResponse ? messagesResponse.pages.flatMap((page) => page.data).reverse() : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flattenedMessages.length && messagesEndRef.current) {
      if (messagesResponse?.pages.length === 1) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (scrollAreaRef.current) {
        // Scroll top 3-last message, so current position is not really on very top
        // So that, user can sroll
        scrollAreaRef.current
          .querySelectorAll('.space-y-4 .flex.justify-end')[3]
          .scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [flattenedMessages, messagesResponse]);

  // Handle scroll to load more messages
  const handleScroll = (event: any) => {
    if (!scrollAreaRef.current) return;

    const { scrollTop } = scrollAreaRef.current;

    // Check if scrolled to the top and there are more pages to load
    if (event.target.scrollTop === 0 && hasNextPage) {
      fetchNextPage();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    try {
      await createPesan.mutateAsync({
        user_penerima_id: currentUserId,
        pesan: newMessage.trim()
      });
      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        refetchPaginate();
      }, 600);
    } catch (error) {
      // Error handled by mutation's onError callback and user feedback
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation || !isOpen) return null;

  return (
    <Card className='sticky top-4 flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden lg:h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)]'>
      {/* Header - Fixed */}
      <CardHeader className='flex flex-shrink-0 flex-row items-center justify-between space-y-0 border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-semibold'>{conversation.name}</span>
          </div>
        </div>
        <Button variant='ghost' size='icon' onClick={onClose} className='h-8 w-8'>
          <X className='h-4 w-4' />
        </Button>
      </CardHeader>

      {/* Messages Area - Scrollable */}
      <CardContent className='flex flex-1 flex-col overflow-hidden p-0'>
        <div className='flex h-full min-h-0 flex-col'>
          <ScrollArea
            ref={scrollAreaRef as React.RefObject<HTMLDivElement>}
            className='min-h-0 flex-1'
            onScrollCapture={handleScroll}>
            <div className='p-4'>
              {isLoading ? (
                <div className='flex h-full items-center justify-center py-8'>
                  <div className='text-muted-foreground'>Loading messages...</div>
                </div>
              ) : flattenedMessages.length > 0 ? (
                <div className='space-y-4'>
                  {flattenedMessages.map((message: PesanData) => (
                    <div
                      key={message.id}
                      className={`flex ${message.penerima.id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.penerima.id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                        <div className='text-sm leading-relaxed'>{message.pesan}</div>
                        <div
                          className={`mt-1 flex items-center gap-1 text-xs ${
                            message.penerima.id === currentUserId
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                          <Clock className='h-3 w-3' />
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className='flex h-full items-center justify-center py-8'>
                  <div className='text-muted-foreground'>No messages yet. Start the conversation!</div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input - Fixed at Bottom */}
          <div className='bg-background flex-shrink-0 border-t'>
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
        </div>
      </CardContent>
    </Card>
  );
});

ChatPanel.displayName = 'ChatPanel';

export default ChatPanel;
