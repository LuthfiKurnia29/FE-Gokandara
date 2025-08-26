import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ComponentWithDashboardProps } from '@/types/dashboard';

import { ArrowRight, User } from 'lucide-react';

export default function TopSalesCard({ dashboardData }: ComponentWithDashboardProps) {
  const salesData = [
    { name: 'Nama Sales', leads: 23, target: '100%', units: 8, revenue: '16,5M' },
    { name: 'Nama Sales', leads: 23, target: '100%', units: 8, revenue: '16,5M' },
    { name: 'Nama Sales', leads: 23, target: '100%', units: 8, revenue: '16,5M' }
  ];

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>Top Sales</h2>
        <ArrowRight className='h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600' />
      </div>

      {/* Sales Representatives */}
      <div className='space-y-4'>
        {salesData.map((sales, index) => (
          <div key={index} className={`py-4 ${index !== salesData.length - 1 ? 'border-b border-gray-200' : ''}`}>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                  <Avatar className='h-8 w-8 flex-shrink-0 bg-gray-300 sm:h-10 sm:w-10'>
                    <AvatarFallback className='bg-gray-300'>
                      <User className='h-4 w-4 text-gray-500 sm:h-5 sm:w-5' />
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium text-gray-900'>{sales.name}</span>
                </div>
                <div className='rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-500'>
                  {sales.leads} Leads
                </div>
              </div>

              <div className='grid grid-cols-3 gap-3'>
                <div className='text-center'>
                  <div className='text-base font-bold text-gray-900'>{sales.target}</div>
                  <div className='text-xs tracking-wide text-gray-500 uppercase'>TARGET</div>
                </div>
                <div className='text-center'>
                  <div className='text-base font-bold text-gray-900'>{sales.units}</div>
                  <div className='text-xs tracking-wide text-gray-500 uppercase'>UNIT TERJUAL</div>
                </div>
                <div className='text-center'>
                  <div className='text-base font-bold text-gray-900'>{sales.revenue}</div>
                  <div className='text-xs tracking-wide text-gray-500 uppercase'>REVENUE</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
