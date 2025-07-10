import { PropertyData, PropertyStatus } from '@/types/property';

// Mock database - in a real app, this would be a database connection
let propertyDatabase: PropertyData[] = [
  {
    id: 1,
    code: 'A1',
    name: 'HOONIAN Sigura-Gura A1',
    description: 'Modern residential complex with premium facilities and strategic location in Sigura-Gura area.',
    location: 'Sigura-Gura',
    address: 'Jl. Sigura-Gura No. 123, Kec. Sigura-Gura, Malang',
    price: 450000000,
    discountPrice: 430000000,
    status: 'available',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 45,
    facilities: ['Swimming Pool', 'Gym', 'Parking', 'Security 24/7', 'Garden', 'Playground'],
    images: [
      'https://placehold.co/800x600/09bd3c/ffffff?text=A1+Image+1',
      'https://placehold.co/800x600/2563eb/ffffff?text=A1+Image+2',
      'https://placehold.co/800x600/dc2626/ffffff?text=A1+Image+3'
    ],
    hasWifi: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    code: 'B2',
    name: 'HOONIAN Bumi Palapa B2',
    description: 'Luxury villa with spacious living area and complete modern amenities in Bumi Palapa complex.',
    location: 'Bumi Palapa',
    address: 'Jl. Bumi Palapa No. 456, Kec. Lowokwaru, Malang',
    price: 550000000,
    discountPrice: 520000000,
    status: 'available',
    type: 'Villa',
    bedrooms: 3,
    bathrooms: 2,
    area: 75,
    facilities: ['Private Pool', 'Garden', 'Garage', 'Maid Room', 'Security', 'CCTV'],
    images: [
      'https://placehold.co/800x600/7c3aed/ffffff?text=B2+Image+1',
      'https://placehold.co/800x600/059669/ffffff?text=B2+Image+2',
      'https://placehold.co/800x600/ea580c/ffffff?text=B2+Image+3'
    ],
    hasWifi: true,
    createdAt: '2024-01-02T11:00:00Z',
    updatedAt: '2024-01-02T11:00:00Z'
  },
  {
    id: 3,
    code: 'C3',
    name: 'HOONIAN Bunga Kosmea C3',
    description: 'Cozy house perfect for small family with beautiful garden view and peaceful environment.',
    location: 'Bunga Kosmea',
    address: 'Jl. Bunga Kosmea No. 789, Kec. Klojen, Malang',
    price: 350000000,
    discountPrice: 325000000,
    status: 'available',
    type: 'House',
    bedrooms: 2,
    bathrooms: 1,
    area: 60,
    facilities: ['Garden', 'Parking', 'Security', 'Water Tank', 'Electricity 2200W'],
    images: [
      'https://placehold.co/800x600/f59e0b/ffffff?text=C3+Image+1',
      'https://placehold.co/800x600/ef4444/ffffff?text=C3+Image+2',
      'https://placehold.co/800x600/8b5cf6/ffffff?text=C3+Image+3'
    ],
    hasWifi: false,
    createdAt: '2024-01-03T12:00:00Z',
    updatedAt: '2024-01-03T12:00:00Z'
  },
  {
    id: 4,
    code: 'D4',
    name: 'HOONIAN Borobudur D4',
    description: 'Premium penthouse with stunning city view and exclusive facilities for modern lifestyle.',
    location: 'Borobudur',
    address: 'Jl. Borobudur No. 101, Kec. Klojen, Malang',
    price: 750000000,
    discountPrice: 700000000,
    status: 'pending',
    type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 3,
    area: 120,
    facilities: ['Private Elevator', 'Rooftop Garden', 'Jacuzzi', 'Home Theater', 'Smart Home', 'Concierge'],
    images: [
      'https://placehold.co/800x600/06b6d4/ffffff?text=D4+Image+1',
      'https://placehold.co/800x600/84cc16/ffffff?text=D4+Image+2',
      'https://placehold.co/800x600/f97316/ffffff?text=D4+Image+3'
    ],
    hasWifi: true,
    createdAt: '2024-01-04T13:00:00Z',
    updatedAt: '2024-01-04T13:00:00Z'
  },
  {
    id: 5,
    code: 'E5',
    name: 'RHUMA Arumba E5',
    description: 'Affordable housing with complete basic facilities and easy access to public transportation.',
    location: 'Arumba',
    address: 'Jl. Arumba No. 234, Kec. Blimbing, Malang',
    price: 275000000,
    status: 'available',
    type: 'House',
    bedrooms: 2,
    bathrooms: 1,
    area: 36,
    facilities: ['Parking', 'Security', 'Mosque', 'Playground', 'Market'],
    images: [
      'https://placehold.co/800x600/14b8a6/ffffff?text=E5+Image+1',
      'https://placehold.co/800x600/a855f7/ffffff?text=E5+Image+2',
      'https://placehold.co/800x600/f43f5e/ffffff?text=E5+Image+3'
    ],
    hasWifi: false,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-05T14:00:00Z'
  },
  {
    id: 6,
    code: 'F6',
    name: 'HOONIAN Green Valley F6',
    description: 'Eco-friendly townhouse with solar panels and rainwater harvesting system.',
    location: 'Green Valley',
    address: 'Jl. Green Valley No. 567, Kec. Sukun, Malang',
    price: 480000000,
    discountPrice: 460000000,
    status: 'reserved',
    type: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    facilities: ['Solar Panel', 'Rainwater Harvesting', 'Garden', 'Garage', 'Security', 'Green Space'],
    images: [
      'https://placehold.co/800x600/22c55e/ffffff?text=F6+Image+1',
      'https://placehold.co/800x600/3b82f6/ffffff?text=F6+Image+2',
      'https://placehold.co/800x600/eab308/ffffff?text=F6+Image+3'
    ],
    hasWifi: true,
    createdAt: '2024-01-06T15:00:00Z',
    updatedAt: '2024-01-06T15:00:00Z'
  },
  {
    id: 7,
    code: 'G7',
    name: 'HOONIAN Skyline G7',
    description: 'High-rise apartment with panoramic city view and luxury amenities.',
    location: 'City Center',
    address: 'Jl. Veteran No. 890, Kec. Klojen, Malang',
    price: 650000000,
    discountPrice: 620000000,
    status: 'sold',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: 95,
    facilities: ['Sky Garden', 'Infinity Pool', 'Gym', 'Sauna', 'Business Center', 'Valet Parking'],
    images: [
      'https://placehold.co/800x600/6366f1/ffffff?text=G7+Image+1',
      'https://placehold.co/800x600/ec4899/ffffff?text=G7+Image+2',
      'https://placehold.co/800x600/10b981/ffffff?text=G7+Image+3'
    ],
    hasWifi: true,
    createdAt: '2024-01-07T16:00:00Z',
    updatedAt: '2024-01-07T16:00:00Z'
  },
  {
    id: 8,
    code: 'H8',
    name: 'HOONIAN Riverside H8',
    description: 'Waterfront property with private dock and scenic river views.',
    location: 'Riverside',
    address: 'Jl. Sungai Indah No. 123, Kec. Lowokwaru, Malang',
    price: 850000000,
    discountPrice: 800000000,
    status: 'available',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 150,
    facilities: ['Private Dock', 'River Access', 'Gazebo', 'BBQ Area', 'Security', 'Landscaped Garden'],
    images: [
      'https://placehold.co/800x600/0891b2/ffffff?text=H8+Image+1',
      'https://placehold.co/800x600/be123c/ffffff?text=H8+Image+2',
      'https://placehold.co/800x600/7c2d12/ffffff?text=H8+Image+3'
    ],
    hasWifi: true,
    createdAt: '2024-01-08T17:00:00Z',
    updatedAt: '2024-01-08T17:00:00Z'
  }
];

