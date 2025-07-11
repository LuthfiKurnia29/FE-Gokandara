import { ChatConversationData, PesanData, SalespersonData } from '@/types/pesan';

// Mock salesperson database
let salespersonDatabase: SalespersonData[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phone: '+62812-1111-1111',
    avatar: '/avatars/alex.jpg',
    position: 'Senior Sales Executive',
    department: 'Sales',
    status: 'online',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    phone: '+62812-2222-2222',
    avatar: '/avatars/maria.jpg',
    position: 'Sales Manager',
    department: 'Sales',
    status: 'online',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 3,
    name: 'David Chen',
    email: 'david.chen@company.com',
    phone: '+62812-3333-3333',
    avatar: '/avatars/david.jpg',
    position: 'Sales Representative',
    department: 'Sales',
    status: 'busy',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+62812-4444-4444',
    avatar: '/avatars/sarah.jpg',
    position: 'Account Manager',
    department: 'Sales',
    status: 'offline',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael.brown@company.com',
    phone: '+62812-5555-5555',
    avatar: '/avatars/michael.jpg',
    position: 'Regional Sales Director',
    department: 'Sales',
    status: 'online',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    phone: '+62812-6666-6666',
    avatar: '/avatars/emily.jpg',
    position: 'Sales Coordinator',
    department: 'Sales',
    status: 'online',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 7,
    name: 'James Rodriguez',
    email: 'james.rodriguez@company.com',
    phone: '+62812-7777-7777',
    avatar: '/avatars/james.jpg',
    position: 'Business Development Manager',
    department: 'Sales',
    status: 'busy',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+62812-8888-8888',
    avatar: '/avatars/lisa.jpg',
    position: 'Sales Specialist',
    department: 'Sales',
    status: 'offline',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  }
];

// Mock chat messages database
let pesanDatabase: PesanData[] = [
  {
    id: 1,
    sender_id: 1,
    receiver_id: 2,
    message: 'Hi Maria! How are the Q1 sales targets looking?',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[0],
    receiver: salespersonDatabase[1],
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    sender_id: 2,
    receiver_id: 1,
    message: "Hey Alex! Things are looking good. We're at 85% of our target already.",
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[1],
    receiver: salespersonDatabase[0],
    created_at: '2024-01-15T09:05:00Z',
    updated_at: '2024-01-15T09:05:00Z'
  },
  {
    id: 3,
    sender_id: 1,
    receiver_id: 2,
    message: "That's fantastic! Any specific strategies that worked well?",
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[0],
    receiver: salespersonDatabase[1],
    created_at: '2024-01-15T09:10:00Z',
    updated_at: '2024-01-15T09:10:00Z'
  },
  {
    id: 4,
    sender_id: 3,
    receiver_id: 5,
    message: 'Michael, I need your advice on the Johnson account.',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[2],
    receiver: salespersonDatabase[4],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 5,
    sender_id: 5,
    receiver_id: 3,
    message: "Sure David! What's the situation?",
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[4],
    receiver: salespersonDatabase[2],
    created_at: '2024-01-15T10:05:00Z',
    updated_at: '2024-01-15T10:05:00Z'
  },
  {
    id: 6,
    sender_id: 3,
    receiver_id: 5,
    message: "They're asking for a 15% discount on the enterprise package. What do you think?",
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[2],
    receiver: salespersonDatabase[4],
    created_at: '2024-01-15T10:10:00Z',
    updated_at: '2024-01-15T10:10:00Z'
  },
  {
    id: 7,
    sender_id: 6,
    receiver_id: 7,
    message: 'James, can you help me with the presentation for tomorrow?',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[5],
    receiver: salespersonDatabase[6],
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 8,
    sender_id: 7,
    receiver_id: 6,
    message: 'Of course, Emily! I have some templates that might help.',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[6],
    receiver: salespersonDatabase[5],
    created_at: '2024-01-15T11:05:00Z',
    updated_at: '2024-01-15T11:05:00Z'
  },
  {
    id: 9,
    sender_id: 6,
    receiver_id: 7,
    message: 'Perfect! Can you send them over?',
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[5],
    receiver: salespersonDatabase[6],
    created_at: '2024-01-15T11:10:00Z',
    updated_at: '2024-01-15T11:10:00Z'
  },
  {
    id: 10,
    sender_id: 4,
    receiver_id: 8,
    message: 'Lisa, how did the client meeting go today?',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[3],
    receiver: salespersonDatabase[7],
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z'
  },
  {
    id: 11,
    sender_id: 8,
    receiver_id: 4,
    message: "It went really well! They're interested in our premium package.",
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[7],
    receiver: salespersonDatabase[3],
    created_at: '2024-01-15T14:05:00Z',
    updated_at: '2024-01-15T14:05:00Z'
  },
  {
    id: 12,
    sender_id: 4,
    receiver_id: 8,
    message: "That's great news! Let's schedule a follow-up call.",
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[3],
    receiver: salespersonDatabase[7],
    created_at: '2024-01-15T14:10:00Z',
    updated_at: '2024-01-15T14:10:00Z'
  },
  {
    id: 13,
    sender_id: 2,
    receiver_id: 5,
    message: 'Michael, the team performance report is ready for review.',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[1],
    receiver: salespersonDatabase[4],
    created_at: '2024-01-15T15:00:00Z',
    updated_at: '2024-01-15T15:00:00Z'
  },
  {
    id: 14,
    sender_id: 5,
    receiver_id: 2,
    message: "Thanks Maria! I'll review it this evening.",
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[4],
    receiver: salespersonDatabase[1],
    created_at: '2024-01-15T15:05:00Z',
    updated_at: '2024-01-15T15:05:00Z'
  },
  {
    id: 15,
    sender_id: 1,
    receiver_id: 3,
    message: 'David, great work on the Henderson deal!',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[0],
    receiver: salespersonDatabase[2],
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T16:00:00Z'
  },
  {
    id: 16,
    sender_id: 3,
    receiver_id: 1,
    message: 'Thanks Alex! It was a team effort.',
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[2],
    receiver: salespersonDatabase[0],
    created_at: '2024-01-15T16:05:00Z',
    updated_at: '2024-01-15T16:05:00Z'
  },
  {
    id: 17,
    sender_id: 7,
    receiver_id: 1,
    message: 'Alex, can we discuss the new product launch strategy?',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[6],
    receiver: salespersonDatabase[0],
    created_at: '2024-01-15T17:00:00Z',
    updated_at: '2024-01-15T17:00:00Z'
  },
  {
    id: 18,
    sender_id: 1,
    receiver_id: 7,
    message: "Absolutely! Let's schedule a meeting for tomorrow morning.",
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[0],
    receiver: salespersonDatabase[6],
    created_at: '2024-01-15T17:05:00Z',
    updated_at: '2024-01-15T17:05:00Z'
  },
  {
    id: 19,
    sender_id: 6,
    receiver_id: 4,
    message: 'Sarah, the client feedback came in positive!',
    message_type: 'text',
    is_read: true,
    sender: salespersonDatabase[5],
    receiver: salespersonDatabase[3],
    created_at: '2024-01-15T18:00:00Z',
    updated_at: '2024-01-15T18:00:00Z'
  },
  {
    id: 20,
    sender_id: 4,
    receiver_id: 6,
    message: 'Excellent! What were the main points they mentioned?',
    message_type: 'text',
    is_read: false,
    sender: salespersonDatabase[3],
    receiver: salespersonDatabase[5],
    created_at: '2024-01-15T18:05:00Z',
    updated_at: '2024-01-15T18:05:00Z'
  }
];

