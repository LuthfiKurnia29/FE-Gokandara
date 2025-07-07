'use client';

import { PageTitle } from '@/components/page-title';

export default function ProfilePage() {
  return (
    <section className='p-4'>
      <PageTitle title='Profile' />
      <div className='space-y-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Profile</h1>
        <p className='text-gray-600'>Profile page content goes here...</p>
      </div>
    </section>
  );
}
