'use client';

import { memo, useEffect, useState } from 'react';

import { useIdleTimer } from '@/hooks/use-idle-timer';
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

  const handleIdleLogout = () => {
    handleLogout();
    setTimeout(() => {
      toast.error('Anda telah logout otomatis karena tidak ada aktivitas selama 1 jam');
    }, 500);
  };

  // Initialize idle timer - 1 hour = 3600000 milliseconds
  // Only run idle timer when user is logged in
  // For development/testing, you can change timeout to a smaller value like 10000 (10 seconds)
  const { isIdle, pause, resume, getRemainingTime } = useIdleTimer({
    timeout: 3600000, // 1 hour (3600000ms)
    onIdle: handleIdleLogout,
    onActive: () => {
      // Reset any idle state if needed
      if (process.env.NODE_ENV === 'development') {
        console.log('User activity detected, idle timer reset');
      }
    }
  });

  // Development helper to log remaining time
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isLoggedIn && isClient) {
      const interval = setInterval(() => {
        const remaining = getRemainingTime();
        if (remaining > 0) {
          console.log(`Idle timer: ${Math.round(remaining / 1000)}s remaining`);
        }
      }, 30000); // Log every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isClient, getRemainingTime]);

  // Pause/resume idle timer based on login status
  useEffect(() => {
    if (isLoggedIn && isClient) {
      resume();
    } else {
      pause();
    }
  }, [isLoggedIn, isClient, pause, resume]);

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