// Helper function to get salesperson by ID
const getSalespersonById = (id: number): SalespersonData | undefined => {
  return salespersonDatabase.find((s) => s.id === id);
};

// Helper function to create conversation data
const createConversationData = (participant1Id: number, participant2Id: number): ChatConversationData | null => {
  const participant1 = getSalespersonById(participant1Id);
  const participant2 = getSalespersonById(participant2Id);

  if (!participant1 || !participant2) return null;

  // Get messages between these two participants
  const messages = pesanDatabase.filter(
    (msg) =>
      (msg.sender_id === participant1Id && msg.receiver_id === participant2Id) ||
      (msg.sender_id === participant2Id && msg.receiver_id === participant1Id)
  );

  if (messages.length === 0) return null;

  // Get latest message
  const latestMessage = messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  // Count unread messages for participant 1
  const unreadCount = messages.filter((msg) => msg.receiver_id === participant1Id && !msg.is_read).length;

  return {
    id: parseInt(`${participant1Id}${participant2Id}`),
    participant_1_id: participant1Id,
    participant_2_id: participant2Id,
    last_message: latestMessage.message,
    last_message_at: latestMessage.created_at,
    unread_count: unreadCount,
    participant_1: participant1,
    participant_2: participant2,
    created_at: messages[0].created_at,
    updated_at: latestMessage.updated_at
  };
};

// Database operations class
export class PesanDB {
  static getAll(): PesanData[] {
    return pesanDatabase;
  }

