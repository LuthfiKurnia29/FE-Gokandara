'use client';

import type React from 'react';
import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth';
import { type LoginFormData, loginSchema } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = memo(({ onLogin }: LoginScreenProps) => {
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (isClient) {
        authService.storeAuth(data.access_token, data.user);
        onLogin();
      }
    },
    onError: (error: any) => {
      if (isClient) {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        setError('root', {
          type: 'manual',
          message: errorMessage
        });
      }
    }
  });

  const handleFormSubmit = (data: LoginFormData) => {
    if (isClient) {
      loginMutation.mutate(data);
    }
  };

  const togglePasswordVisibility = () => {
    if (isClient) {
      setShowPassword(!showPassword);
    }
  };

  // Konsisten rendering antara SSR dan CSR
  if (!isClient) {
    return (
      <div className='flex min-h-screen w-full flex-col bg-[#353430]'>
        <div className='flex items-center justify-center pt-16 pb-12'>
          <div className='flex items-center gap-2 text-white'>
            <span className='text-3xl font-bold'>kandara</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen w-full flex-col bg-[#353430]'>
      {/* Logo */}
      <div className='flex items-center justify-center pt-16 pb-12'>
        <div className='flex items-center gap-2 text-white'>
          <span className='text-3xl font-bold'>kandara</span>
          <div className='h-6 w-6 rotate-45 transform bg-[#DAA961]'></div>
        </div>
      </div>

      {/* Login Form - Takes up most of the remaining space */}
      <div className='mx-auto w-full max-w-[640px] flex-1 rounded-t-[2rem] bg-white px-6 pt-12 pb-8'>
        <h1 className='mb-16 text-center text-3xl font-semibold text-[#353430]'>Welcome</h1>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-8'>
          {/* Root Error Display */}
          {errors.root && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
              {errors.root.message}
            </div>
          )}

          {/* Email Field */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-4 flex items-center text-gray-400'>
              <User size={20} className='translate-y-[1px]' />
            </div>
            <Input
              type='text'
              placeholder='Email'
              {...register('email')}
              className='h-16 w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-4 pl-12 text-lg text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#DAA961]'
            />
            {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-4 flex items-center text-gray-400'>
              <Lock size={20} className='translate-y-[1px]' />
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              {...register('password')}
              className='h-16 w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-12 pl-12 text-lg text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#DAA961]'
            />
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute inset-y-0 right-3 flex items-center text-gray-400'
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  togglePasswordVisibility();
                }
              }}>
              {showPassword ? (
                <EyeOff size={20} className='translate-y-[1px]' />
              ) : (
                <Eye size={20} className='translate-y-[1px]' />
              )}
            </button>
            {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>}
          </div>

          {/* Login Button */}
          <div className='pt-8'>
            <Button
              type='submit'
              disabled={loginMutation.isPending}
              className='h-16 w-full rounded-2xl bg-[#DAA961] text-xl font-semibold text-white shadow-lg transition-colors hover:bg-[#c49654] disabled:cursor-not-allowed disabled:opacity-50'>
              {loginMutation.isPending ? (
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  Signing in...
                </div>
              ) : (
                'Masuk'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});
