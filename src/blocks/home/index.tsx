'use client';

import * as React from 'react';

import CustomerSection from '@/blocks/home/customer-section';
import KonsumenCard from '@/blocks/home/konsumen-card';
import MetricCards from '@/blocks/home/metric-cards';
import { PropertiSection } from '@/blocks/home/progress-sections';
import RealisasiCard from '@/blocks/home/realisasi-card';
import RingkasanCard from '@/blocks/home/ringkasan-card';
import TotalOmzetCard from '@/blocks/home/total-omzet-card';
import UnitMetrics from '@/blocks/home/unit-metrics';
import { PageTitle } from '@/components/page-title';
import { Card, CardContent } from '@/components/ui/card';

const HomePage = React.memo(() => {
  return (
    <div className='min-h-screen space-y-4 bg-gray-50 p-4'>
      <PageTitle title='Dashboard' />

      <MetricCards />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='border-gray-200 shadow-sm'>
          <CardContent className='pt-6'>
            <TotalOmzetCard />
          </CardContent>
        </Card>

        <Card className='border-gray-200 shadow-sm'>
          <CardContent className='pt-6'>
            <KonsumenCard />
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-3'>
          <div className='max-w-[340px]'>
            <Card className='border-gray-200 shadow-sm'>
              <CardContent className='p-0'>
                <RealisasiCard />
              </CardContent>
            </Card>
            <div className='mt-4'>
              <CustomerSection />
            </div>
          </div>
        </div>

        <div className='col-span-12 lg:col-span-9'>
          <div className='w-full'>
            <PropertiSection />
            <div className='mt-4 grid grid-cols-12 gap-3'>
              <div className='col-span-9'>
                <RingkasanCard />
              </div>
              <div className='col-span-3'>
                <UnitMetrics />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
