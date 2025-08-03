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
    <div className='min-h-screen space-y-4 bg-gray-50 p-4 md:p-6 lg:p-8'>
      <PageTitle title='Dashboard' />

      <MetricCards />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md'>
          <CardContent className='pt-6'>
            <TotalOmzetCard />
          </CardContent>
        </Card>

        <Card className='border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md'>
          <CardContent className='pt-6'>
            <KonsumenCard />
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
        <div className='lg:col-span-4 xl:col-span-3'>
          <div className='space-y-4'>
            <Card className='border-gray-200 shadow-sm'>
              <CardContent className='p-0'>
                <RealisasiCard />
              </CardContent>
            </Card>
            <Card className='border-gray-200 shadow-sm'>
              <CardContent className='p-4'>
                <CustomerSection />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className='lg:col-span-8 xl:col-span-9'>
          <div className='space-y-4'>
            <PropertiSection />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
              <div className='md:col-span-12 xl:col-span-9'>
                <RingkasanCard />
              </div>
              <div className='md:col-span-12 xl:col-span-3'>
                <Card className='border-gray-200 shadow-sm'>
                  <CardContent className='p-4'>
                    <UnitMetrics />
                  </CardContent>
                </Card>
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
