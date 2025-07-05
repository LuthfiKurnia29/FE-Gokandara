'use client';

import { useState } from 'react';

import { AppSidebar } from '../app-sidebar';
import { LoginScreen } from '../login-screen';
import { SidebarProvider } from '../ui/sidebar';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <SidebarProvider>
            <AppSidebar onLogout={handleLogout} />
            {children}
        </SidebarProvider>
    );
}
