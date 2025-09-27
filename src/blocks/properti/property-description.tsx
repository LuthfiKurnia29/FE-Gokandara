'use client';

import { PropertyData } from '@/types/properti';

interface PropertyDescriptionProps {
  property?: PropertyData;
}

export const PropertyDescription = ({ property }: PropertyDescriptionProps) => {
  return (
    <section className='mb-8'>
      <h2 className='mb-4 text-2xl font-bold text-gray-800'>Alamat</h2>
      <div className='space-y-4 text-sm leading-relaxed text-gray-600'>
        <p>{property?.lokasi}</p>
      </div>
    </section>
  );
};
