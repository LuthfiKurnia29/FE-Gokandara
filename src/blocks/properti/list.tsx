'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Building2, ChevronRight } from 'lucide-react';

const properties = [
  {
    id: 'a1',
    name: 'Properti A1',
    location: 'Sigura-Gura',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    price: '0,00',
    status: 'Tersedia'
  },
  {
    id: 'b2',
    name: 'Properti B2',
    location: 'Sigura-Gura',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    price: '0,00',
    status: 'Tersedia'
  },
  {
    id: 'c3',
    name: 'Properti C3',
    location: 'Sigura-Gura',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    price: '0,00',
    status: 'Tersedia'
  }
];

export function PropertyList() {
  return (
    <div className='flex-1 overflow-auto p-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {properties.map((property) => (
          <Link key={property.id} href={`/properti/${property.id}`}>
            <Card className='border-0 shadow-sm transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#2563eb]'>
                    <Building2 className='text-white' size={24} />
                  </div>
                  <div className='flex-1'>
                    <h3 className='mb-1 text-lg font-bold text-[#0c0c0c]'>{property.name}</h3>
                    <p className='mb-2 text-sm font-medium text-[#09bd3c]'>{property.location}</p>
                    <p className='mb-4 line-clamp-2 text-sm text-[#737b8b]'>{property.description}</p>
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='text-xs text-[#737b8b]'>Harga mulai dari</div>
                        <div className='font-bold text-[#0c0c0c]'>Rp {property.price} M</div>
                      </div>
                      <Button size='sm' className='bg-[#09bd3c] hover:bg-[#09bd3c]/90'>
                        {property.status}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
