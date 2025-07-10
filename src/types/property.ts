export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  price: {
    start: number;
    end: number;
  };
  status: 'available' | 'sold' | 'pending';
  facilities: string[];
  images: string[];
  details: {
    bedrooms: number;
    bathrooms: number;
    hasWifi: boolean;
  };
  address: {
    street: string;
    district: string;
    city: string;
  };
}

export interface PropertyImage {
  url: string;
  alt: string;
  thumbnail?: boolean;
}
