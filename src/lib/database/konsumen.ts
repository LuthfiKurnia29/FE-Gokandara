import { KonsumenData } from '@/types/konsumen';

// Mock database - in a real app, this would be a database connection
let konsumenDatabase: KonsumenData[] = [
  {
    id: 1,
    no: 1001,
    name: 'John Doe',
    description: 'Regular customer from Jakarta',
    phone: '+62812-3456-7890',
    email: 'john.doe@email.com',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan'
  },
  {
    id: 2,
    no: 1002,
    name: 'Jane Smith',
    description: 'VIP customer from Bandung',
    phone: '+62813-9876-5432',
    email: 'jane.smith@email.com',
    address: 'Jl. Braga No. 45, Bandung'
  },
  {
    id: 3,
    no: 1003,
    name: 'Ahmad Rahman',
    description: 'Corporate client from Surabaya',
    phone: '+62814-1111-2222',
    email: 'ahmad.rahman@email.com',
    address: 'Jl. Pemuda No. 67, Surabaya'
  },
  {
    id: 4,
    no: 1004,
    name: 'Siti Nurhaliza',
    description: 'Small business owner from Yogyakarta',
    phone: '+62815-3333-4444',
    email: 'siti.nurhaliza@email.com',
    address: 'Jl. Malioboro No. 89, Yogyakarta'
  },
  {
    id: 5,
    no: 1005,
    name: 'Budi Santoso',
    description: 'Retail partner from Medan',
    phone: '+62816-5555-6666',
    email: 'budi.santoso@email.com',
    address: 'Jl. Asia No. 101, Medan'
  },
  {
    id: 6,
    no: 1006,
    name: 'Dewi Sartika',
    description: 'Fashion boutique owner from Bali',
    phone: '+62817-1234-5678',
    email: 'dewi.sartika@email.com',
    address: 'Jl. Monkey Forest Road No. 25, Ubud, Bali'
  },
  {
    id: 7,
    no: 1007,
    name: 'Rudi Hartono',
    description: 'Restaurant chain owner from Semarang',
    phone: '+62818-2345-6789',
    email: 'rudi.hartono@email.com',
    address: 'Jl. Pandanaran No. 135, Semarang'
  },
  {
    id: 8,
    no: 1008,
    name: 'Maya Sari',
    description: 'Tech startup founder from Jakarta',
    phone: '+62819-3456-7890',
    email: 'maya.sari@email.com',
    address: 'Jl. HR Rasuna Said No. 78, Jakarta Selatan'
  },
  {
    id: 9,
    no: 1009,
    name: 'Andi Wijaya',
    description: 'Export-import business from Makassar',
    phone: '+62820-4567-8901',
    email: 'andi.wijaya@email.com',
    address: 'Jl. AP Pettarani No. 92, Makassar'
  },
  {
    id: 10,
    no: 1010,
    name: 'Rina Kusuma',
    description: 'Beauty salon chain owner from Denpasar',
    phone: '+62821-5678-9012',
    email: 'rina.kusuma@email.com',
    address: 'Jl. Gajah Mada No. 56, Denpasar, Bali'
  },
  {
    id: 11,
    no: 1011,
    name: 'Hendra Gunawan',
    description: 'Construction company director from Batam',
    phone: '+62822-6789-0123',
    email: 'hendra.gunawan@email.com',
    address: 'Jl. Jendral Sudirman No. 234, Batam'
  },
  {
    id: 12,
    no: 1012,
    name: 'Lestari Indah',
    description: 'Organic farm owner from Bogor',
    phone: '+62823-7890-1234',
    email: 'lestari.indah@email.com',
    address: 'Jl. Raya Puncak No. 167, Bogor'
  },
  {
    id: 13,
    no: 1013,
    name: 'Bayu Setiawan',
    description: 'IT consultant from Malang',
    phone: '+62824-8901-2345',
    email: 'bayu.setiawan@email.com',
    address: 'Jl. Ijen Boulevard No. 45, Malang'
  },
  {
    id: 14,
    no: 1014,
    name: 'Citra Dewi',
    description: 'Wedding organizer from Solo',
    phone: '+62825-9012-3456',
    email: 'citra.dewi@email.com',
    address: 'Jl. Slamet Riyadi No. 189, Solo'
  },
  {
    id: 15,
    no: 1015,
    name: 'Fahmi Abdullah',
    description: 'Automotive parts supplier from Tangerang',
    phone: '+62826-0123-4567',
    email: 'fahmi.abdullah@email.com',
    address: 'Jl. MH Thamrin No. 123, Tangerang'
  },
  {
    id: 16,
    no: 1016,
    name: 'Sari Melati',
    description: 'Textile manufacturer from Bandung',
    phone: '+62827-1234-5678',
    email: 'sari.melati@email.com',
    address: 'Jl. Dago No. 278, Bandung'
  },
  {
    id: 17,
    no: 1017,
    name: 'Joko Susilo',
    description: 'Furniture workshop owner from Jepara',
    phone: '+62828-2345-6789',
    email: 'joko.susilo@email.com',
    address: 'Jl. Raya Jepara-Kudus No. 45, Jepara'
  },
  {
    id: 18,
    no: 1018,
    name: 'Ratna Sari',
    description: 'Coffee shop chain from Lampung',
    phone: '+62829-3456-7890',
    email: 'ratna.sari@email.com',
    address: 'Jl. Zainal Abidin Pagar Alam No. 67, Bandar Lampung'
  },
  {
    id: 19,
    no: 1019,
    name: 'Agus Salim',
    description: 'Logistics company from Palembang',
    phone: '+62830-4567-8901',
    email: 'agus.salim@email.com',
    address: 'Jl. Jendral Sudirman No. 145, Palembang'
  },
  {
    id: 20,
    no: 1020,
    name: 'Indira Putri',
    description: 'E-commerce business from Bekasi',
    phone: '+62831-5678-9012',
    email: 'indira.putri@email.com',
    address: 'Jl. Ahmad Yani No. 234, Bekasi'
  },
  {
    id: 21,
    no: 1021,
    name: 'Wahyu Pratama',
    description: 'Digital marketing agency from Jogja',
    phone: '+62832-6789-0123',
    email: 'wahyu.pratama@email.com',
    address: 'Jl. Kaliurang No. 156, Yogyakarta'
  },
  {
    id: 22,
    no: 1022,
    name: 'Mega Putri',
    description: 'Catering service from Depok',
    phone: '+62833-7890-1234',
    email: 'mega.putri@email.com',
    address: 'Jl. Margonda Raya No. 89, Depok'
  },
  {
    id: 23,
    no: 1023,
    name: 'Rizki Hakim',
    description: 'Property developer from Manado',
    phone: '+62834-8901-2345',
    email: 'rizki.hakim@email.com',
    address: 'Jl. Sam Ratulangi No. 123, Manado'
  },
  {
    id: 24,
    no: 1024,
    name: 'Tari Wulandari',
    description: 'Event management from Pontianak',
    phone: '+62835-9012-3456',
    email: 'tari.wulandari@email.com',
    address: 'Jl. Ahmad Yani No. 78, Pontianak'
  },
  {
    id: 25,
    no: 1025,
    name: 'Dimas Prasetyo',
    description: 'Pharmaceutical distributor from Samarinda',
    phone: '+62836-0123-4567',
    email: 'dimas.prasetyo@email.com',
    address: 'Jl. Mulawarman No. 234, Samarinda'
  }
];

