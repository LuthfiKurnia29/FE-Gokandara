'use client';

import { AreaChartComponent } from '@/blocks/analisa/area-chart';
import { BarChartComponent } from '@/blocks/analisa/bar-chart';
import { CustomerListComponent } from '@/blocks/analisa/customer-list';
import { AnalysisMetricCards } from '@/blocks/analisa/metric-cards';
import { OrderChartComponent } from '@/blocks/analisa/order-chart';
import { TotalOmzetComponent } from '@/blocks/analisa/total-omzet';
import { PageTitle } from '@/components/page-title';

export const AnalisaContent = () => {
  return (
    <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
      <PageTitle title='Analisa' />

      {/* Metric Cards and Bar Chart */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-5'>
          <AnalysisMetricCards />
        </div>
        <div className='col-span-7'>
          <BarChartComponent />
        </div>
      </div>

      {/* Area Charts */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-6'>
          <AreaChartComponent />
        </div>
        <div className='col-span-6'>
          <OrderChartComponent />
        </div>
      </div>

      {/* Customer List and Total Omzet */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-3'>
          <CustomerListComponent />
        </div>
        <div className='col-span-9'>
          <TotalOmzetComponent />
        </div>
      </div>
    </div>
  );
};
