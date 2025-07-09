'use client';

import * as React from 'react';

import { RingkasanSection } from '@/blocks/home/chart-sections';
import CustomerSection from '@/blocks/home/customer-section';
import KonsumenDonutChart from '@/blocks/home/konsumen_card';
import MetricCards from '@/blocks/home/metric-cards';
import { PropertiSection } from '@/blocks/home/progress-sections';
import RealisasiChart from '@/blocks/home/realisasi_card';
import CandlestickChart from '@/blocks/home/total_omzet_card';
import { PageTitle } from '@/components/page-title';
import { Card, CardContent } from '@/components/ui/card';

const HomePage = React.memo(() => {
  return (
    <div className='min-h-screen space-y-8 bg-gray-50 p-6'>
      <PageTitle title='Dashboard' />

      <MetricCards />

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <Card className='border-gray-200 shadow-sm'>
          <CardContent className='pt-6'>
            <CandlestickChart />
          </CardContent>
        </Card>

        <Card className='border-gray-200 shadow-sm'>
          <CardContent className='pt-6'>
            <KonsumenDonutChart />
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-12 gap-8'>
        <div className='col-span-12 lg:col-span-4'>
          <Card className='border-gray-200 shadow-sm'>
            <CardContent className='p-0'>
              <RealisasiChart />
            </CardContent>
          </Card>
        </div>

        <div className='col-span-12 lg:col-span-8'>
          <PropertiSection />
        </div>
      </div>

      <div className='grid grid-cols-1'>
        <RingkasanSection />
      </div>

      <CustomerSection />
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
