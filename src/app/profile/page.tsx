import { memo } from 'react';

const ProfilePage = memo(() => {
  return (
    <main className='flex min-h-screen items-center justify-center bg-white'>
      <h1 className='text-2xl font-bold' tabIndex={0} aria-label='Profile Page'>
        Profile Page
      </h1>
    </main>
  );
});

export default ProfilePage;
