'use client';

import { useSidebar } from '@/components/ui/sidebar';

import { BarChart3, FileText, Home, LogOut, Rocket, Settings, TrendingUp, Users } from 'lucide-react';

// Menu items
const items = [
    {
        title: 'Dashboard',
        url: '#',
        icon: BarChart3,
        isActive: true
    },
    {
        title: 'Project',
        url: '#',
        icon: Rocket
    },
    {
        title: 'Konsumen',
        url: '#',
        icon: Users
    },
    {
        title: 'Analisa',
        url: '#',
        icon: TrendingUp
    },
    {
        title: 'Laporan',
        url: '#',
        icon: FileText
    },
    {
        title: 'Pengajuan',
        url: '#',
        icon: Home
    },
    {
        title: 'Setting',
        url: '#',
        icon: Settings
    }
];

interface AppSidebarProps {
    onLogout: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
    const { open, setOpen } = useSidebar();

    return (
        <>
            {/* Overlay */}
            {open && <div className='fixed inset-0 z-40 bg-black/50' onClick={() => setOpen(false)} />}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 z-50 h-full bg-[#4a4a4a] text-white transition-transform duration-300 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{ width: '280px' }}>
                {/* Header with User Profile */}
                <div className='border-b border-gray-600 p-6'>
                    <div className='flex items-center gap-3'>
                        <div className='h-12 w-12 flex-shrink-0 rounded-full bg-gray-300'></div>
                        <span className='text-lg font-medium text-white'>Username</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className='flex-1 overflow-y-auto p-4'>
                    <div className='space-y-2'>
                        {items.map((item) => (
                            <a
                                key={item.title}
                                href={item.url}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                                    item.isActive
                                        ? 'bg-[#353430] text-white'
                                        : 'text-gray-300 hover:bg-[#353430] hover:text-white'
                                }`}
                                onClick={() => setOpen(false)}>
                                <item.icon size={20} />
                                <span className='text-base'>{item.title}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Footer with Logout */}
                <div className='border-t border-gray-600 p-4'>
                    <button
                        onClick={() => {
                            onLogout();
                            setOpen(false);
                        }}
                        className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-300 transition-colors hover:bg-[#353430] hover:text-white'>
                        <LogOut size={20} />
                        <span className='text-base'>Log out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
