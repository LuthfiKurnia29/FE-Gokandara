'use client';

import * as React from 'react';

import CandlestickChart from '@/blocks/home/candlestick-chart';
import { KonsumenChart, RingkasanSection } from '@/blocks/home/chart-sections';
import CustomerSection from '@/blocks/home/customer-section';
import MetricCards from '@/blocks/home/metric-cards';
import { PropertiSection, RealisasiSection } from '@/blocks/home/progress-sections';
import { PageTitle } from '@/components/page-title';
import { Card, CardContent } from '@/components/ui/card';

const HomePage = React.memo(() => {
  return (
    <div className='min-h-screen space-y-8 bg-gray-50 p-6'>
      <PageTitle title='Dashboard' />

      <MetricCards />

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Card className='border-gray-200 shadow-sm'>
            <CardContent className='pt-6'>
              <CandlestickChart />
            </CardContent>
          </Card>
        </div>

        <KonsumenChart />
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <RealisasiSection />

        <PropertiSection />

        <RingkasanSection />
      </div>

      <CustomerSection />
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
