'use client';

import { useState } from 'react';

import { AreaChartComponent } from '@/blocks/analisa/area-chart';
// import { BarChartComponent } from '@/blocks/analisa/bar-chart';
import { CustomerListComponent } from '@/blocks/analisa/customer-list';
// import { DiagramPenjualanComponent } from '@/blocks/analisa/diagram-penjualan';
import { AnalysisMetricCards } from '@/blocks/analisa/metric-cards';
import { OrderChartComponent } from '@/blocks/analisa/order-chart';
import { RealisasiComponent } from '@/blocks/analisa/realisasi';
import { RingkasanPenjualanComponent } from '@/blocks/analisa/ringkasan-penjualan';
import { MemberFilterModal } from '@/blocks/home/member-filter-modal';
import { PageTitle } from '@/components/page-title';
// import { TotalOmzetComponent } from '@/blocks/analisa/total-omzet';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/services/auth';

import { Filter, X } from 'lucide-react';

export const AnalisaContent = () => {
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

  // Prepare filter parameters
  const filterParams = selectedMemberId ? { created_id: selectedMemberId } : {};

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
    <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
      <PageTitle title='Analisa' />

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

      {/* Metric Cards and Bar Chart */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12'>
          <AnalysisMetricCards filterParams={filterParams} />
        </div>
        <div className='col-span-7'>{/* <BarChartComponent /> */}</div>
      </div>

      {/* Area Charts */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-6'>
          <AreaChartComponent filterParams={filterParams} />
        </div>
        <div className='col-span-12 lg:col-span-6'>
          <OrderChartComponent filterParams={filterParams} />
        </div>
      </div>

      {/* Customer List */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-6'>
          <CustomerListComponent filterParams={filterParams} />
        </div>
        <div className='col-span-12 lg:col-span-6'>
          <RealisasiComponent filterParams={filterParams} />
        </div>
      </div>

      {/* Realisasi, Ringkasan Penjualan, and Diagram Penjualan */}
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12'>
          <RingkasanPenjualanComponent filterParams={filterParams} />
        </div>
        <div className='col-span-12 lg:col-span-6'>{/* <DiagramPenjualanComponent /> */}</div>
      </div>

      {/* Member Filter Modal */}
      <MemberFilterModal
        open={showMemberFilter}
        onOpenChange={setShowMemberFilter}
        onSelectMember={handleSelectMember}
      />
    </div>
  );
};
