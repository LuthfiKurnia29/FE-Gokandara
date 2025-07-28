import { memo } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { usePenjualanMetrics } from '@/services/penjualan';

import { ShieldCheck, ShoppingCart, Users } from 'lucide-react';

const MetricsSection = memo(function MetricsSection() {
  const { data: metrics, isLoading, error } = usePenjualanMetrics();

  const totalKonsumen = metrics?.totalKonsumen || 0;
  const totalTransaksi = metrics?.totalTransaksi || 0;

  return (
    <div className='mb-6 grid gap-4 lg:grid-cols-2'>
      {/* Information Card */}
      <Card className='border-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='rounded-full bg-white/20 p-3'>
              <ShieldCheck className='h-8 w-8' />
            </div>
            <div>
              <h3 className='text-lg font-bold'>INFORMASI</h3>
              <p className='text-sm opacity-90'>
                Kelola data transaksi penjualan properti dengan informasi konsumen, properti, dan status transaksi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className='grid grid-cols-2 gap-4'>
        <Card className='border border-gray-200 bg-gray-50 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold text-gray-900'>
                  {isLoading ? '...' : totalKonsumen.toLocaleString('id-ID')}
                </div>
                <div className='text-sm font-medium text-gray-600'>Total Konsumen</div>
              </div>
              <div className='rounded-full bg-gray-200 p-3'>
                <Users className='h-6 w-6 text-gray-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border border-gray-200 bg-gray-50 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold text-gray-900'>
                  {isLoading ? '...' : totalTransaksi.toLocaleString('id-ID')}
                </div>
                <div className='text-sm font-medium text-gray-600'>Total Transaksi</div>
              </div>
              <div className='rounded-full bg-gray-200 p-3'>
                <ShoppingCart className='h-6 w-6 text-gray-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default MetricsSection;
