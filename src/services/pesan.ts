import axios from '@/lib/axios';
import {
  ChatConversationData,
  ChatConversationResponse,
  CreatePesanData,
  PesanApiResponse,
  PesanData,
  PesanResponse,
  SalespersonData,
  UseChatConversationListParams,
  UsePesanListParams,
  UseSalespersonListParams
} from '@/types/pesan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Message Services
export const pesanService = {
  // Get paginated list of messages
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    sender_id,
    receiver_id,
    conversation_id
  }: UsePesanListParams = {}): Promise<PesanResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(sender_id && { sender_id: sender_id.toString() }),
      ...(receiver_id && { receiver_id: receiver_id.toString() }),
      ...(conversation_id && { conversation_id: conversation_id.toString() })
    });

    const response = await axios.get(`/pesan?${params}`);
    return response.data;
  },

  // Get conversation messages between two participants
  getConversationMessages: async (
    participantId: number,
    currentUserId: number,
    page = 1,
    perPage = 50
  ): Promise<PesanResponse> => {
    const params = new URLSearchParams({
      current_user_id: currentUserId.toString(),
      page: page.toString(),
      per_page: perPage.toString()
    });

    const response = await axios.get(`/pesan/conversations/${participantId}?${params}`);
    return response.data;
  },

  // Get message by ID
  getById: async (id: number): Promise<PesanData> => {
    const response = await axios.get<PesanApiResponse>(`/pesan/${id}`);
    return response.data.data;
  },

  // Create new message
  create: async (data: CreatePesanData & { sender_id: number }): Promise<PesanData> => {
    const response = await axios.post<PesanApiResponse>('/pesan', data);
    return response.data.data;
  },

  // Update message by ID
  update: async (id: number, data: { message?: string; is_read?: boolean }): Promise<PesanData> => {
    const response = await axios.put<PesanApiResponse>(`/pesan/${id}`, data);
    return response.data.data;
  },

  // Delete message by ID
  delete: async (id: number): Promise<PesanData> => {
    const response = await axios.delete<PesanApiResponse>(`/pesan/${id}`);
    return response.data.data;
  },

  // Mark message as read
  markAsRead: async (id: number): Promise<PesanData> => {
    const response = await axios.put<PesanApiResponse>(`/pesan/${id}`, { is_read: true });
    return response.data.data;
  }
};

// Conversation Services
export const conversationService = {
  // Get paginated list of conversations
  getList: async ({
    page = 1,
    perPage = 10,
    search = '',
    participant_id
  }: UseChatConversationListParams = {}): Promise<ChatConversationResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(participant_id && { participant_id: participant_id.toString() })
    });

    const response = await axios.get(`/pesan/conversations?${params}`);
    return response.data;
  },

  // Get conversation by ID
  getById: async (id: number): Promise<ChatConversationData> => {
    const response = await axios.get<{ message: string; data: ChatConversationData }>(`/pesan/conversations/${id}`);
    return response.data.data;
  }
};

// Salesperson Services
export const salespersonService = {
  // Get paginated list of salespersons
  getList: async ({ page = 1, perPage = 10, search = '', status }: UseSalespersonListParams = {}): Promise<{
    current_page: number;
    data: SalespersonData[];
    last_page: number;
    per_page: number;
    total: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search }),
      ...(status && { status })
    });

    const response = await axios.get(`/pesan/salespersons?${params}`);
    return response.data;
  },

  // Get salesperson by ID
  getById: async (id: number): Promise<SalespersonData> => {
    const response = await axios.get<{ message: string; data: SalespersonData }>(`/pesan/salespersons/${id}`);
    return response.data.data;
  }
};

