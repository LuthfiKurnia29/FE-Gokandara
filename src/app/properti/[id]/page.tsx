'use client';

import { useParams } from 'next/navigation';

import { PropertyContent } from '@/blocks/properti';

export default function PropertiDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  return <PropertyContent propertyId={propertyId} />;
}