let nextId = 26;
let nextNo = 1026;

// Database operations
export const KonsumenDB = {
  // Get all konsumen
  getAll: (): KonsumenData[] => {
    return [...konsumenDatabase];
  },

  // Get konsumen by ID
  getById: (id: number): KonsumenData | undefined => {
    return konsumenDatabase.find((k) => k.id === id);
  },

  // Get filtered konsumen with search
  getFiltered: (search: string): KonsumenData[] => {
    if (!search) return [...konsumenDatabase];

    return konsumenDatabase.filter(
      (konsumen) =>
        konsumen.name.toLowerCase().includes(search.toLowerCase()) ||
        konsumen.email.toLowerCase().includes(search.toLowerCase()) ||
        konsumen.phone.includes(search) ||
        konsumen.address.toLowerCase().includes(search.toLowerCase())
    );
  },

  // Create new konsumen
  create: (data: Omit<KonsumenData, 'id' | 'no'>): KonsumenData => {
    const newKonsumen: KonsumenData = {
      id: nextId++,
      no: nextNo++,
      ...data
    };

    konsumenDatabase.push(newKonsumen);
    return newKonsumen;
  },

  // Update konsumen
  update: (id: number, data: Partial<Omit<KonsumenData, 'id' | 'no'>>): KonsumenData | null => {
    const index = konsumenDatabase.findIndex((k) => k.id === id);

    if (index === -1) return null;

    konsumenDatabase[index] = {
      ...konsumenDatabase[index],
      ...data
    };

    return konsumenDatabase[index];
  },

  // Delete konsumen
  delete: (id: number): KonsumenData | null => {
    const index = konsumenDatabase.findIndex((k) => k.id === id);

    if (index === -1) return null;

    const deletedKonsumen = konsumenDatabase[index];
    konsumenDatabase.splice(index, 1);

    return deletedKonsumen;
  },

  // Check if email exists (excluding specific ID)
  emailExists: (email: string, excludeId?: number): boolean => {
    return konsumenDatabase.some((k) => k.email === email && (excludeId ? k.id !== excludeId : true));
  },

  // Get total count
  count: (): number => {
    return konsumenDatabase.length;
  },

  // Get filtered count
  countFiltered: (search: string): number => {
    return KonsumenDB.getFiltered(search).length;
  }
};
