'use client';

import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useDashboardTop3Leaderboard } from '@/services/leaderboard';
import { ComponentWithDashboardProps } from '@/types/dashboard';
import { Top3LeaderboardItem } from '@/types/leaderboard';

import { ArrowRight, Loader2, User } from 'lucide-react';

export default function TopSalesCard({ dashboardData }: ComponentWithDashboardProps) {
  const router = useRouter();

  // Get filter parameters from dashboard data context
  const filterParams = dashboardData?.filterParams || {};

  // Fetch top 3 leaderboard data using dashboard-specific hook
  const { data: top3Data, isLoading, error } = useDashboardTop3Leaderboard(filterParams);

  const handleViewAll = () => {
    router.push('/leaderboard');
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const formatPercentage = (percentage: number): string => {
    return `${Math.round(percentage)}%`;
  };

  if (isLoading) {
    return (
      <div className='w-full'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>Top Sales</h2>
          <ArrowRight className='h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600' />
        </div>

        {/* Loading skeleton */}
        <div className='space-y-4'>
          {[1, 2, 3].map((index) => (
            <div key={index} className={`py-4 ${index !== 3 ? 'border-b border-gray-200' : ''}`}>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                    <div className='h-8 w-8 animate-pulse rounded-full bg-gray-300 sm:h-10 sm:w-10'></div>
                    <div className='h-4 w-24 animate-pulse rounded bg-gray-300'></div>
                  </div>
                  <div className='h-6 w-16 animate-pulse rounded-full bg-gray-300'></div>
                </div>

                <div className='grid grid-cols-3 gap-3'>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className='text-center'>
                      <div className='mx-auto mb-1 h-4 w-12 animate-pulse rounded bg-gray-300'></div>
                      <div className='mx-auto h-3 w-16 animate-pulse rounded bg-gray-300'></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>Top Sales</h2>
          <ArrowRight className='h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600' />
        </div>

        {/* Error state */}
        <div className='py-8 text-center'>
          <div className='text-sm text-gray-500'>Terjadi kesalahan saat memuat data top sales</div>
        </div>
      </div>
    );
  }

  // Use API data or fallback to empty array
  const salesData: Top3LeaderboardItem[] = top3Data || [];

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>Top Sales</h2>
        <ArrowRight className='h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600' onClick={handleViewAll} />
      </div>

      {/* Sales Representatives */}
      <div className='space-y-4'>
        {salesData.length > 0 ? (
          salesData.map((sales, index) => (
            <div
              key={sales.sales_id}
              className={`py-4 ${index !== salesData.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                    <Avatar className='h-8 w-8 flex-shrink-0 bg-gray-300 sm:h-10 sm:w-10'>
                      <AvatarFallback className='bg-gray-300'>
                        <User className='h-4 w-4 text-gray-500 sm:h-5 sm:w-5' />
                      </AvatarFallback>
                    </Avatar>
                    <span className='truncate text-sm font-medium text-gray-900'>{sales.sales_name}</span>
                  </div>
                  <div className='rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-500'>
                    {sales.total_leads} Leads
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-3'>
                  <div className='text-center'>
                    <div className='text-base font-bold text-gray-900'>{formatPercentage(sales.target_percentage)}</div>
                    <div className='text-xs tracking-wide text-gray-500 uppercase'>TARGET</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-base font-bold text-gray-900'>{sales.total_goal}</div>
                    <div className='text-xs tracking-wide text-gray-500 uppercase'>UNIT TERJUAL</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-base font-bold text-gray-900'>Rp {formatCurrency(sales.total_revenue)}</div>
                    <div className='text-xs tracking-wide text-gray-500 uppercase'>REVENUE</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='py-8 text-center'>
            <div className='text-sm text-gray-500'>Tidak ada data top sales untuk ditampilkan</div>
          </div>
        )}
      </div>
    </div>
  );
}