let nextId = 9;

// Database operations
export const PropertyDB = {
  // Get all properties
  getAll: (): PropertyData[] => {
    return [...propertyDatabase];
  },

  // Get property by ID
  getById: (id: number): PropertyData | undefined => {
    return propertyDatabase.find((p) => p.id === id);
  },

  // Get property by code
  getByCode: (code: string): PropertyData | undefined => {
    return propertyDatabase.find((p) => p.code.toLowerCase() === code.toLowerCase());
  },

  // Get filtered properties with search and filters
  getFiltered: (
    search: string,
    status?: PropertyStatus,
    type?: string,
    location?: string,
    minPrice?: number,
    maxPrice?: number
  ): PropertyData[] => {
    let filtered = [...propertyDatabase];

    // Filter by status
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter((p) => p.type.toLowerCase() === type.toLowerCase());
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
    }

    // Filter by price range
    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.name.toLowerCase().includes(searchLower) ||
          property.code.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.type.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  },

  // Create new property
  create: (data: Omit<PropertyData, 'id' | 'createdAt' | 'updatedAt'>): PropertyData => {
    const now = new Date().toISOString();
    const newProperty: PropertyData = {
      id: nextId++,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    propertyDatabase.push(newProperty);
    return newProperty;
  },

  // Update property
  update: (id: number, data: Partial<Omit<PropertyData, 'id' | 'createdAt'>>): PropertyData | null => {
    const index = propertyDatabase.findIndex((p) => p.id === id);

    if (index === -1) return null;

    const now = new Date().toISOString();
    propertyDatabase[index] = {
      ...propertyDatabase[index],
      ...data,
      updatedAt: now
    };

    return propertyDatabase[index];
  },

  // Delete property
  delete: (id: number): PropertyData | null => {
    const index = propertyDatabase.findIndex((p) => p.id === id);

    if (index === -1) return null;

    const deletedProperty = propertyDatabase[index];
    propertyDatabase.splice(index, 1);

    return deletedProperty;
  },

  // Check if code exists (excluding specific ID)
  codeExists: (code: string, excludeId?: number): boolean => {
    return propertyDatabase.some(
      (p) => p.code.toLowerCase() === code.toLowerCase() && (excludeId ? p.id !== excludeId : true)
    );
  },

  // Get total count
  count: (): number => {
    return propertyDatabase.length;
  },

  // Get filtered count
  countFiltered: (
    search: string,
    status?: PropertyStatus,
    type?: string,
    location?: string,
    minPrice?: number,
    maxPrice?: number
  ): number => {
    return PropertyDB.getFiltered(search, status, type, location, minPrice, maxPrice).length;
  },

  // Get properties by status
  getByStatus: (status: PropertyStatus): PropertyData[] => {
    return propertyDatabase.filter((p) => p.status === status);
  },

  // Get properties by type
  getByType: (type: string): PropertyData[] => {
    return propertyDatabase.filter((p) => p.type.toLowerCase() === type.toLowerCase());
  },

  // Get properties by location
  getByLocation: (location: string): PropertyData[] => {
    return propertyDatabase.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
  },

  // Get available properties
  getAvailable: (): PropertyData[] => {
    return propertyDatabase.filter((p) => p.status === 'available');
  }
};