// React Query Hooks for Messages
export const usePesanList = ({
  page = 1,
  perPage = 10,
  search = '',
  sender_id,
  receiver_id,
  conversation_id
}: UsePesanListParams = {}) => {
  return useQuery({
    queryKey: ['/pesan', { page, perPage, search, sender_id, receiver_id, conversation_id }],
    queryFn: (): Promise<PesanResponse> => {
      return pesanService.getList({ page, perPage, search, sender_id, receiver_id, conversation_id });
    }
  });
};

export const usePesanById = (id: number | null) => {
  return useQuery({
    queryKey: ['/pesan', id],
    queryFn: (): Promise<PesanData> => {
      if (!id) throw new Error('ID is required');
      return pesanService.getById(id);
    },
    enabled: !!id
  });
};

export const useConversationMessages = (
  participantId: number | null,
  currentUserId: number,
  page = 1,
  perPage = 50
) => {
  return useQuery({
    queryKey: ['/pesan/conversations', participantId, currentUserId, { page, perPage }],
    queryFn: (): Promise<PesanResponse> => {
      if (!participantId) throw new Error('Participant ID is required');
      return pesanService.getConversationMessages(participantId, currentUserId, page, perPage);
    },
    enabled: !!participantId
  });
};

// React Query Hooks for Conversations
export const useConversationList = ({
  page = 1,
  perPage = 10,
  search = '',
  participant_id
}: UseChatConversationListParams = {}) => {
  return useQuery({
    queryKey: ['/pesan/conversations', { page, perPage, search, participant_id }],
    queryFn: (): Promise<ChatConversationResponse> => {
      return conversationService.getList({ page, perPage, search, participant_id });
    }
  });
};

export const useConversationById = (id: number | null) => {
  return useQuery({
    queryKey: ['/pesan/conversations', id],
    queryFn: (): Promise<ChatConversationData> => {
      if (!id) throw new Error('ID is required');
      return conversationService.getById(id);
    },
    enabled: !!id
  });
};

// React Query Hooks for Salespersons
export const useSalespersonList = ({ page = 1, perPage = 10, search = '', status }: UseSalespersonListParams = {}) => {
  return useQuery({
    queryKey: ['/pesan/salespersons', { page, perPage, search, status }],
    queryFn: () => {
      return salespersonService.getList({ page, perPage, search, status });
    }
  });
};

export const useSalespersonById = (id: number | null) => {
  return useQuery({
    queryKey: ['/pesan/salespersons', id],
    queryFn: (): Promise<SalespersonData> => {
      if (!id) throw new Error('ID is required');
      return salespersonService.getById(id);
    },
    enabled: !!id
  });
};

// Mutation hooks for Messages
export const useCreatePesan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePesanData & { sender_id: number }): Promise<PesanData> => {
      return pesanService.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch pesan list and conversations
      queryClient.invalidateQueries({ queryKey: ['/pesan'] });
      queryClient.invalidateQueries({ queryKey: ['/pesan/conversations'] });
    }
  });
};

export const useUpdatePesan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { message?: string; is_read?: boolean } }): Promise<PesanData> => {
      return pesanService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch pesan list and specific message
      queryClient.invalidateQueries({ queryKey: ['/pesan'] });
      queryClient.invalidateQueries({ queryKey: ['/pesan', id] });
      queryClient.invalidateQueries({ queryKey: ['/pesan/conversations'] });
    }
  });
};

export const useDeletePesan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<PesanData> => {
      return pesanService.delete(id);
    },
    onSuccess: () => {
      // Invalidate and refetch pesan list
      queryClient.invalidateQueries({ queryKey: ['/pesan'] });
      queryClient.invalidateQueries({ queryKey: ['/pesan/conversations'] });
    }
  });
};

export const useMarkPesanAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<PesanData> => {
      return pesanService.markAsRead(id);
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch pesan list and specific message
      queryClient.invalidateQueries({ queryKey: ['/pesan'] });
      queryClient.invalidateQueries({ queryKey: ['/pesan', id] });
      queryClient.invalidateQueries({ queryKey: ['/pesan/conversations'] });
    }
  });
};
