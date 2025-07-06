'use client';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

import { DollarSign, Home, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
    const { toggleSidebar } = useSidebar();
    const onLogout = () => {
        toggleSidebar();
    };

    const stats = [
        {
            title: 'Omzet',
            value: 'Rp.12.000.000.000',
            icon: DollarSign
        },
        {
            title: 'Unit Terjual',
            value: '8',
            icon: Home
        },
        {
            title: 'Total Prospek',
            value: '483',
            icon: Users
        },
        {
            title: 'Prospek Baru',
            value: '23',
            icon: Users
        },
        {
            title: 'Follow Up Hari Ini',
            value: '31',
            icon: TrendingUp
        },
        {
            title: 'Follow Up Besok',
            value: '19',
            icon: TrendingUp
        }
    ];

    const realisasiData = [
        {
            title: 'Unit Terjual',
            percentage: 50,
            current: 1,
            target: 2,
            color: 'text-red-500',
            indicator: '↓ 50%'
        },
        {
            title: 'Hari Ini (58%)',
            percentage: 58,
            current: 18,
            target: 31,
            color: 'text-red-500',
            indicator: '↓ 36%'
        },
        {
            title: 'Minggu Ini (44%)',
            percentage: 44,
            current: 204,
            target: 465,
            color: 'text-green-500',
            indicator: '↑ 44%'
        },
        {
            title: 'Bulan Ini (50%)',
            percentage: 50,
            current: 204,
            target: 407,
            color: 'text-green-500',
            indicator: '↑ 50%'
        }
    ];

    return (
        <main>
            {/* Dashboard Content */}
            <div className='space-y-6 p-4'>
                {/* Dashboard Title */}
                <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>

                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-4'>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className='relative min-h-[120px] overflow-hidden rounded-3xl bg-[#6b5b4a] p-4 text-white'>
                            <div className='mb-4 flex items-start justify-between'>
                                <h3 className='text-sm leading-tight font-medium opacity-90'>{stat.title}</h3>
                                <div className='flex-shrink-0 rounded-xl bg-[#DAA961] p-2'>
                                    <stat.icon size={16} className='text-[#353430]' />
                                </div>
                            </div>
                            <p className='text-2xl leading-tight font-bold'>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Realisasi Section */}
                <div className='rounded-3xl bg-white p-6 shadow-sm'>
                    <h2 className='mb-6 text-2xl font-bold text-gray-800'>Realisasi</h2>

                    <div className='space-y-6'>
                        {realisasiData.map((item, index) => (
                            <div key={index} className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-base font-medium text-gray-700'>{item.title}</span>
                                        <span className={`text-sm font-medium ${item.color}`}>{item.indicator}</span>
                                    </div>
                                    <span className='text-base font-medium text-gray-600'>
                                        {item.current}/{item.target}
                                    </span>
                                </div>
                                <div className='h-4 w-full rounded-full bg-gray-200'>
                                    <div
                                        className='h-4 rounded-full bg-[#DAA961] transition-all duration-300'
                                        style={{ width: `${item.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className='pt-4 pb-8'>
                    <Button
                        onClick={onLogout}
                        variant='outline'
                        className='h-14 w-full border-[#DAA961] bg-transparent text-lg font-medium text-[#353430] hover:bg-[#DAA961]/10'>
                        Keluar
                    </Button>
                </div>
            </div>
        </main>
    );
}
