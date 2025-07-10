import { PenjualanData, PenjualanStatus } from '@/types/penjualan';

// Mock database - in a real app, this would be a database connection
let penjualanDatabase: PenjualanData[] = [
  {
    id: 1,
    konsumenId: 1,
    propertiId: 1,
    diskon: 5000000,
    grandTotal: 450000000,
    status: 'Negotiation',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    konsumenId: 2,
    propertiId: 2,
    diskon: 10000000,
    grandTotal: 540000000,
    status: 'Pending',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 3,
    konsumenId: 3,
    propertiId: 1,
    diskon: 0,
    grandTotal: 450000000,
    status: 'Approved',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T16:45:00Z'
  },
  {
    id: 4,
    konsumenId: 1,
    propertiId: 3,
    diskon: 15000000,
    grandTotal: 335000000,
    status: 'Negotiation',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z'
  },
  {
    id: 5,
    konsumenId: 4,
    propertiId: 2,
    diskon: 20000000,
    grandTotal: 530000000,
    status: 'Pending',
    createdAt: '2024-01-19T13:30:00Z',
    updatedAt: '2024-01-19T13:30:00Z'
  },
  {
    id: 6,
    konsumenId: 5,
    propertiId: 1,
    diskon: 0,
    grandTotal: 450000000,
    status: 'Approved',
    createdAt: '2024-01-20T08:45:00Z',
    updatedAt: '2024-01-20T15:20:00Z'
  },
  {
    id: 7,
    konsumenId: 6,
    propertiId: 3,
    diskon: 25000000,
    grandTotal: 325000000,
    status: 'Negotiation',
    createdAt: '2024-01-21T16:10:00Z',
    updatedAt: '2024-01-21T16:10:00Z'
  },
  {
    id: 8,
    konsumenId: 7,
    propertiId: 2,
    diskon: 8000000,
    grandTotal: 542000000,
    status: 'Pending',
    createdAt: '2024-01-22T12:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z'
  },
  {
    id: 9,
    konsumenId: 8,
    propertiId: 1,
    diskon: 12000000,
    grandTotal: 438000000,
    status: 'Approved',
    createdAt: '2024-01-23T10:15:00Z',
    updatedAt: '2024-01-23T17:30:00Z'
  },
  {
    id: 10,
    konsumenId: 9,
    propertiId: 3,
    diskon: 30000000,
    grandTotal: 320000000,
    status: 'Negotiation',
    createdAt: '2024-01-24T14:25:00Z',
    updatedAt: '2024-01-24T14:25:00Z'
  },
  {
    id: 11,
    konsumenId: 10,
    propertiId: 2,
    diskon: 5000000,
    grandTotal: 545000000,
    status: 'Pending',
    createdAt: '2024-01-25T09:40:00Z',
    updatedAt: '2024-01-25T09:40:00Z'
  },
  {
    id: 12,
    konsumenId: 11,
    propertiId: 1,
    diskon: 0,
    grandTotal: 450000000,
    status: 'Approved',
    createdAt: '2024-01-26T11:50:00Z',
    updatedAt: '2024-01-26T16:15:00Z'
  },
  {
    id: 13,
    konsumenId: 12,
    propertiId: 3,
    diskon: 18000000,
    grandTotal: 332000000,
    status: 'Negotiation',
    createdAt: '2024-01-27T15:20:00Z',
    updatedAt: '2024-01-27T15:20:00Z'
  },
  {
    id: 14,
    konsumenId: 13,
    propertiId: 2,
    diskon: 22000000,
    grandTotal: 528000000,
    status: 'Pending',
    createdAt: '2024-01-28T13:10:00Z',
    updatedAt: '2024-01-28T13:10:00Z'
  },
  {
    id: 15,
    konsumenId: 14,
    propertiId: 1,
    diskon: 7000000,
    grandTotal: 443000000,
    status: 'Approved',
    createdAt: '2024-01-29T10:05:00Z',
    updatedAt: '2024-01-29T18:22:00Z'
  }
];

let nextId = 16;

// Database operations
export const PenjualanDB = {
  // Get all penjualan
  getAll: (): PenjualanData[] => {
    return [...penjualanDatabase];
  },

  // Get penjualan by ID
  getById: (id: number): PenjualanData | undefined => {
    return penjualanDatabase.find((p) => p.id === id);
  },

  // Get filtered penjualan with search and filters
  getFiltered: (search: string, status?: PenjualanStatus, konsumenId?: number): PenjualanData[] => {
    let filtered = [...penjualanDatabase];

    // Filter by status
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Filter by konsumenId
    if (konsumenId) {
      filtered = filtered.filter((p) => p.konsumenId === konsumenId);
    }

    // Filter by search term (searching in ID, konsumenId, propertiId, grandTotal)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (penjualan) =>
          penjualan.id.toString().includes(searchLower) ||
          penjualan.konsumenId.toString().includes(searchLower) ||
          penjualan.propertiId.toString().includes(searchLower) ||
          penjualan.grandTotal.toString().includes(searchLower) ||
          penjualan.status.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  },

  // Create new penjualan
  create: (data: Omit<PenjualanData, 'id' | 'createdAt' | 'updatedAt'>): PenjualanData => {
    const now = new Date().toISOString();
    const newPenjualan: PenjualanData = {
      id: nextId++,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    penjualanDatabase.push(newPenjualan);
    return newPenjualan;
  },

  // Update penjualan
  update: (id: number, data: Partial<Omit<PenjualanData, 'id' | 'createdAt'>>): PenjualanData | null => {
    const index = penjualanDatabase.findIndex((p) => p.id === id);

    if (index === -1) return null;

    const now = new Date().toISOString();
    penjualanDatabase[index] = {
      ...penjualanDatabase[index],
      ...data,
      updatedAt: now
    };

    return penjualanDatabase[index];
  },

  // Update penjualan status only
  updateStatus: (id: number, status: PenjualanStatus): PenjualanData | null => {
    const index = penjualanDatabase.findIndex((p) => p.id === id);

    if (index === -1) return null;

    const now = new Date().toISOString();
    penjualanDatabase[index] = {
      ...penjualanDatabase[index],
      status,
      updatedAt: now
    };

    return penjualanDatabase[index];
  },

  // Delete penjualan
  delete: (id: number): PenjualanData | null => {
    const index = penjualanDatabase.findIndex((p) => p.id === id);

    if (index === -1) return null;

    const deletedPenjualan = penjualanDatabase[index];
    penjualanDatabase.splice(index, 1);

    return deletedPenjualan;
  },

  // Get total count
  count: (): number => {
    return penjualanDatabase.length;
  },

  // Get filtered count
  countFiltered: (search: string, status?: PenjualanStatus, konsumenId?: number): number => {
    return PenjualanDB.getFiltered(search, status, konsumenId).length;
  },

  // Get penjualan by konsumen ID
  getByKonsumenId: (konsumenId: number): PenjualanData[] => {
    return penjualanDatabase.filter((p) => p.konsumenId === konsumenId);
  },

  // Get penjualan by status
  getByStatus: (status: PenjualanStatus): PenjualanData[] => {
    return penjualanDatabase.filter((p) => p.status === status);
  }
};
