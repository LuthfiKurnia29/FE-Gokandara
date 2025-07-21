'use client';

import { memo, useEffect, useState } from 'react';

import { authService, useCurrentUser } from '@/services/auth';

import { LoginScreen } from '../login-screen';
import { Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

export const AuthProvider = memo(({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: currentUser, isFetching, isError } = useCurrentUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (currentUser?.user) {
        setIsLoggedIn(true);
        authService.storeUserData(currentUser);
      } else if (isError) {
        authService.logout();
        setIsLoggedIn(false);
      }
    }
  }, [currentUser, isError, isClient]);

  // Listen for token expiration events from axios interceptor
  useEffect(() => {
    const handleTokenExpiration = () => {
      handleLogout();
      setTimeout(() => {
        toast.error('Sesi Anda telah berakhir, silahkan login kembali');
      }, 2000);
    };

    if (isClient) {
      window.addEventListener('auth:unauthorized', handleTokenExpiration);

      return () => {
        window.removeEventListener('auth:unauthorized', handleTokenExpiration);
      };
    }
  }, [isClient]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (isClient) {
      authService.logout();
      setIsLoggedIn(false);
    }
  };

  // Minimal, konsisten loading state
  if (!isClient || isFetching) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#353430]'>
        <div className='flex flex-col items-center justify-center gap-4 text-white'>
          <Loader2 className='h-12 w-12 animate-spin text-white' />
          <span className='text-xl font-medium'>Loading Kandara...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <ToastContainer />
      </>
    );
  }

  return <>{children}</>;
});
