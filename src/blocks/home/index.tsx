'use client';

import * as React from 'react';

import CompactTargetTable from '@/blocks/home/compact-target-table';
import CustomerSection from '@/blocks/home/customer-section';
import KonsumenCard from '@/blocks/home/konsumen-card';
import MetricCards from '@/blocks/home/metric-cards';
import { PropertiSection } from '@/blocks/home/progress-sections';
import RealisasiCard from '@/blocks/home/realisasi-card';
import RingkasanCard from '@/blocks/home/ringkasan-card';
import TopSalesCard from '@/blocks/home/top-sales-card';
import TotalOmzetCard from '@/blocks/home/total-omzet-card';
import UnitMetrics from '@/blocks/home/unit-metrics';
import { PageTitle } from '@/components/page-title';
import { Card, CardContent } from '@/components/ui/card';
import {
  useDashboardFollowUpToday,
  useDashboardFollowUpTomorrow,
  useDashboardKonsumenByProspek,
  useDashboardNewKonsumens,
  useDashboardSalesOverview,
  useDashboardTransaksiByProperti
} from '@/services/dashboard';

import { RealisasiComponent } from '../analisa/realisasi';

const HomePage = React.memo(() => {
  // Fetch all dashboard data using the new hooks
  const { data: followUpTodayData, isLoading: isLoadingFollowUpToday } = useDashboardFollowUpToday();
  const { data: followUpTomorrowData, isLoading: isLoadingFollowUpTomorrow } = useDashboardFollowUpTomorrow();
  const { data: newKonsumensData, isLoading: isLoadingNewKonsumens } = useDashboardNewKonsumens();
  const { data: konsumenByProspekData, isLoading: isLoadingKonsumenByProspek } = useDashboardKonsumenByProspek();
  const { data: salesOverviewData, isLoading: isLoadingSalesOverview } = useDashboardSalesOverview();
  const { data: transaksiByPropertiData, isLoading: isLoadingTransaksiByProperti } = useDashboardTransaksiByProperti();

  // Pass dashboard data to components via props
  const dashboardProps = {
    followUpToday: followUpTodayData,
    followUpTomorrow: followUpTomorrowData,
    newKonsumens: newKonsumensData,
    konsumenByProspek: konsumenByProspekData,
    salesOverview: salesOverviewData,
    transaksiByProperti: transaksiByPropertiData,
    isLoading: {
      followUpToday: isLoadingFollowUpToday,
      followUpTomorrow: isLoadingFollowUpTomorrow,
      newKonsumens: isLoadingNewKonsumens,
      konsumenByProspek: isLoadingKonsumenByProspek,
      salesOverview: isLoadingSalesOverview,
      transaksiByProperti: isLoadingTransaksiByProperti
    }
  };

  return (
    <div className='min-h-screen space-y-4 bg-gray-50 p-4 md:p-6 lg:p-8'>
      <PageTitle title='Dashboard' />

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
                <RealisasiComponent />
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
            <div className='mt-4'>
              <Card className='border-gray-200 shadow-sm'>
                <CardContent className='p-4'>
                  <UnitMetrics dashboardData={dashboardProps} />
                </CardContent>
              </Card>
            </div>
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
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
