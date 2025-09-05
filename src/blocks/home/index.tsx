'use client';

import * as React from 'react';
import { useState } from 'react';

import CompactTargetTable from '@/blocks/home/compact-target-table';
import CustomerSection from '@/blocks/home/customer-section';
import KonsumenCard from '@/blocks/home/konsumen-card';
import { MemberFilterModal } from '@/blocks/home/member-filter-modal';
import MetricCards from '@/blocks/home/metric-cards';
import { PropertiSection } from '@/blocks/home/progress-sections';
import RealisasiCard from '@/blocks/home/realisasi-card';
import RingkasanCard from '@/blocks/home/ringkasan-card';
import TopSalesCard from '@/blocks/home/top-sales-card';
import TotalOmzetCard from '@/blocks/home/total-omzet-card';
// import UnitMetrics from '@/blocks/home/unit-metrics';
import { PageTitle } from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/services/auth';
import {
  useDashboardFollowUpToday,
  useDashboardFollowUpTomorrow,
  useDashboardKonsumenByProspek,
  useDashboardNewKonsumens,
  useDashboardSalesOverview,
  useDashboardTransaksiByProperti
} from '@/services/dashboard';
import { useDashboardTop3Leaderboard } from '@/services/leaderboard';

import { RealisasiComponent } from '../analisa/realisasi';
import { Filter, X } from 'lucide-react';

const HomePage = React.memo(() => {
  const [showMemberFilter, setShowMemberFilter] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const { getUserData } = usePermissions();

  // Get current user data for role checking
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;

  // Check if user can see filter button (Admin and Supervisor only)
  const canSeeFilterButton = () => {
    return (
      userRole === 'Administrator' ||
      userRole === 'Admin' ||
      userRole === 'Supervisor' ||
      userRoleId === 1 ||
      userRoleId === 2
    );
  };

  // Prepare filter parameters based on user role
  const getFilterParams = () => {
    // If user is Admin/Supervisor and has selected a member filter, use that
    if (canSeeFilterButton() && selectedMemberId) {
      return { created_id: selectedMemberId };
    }

    // If user is Sales/Mitra/Telemarketing, automatically filter by their own data
    if (
      userRole === 'Sales' ||
      userRole === 'Mitra' ||
      userRole === 'Telemarketing' ||
      userRoleId === 3 ||
      userRoleId === 4
    ) {
      const userId = userData?.user?.id;
      return userId ? { created_id: userId } : {};
    }

    // If user is Admin/Supervisor and no filter selected, show all data
    return {};
  };

  const filterParams = getFilterParams();

  // Fetch all dashboard data using the new hooks with filter parameters
  const { data: followUpTodayData, isLoading: isLoadingFollowUpToday } = useDashboardFollowUpToday(filterParams);
  const { data: followUpTomorrowData, isLoading: isLoadingFollowUpTomorrow } =
    useDashboardFollowUpTomorrow(filterParams);
  const { data: newKonsumensData, isLoading: isLoadingNewKonsumens } = useDashboardNewKonsumens(filterParams);
  const { data: konsumenByProspekData, isLoading: isLoadingKonsumenByProspek } =
    useDashboardKonsumenByProspek(filterParams);
  const { data: salesOverviewData, isLoading: isLoadingSalesOverview } = useDashboardSalesOverview(filterParams);
  const { data: transaksiByPropertiData, isLoading: isLoadingTransaksiByProperti } =
    useDashboardTransaksiByProperti(filterParams);
  const { isLoading: isLoadingTopSales } = useDashboardTop3Leaderboard(filterParams);

  // Pass dashboard data to components via props
  const dashboardProps = {
    followUpToday: followUpTodayData,
    followUpTomorrow: followUpTomorrowData,
    newKonsumens: newKonsumensData,
    konsumenByProspek: konsumenByProspekData,
    salesOverview: salesOverviewData,
    transaksiByProperti: transaksiByPropertiData,
    filterParams,
    isLoading: {
      followUpToday: isLoadingFollowUpToday,
      followUpTomorrow: isLoadingFollowUpTomorrow,
      newKonsumens: isLoadingNewKonsumens,
      konsumenByProspek: isLoadingKonsumenByProspek,
      salesOverview: isLoadingSalesOverview,
      transaksiByProperti: isLoadingTransaksiByProperti,
      topSales: isLoadingTopSales
    }
  };

  // Handle member filter selection
  const handleSelectMember = (userId: number, userName: string) => {
    setSelectedMemberId(userId);
    setSelectedMemberName(userName);
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setSelectedMemberId(null);
    setSelectedMemberName('');
  };

  return (
    <div className='min-h-screen space-y-4 bg-gray-50 p-4 md:p-6 lg:p-8'>
      <PageTitle title='Dashboard' />

      {/* Member Filter Section - Only show for Admin and Supervisor */}
      {canSeeFilterButton() && (
        <div className='flex flex-wrap items-center gap-2'>
          {selectedMemberId && (
            <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-3 py-1'>
              <span className='text-sm font-medium'>Filter: {selectedMemberName}</span>
              <Button variant='ghost' size='sm' onClick={handleClearFilter} className='hover:bg-primary/20 h-6 w-6 p-0'>
                <X className='h-3 w-3' />
              </Button>
            </div>
          )}
          <Button variant='outline' onClick={() => setShowMemberFilter(true)} className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            Filter Berdasarkan Member
          </Button>
        </div>
      )}

      <MetricCards dashboardData={dashboardProps} />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* <Card className='border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md'>
          <CardContent className='pt-6'>
            <TotalOmzetCard />
          </CardContent>
        </Card> */}

        <Card className='border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md'>
          <CardContent className='pt-6'>
            <KonsumenCard dashboardData={dashboardProps} />
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
        {/* Target Table - Full width above other sections */}
        <div className='lg:col-span-12'>
          <Card className='border-gray-200 shadow-sm'>
            <CardContent className='p-4'>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>Target Management</h3>
                <p className='text-sm text-gray-600'>Daftar target penjualan untuk setiap role</p>
              </div>
              <CompactTargetTable dashboardData={dashboardProps} />
            </CardContent>
          </Card>
        </div>

        {/* Left Column - Realisasi and Customer Section */}
        <div className='lg:col-span-5 xl:col-span-4'>
          <div className='space-y-4'>
            <Card className='border-gray-200 shadow-sm'>
              <CardContent className='p-0'>
                <RealisasiComponent filterParams={filterParams} />
              </CardContent>
            </Card>
            {/* <Card className='border-gray-200 shadow-sm'>
              <CardContent className='p-4'>
                <CustomerSection dashboardData={dashboardProps} />
              </CardContent>
            </Card> */}

            <Card className='border-gray-200 shadow-sm'>
              <CardContent className='p-4'>
                <TopSalesCard dashboardData={dashboardProps} />
              </CardContent>
            </Card>
{/*             <div className='mt-4'>
              <Card className='border-gray-200 shadow-sm'>
                <CardContent className='p-4'>
                  <UnitMetrics dashboardData={dashboardProps} />
                </CardContent>
              </Card>
            </div> */}
          </div>
        </div>

        {/* Right Column - Properti Section and other components */}
        <div className='lg:col-span-7 xl:col-span-8'>
          <div className='space-y-4'>
            <PropertiSection dashboardData={dashboardProps} />
            <RingkasanCard dashboardData={dashboardProps} />
          </div>
        </div>
      </div>

      {/* Member Filter Modal */}
      <MemberFilterModal
        open={showMemberFilter}
        onOpenChange={setShowMemberFilter}
        onSelectMember={handleSelectMember}
      />
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
