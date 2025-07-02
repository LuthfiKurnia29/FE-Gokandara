'use client';

import { useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { Dashboard } from '@/components/dashboard';
import { LoginScreen } from '@/components/login-screen';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <div className='flex min-h-screen justify-center bg-gray-200'>
            <div className='relative mx-auto w-full max-w-md overflow-hidden bg-white shadow-2xl'>
                {!isLoggedIn ? (
                    <LoginScreen onLogin={handleLogin} />
                ) : (
                    <SidebarProvider>
                        <AppSidebar onLogout={handleLogout} />
                        <Dashboard onLogout={handleLogout} />
                    </SidebarProvider>
                )}
            </div>
        </div>
    );
}
