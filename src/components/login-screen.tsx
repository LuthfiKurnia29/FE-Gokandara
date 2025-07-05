'use client';

import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Eye, EyeOff, Lock, User } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            onLogin();
        }
    };

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
            <div className='flex-1 rounded-t-[2rem] bg-white px-6 pt-12 pb-8'>
                <h1 className='mb-16 text-center text-3xl font-semibold text-[#353430]'>Welcome</h1>

                <form onSubmit={handleSubmit} className='space-y-8'>
                    {/* Username Field */}
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-4 flex items-center text-gray-400'>
                            <User size={20} className='translate-y-[1px]' />
                        </div>
                        <Input
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='h-16 w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-4 pl-12 text-lg text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#DAA961]'
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-4 flex items-center text-gray-400'>
                            <Lock size={20} className='translate-y-[1px]' />
                        </div>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='h-16 w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-12 pl-12 text-lg text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#DAA961]'
                            required
                        />
                        <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                            {showPassword ? (
                                <EyeOff size={20} className='translate-y-[1px]' />
                            ) : (
                                <Eye size={20} className='translate-y-[1px]' />
                            )}
                        </button>
                    </div>

                    {/* Login Button */}
                    <div className='pt-8'>
                        <Button
                            type='submit'
                            className='h-16 w-full rounded-2xl bg-[#DAA961] text-xl font-semibold text-white shadow-lg transition-colors hover:bg-[#c49654]'>
                            Masuk
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
