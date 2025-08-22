import { Suspense } from 'react';

import { TargetAchievedTable } from '@/blocks/target/achieved';

export default async function TargetAchievedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const targetId = Number(id);

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-xl font-semibold'>Pencapaian Target #{targetId}</h1>
      <Suspense fallback={<div>Loading achieved users...</div>}>
        <TargetAchievedTable id={targetId} />
      </Suspense>
    </div>
  );
}
