'use client';

import { memo, useEffect, useState } from 'react';

import { authService, useCurrentUser } from '@/services/auth';

import { LoginScreen } from '../login-screen';

export const AuthProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: currentUser, isFetching, isError, error } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.user) {
      setIsLoggedIn(true);
      // Store complete user data including roles and access
      authService.storeUserData(currentUser);
    } else if (isError) {
      // If there's an error fetching current user, clear stored auth data
      authService.logout();
      setIsLoggedIn(false);
    }
  }, [currentUser, isError]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  // Show loading state while checking authentication
  if (isFetching) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#353430]'>
        <div className='flex items-center gap-2 text-white'>
          <span className='text-3xl font-bold'>kandara</span>
          <div className='h-6 w-6 rotate-45 transform bg-[#DAA961]'></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <>{children}</>;
});