  static getFiltered(search: string = '', senderId?: number, receiverId?: number): PesanData[] {
    let filtered = pesanDatabase;

    if (search) {
      filtered = filtered.filter(
        (pesan) =>
          pesan.message.toLowerCase().includes(search.toLowerCase()) ||
          pesan.sender.name.toLowerCase().includes(search.toLowerCase()) ||
          pesan.receiver.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (senderId) {
      filtered = filtered.filter((pesan) => pesan.sender_id === senderId);
    }

    if (receiverId) {
      filtered = filtered.filter((pesan) => pesan.receiver_id === receiverId);
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getById(id: number): PesanData | undefined {
    return pesanDatabase.find((pesan) => pesan.id === id);
  }

  static create(data: {
    sender_id: number;
    receiver_id: number;
    message: string;
    message_type?: 'text' | 'image' | 'file';
  }): PesanData {
    const sender = getSalespersonById(data.sender_id);
    const receiver = getSalespersonById(data.receiver_id);

    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    const newId = Math.max(...pesanDatabase.map((p) => p.id), 0) + 1;
    const now = new Date().toISOString();

    const newPesan: PesanData = {
      id: newId,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      message: data.message,
      message_type: data.message_type || 'text',
      is_read: false,
      sender,
      receiver,
      created_at: now,
      updated_at: now
    };

    pesanDatabase.push(newPesan);
    return newPesan;
  }

  static update(id: number, data: { message?: string; is_read?: boolean }): PesanData | undefined {
    const index = pesanDatabase.findIndex((pesan) => pesan.id === id);
    if (index === -1) return undefined;

    const updatedPesan = {
      ...pesanDatabase[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    pesanDatabase[index] = updatedPesan;
    return updatedPesan;
  }

  static delete(id: number): PesanData | undefined {
    const index = pesanDatabase.findIndex((pesan) => pesan.id === id);
    if (index === -1) return undefined;

    const deletedPesan = pesanDatabase[index];
    pesanDatabase.splice(index, 1);
    return deletedPesan;
  }

  static markAsRead(id: number): PesanData | undefined {
    return this.update(id, { is_read: true });
  }

  static getConversationBetween(participant1Id: number, participant2Id: number): PesanData[] {
    return pesanDatabase
      .filter(
        (msg) =>
          (msg.sender_id === participant1Id && msg.receiver_id === participant2Id) ||
          (msg.sender_id === participant2Id && msg.receiver_id === participant1Id)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

// Salesperson database operations
export class SalespersonDB {
  static getAll(): SalespersonData[] {
    return salespersonDatabase;
  }

  static getFiltered(search: string = '', status?: 'online' | 'offline' | 'busy'): SalespersonData[] {
    let filtered = salespersonDatabase;

    if (search) {
      filtered = filtered.filter(
        (salesperson) =>
          salesperson.name.toLowerCase().includes(search.toLowerCase()) ||
          salesperson.email.toLowerCase().includes(search.toLowerCase()) ||
          salesperson.position.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter((salesperson) => salesperson.status === status);
    }

    return filtered;
  }

  static getById(id: number): SalespersonData | undefined {
    return salespersonDatabase.find((salesperson) => salesperson.id === id);
  }

  static updateStatus(id: number, status: 'online' | 'offline' | 'busy'): SalespersonData | undefined {
    const index = salespersonDatabase.findIndex((salesperson) => salesperson.id === id);
    if (index === -1) return undefined;

    const updatedSalesperson = {
      ...salespersonDatabase[index],
      status,
      updated_at: new Date().toISOString()
    };

    salespersonDatabase[index] = updatedSalesperson;
    return updatedSalesperson;
  }
}

// Chat conversations database operations
export class ChatConversationDB {
  static getAll(): ChatConversationData[] {
    const conversations: ChatConversationData[] = [];
    const processedPairs = new Set<string>();

    pesanDatabase.forEach((msg) => {
      const pair1 = `${msg.sender_id}-${msg.receiver_id}`;
      const pair2 = `${msg.receiver_id}-${msg.sender_id}`;

      if (!processedPairs.has(pair1) && !processedPairs.has(pair2)) {
        const conversation = createConversationData(msg.sender_id, msg.receiver_id);
        if (conversation) {
          conversations.push(conversation);
          processedPairs.add(pair1);
          processedPairs.add(pair2);
        }
      }
    });

    return conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
  }

  static getFiltered(search: string = '', participantId?: number): ChatConversationData[] {
    let filtered = this.getAll();

    if (search) {
      filtered = filtered.filter(
        (conversation) =>
          conversation.last_message.toLowerCase().includes(search.toLowerCase()) ||
          conversation.participant_1.name.toLowerCase().includes(search.toLowerCase()) ||
          conversation.participant_2.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (participantId) {
      filtered = filtered.filter(
        (conversation) =>
          conversation.participant_1_id === participantId || conversation.participant_2_id === participantId
      );
    }

    return filtered;
  }

  static getById(id: number): ChatConversationData | undefined {
    return this.getAll().find((conversation) => conversation.id === id);
  }
}
