'use client';

import { useState } from 'react';

import { AreaChartComponent } from '@/blocks/analisa/area-chart';
// import { BarChartComponent } from '@/blocks/analisa/bar-chart';
import { CustomerListComponent } from '@/blocks/analisa/customer-list';
// import { DiagramPenjualanComponent } from '@/blocks/analisa/diagram-penjualan';
import { FilterModal, FilterValues } from '@/blocks/analisa/filter-modal';
import { AnalysisMetricCards } from '@/blocks/analisa/metric-cards';
import { OrderChartComponent } from '@/blocks/analisa/order-chart';
import { RealisasiComponent } from '@/blocks/analisa/realisasi';
import { RingkasanPenjualanComponent } from '@/blocks/analisa/ringkasan-penjualan';
import { MemberFilterModal } from '@/blocks/home/member-filter-modal';
import { PageTitle } from '@/components/page-title';
// import { TotalOmzetComponent } from '@/blocks/analisa/total-omzet';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/services/auth';
import { getAllProspek } from '@/services/prospek';
import { ProspekData } from '@/types/prospek';
import { useQuery } from '@tanstack/react-query';

import { Filter, X } from 'lucide-react';
import moment from 'moment';

export const AnalisaContent = () => {
  const [showMemberFilter, setShowMemberFilter] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const { getUserData } = usePermissions();

  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(moment().startOf('year').format('YYYY-MM-DD')),
    to: new Date(moment().endOf('year').format('YYYY-MM-DD'))
  });
  const [selectedProspekId, setSelectedProspekId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch prospek data for filter
  const { data: prospekData = [] } = useQuery<ProspekData[]>({
    queryKey: ['/prospek'],
    queryFn: () => getAllProspek()
  });

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

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Prepare filter parameters based on user role and selected filters
  const getFilterParams = () => {
    const baseParams: any = {};

    // Add date range filters
    if (dateRange.from) {
      baseParams.dateStart = formatDateForAPI(dateRange.from);
    }
    if (dateRange.to) {
      baseParams.dateEnd = formatDateForAPI(dateRange.to);
    }

    // Add prospek filter
    if (selectedProspekId) {
      baseParams.prospek_id = selectedProspekId;
    }

    // Add status filter
    if (selectedStatus) {
      baseParams.status = selectedStatus;
    }

    // If user is Admin/Supervisor and has selected a member filter, use that
    if (canSeeFilterButton() && selectedMemberId) {
      baseParams.created_id = selectedMemberId;
    }
    // If user is Sales/Mitra/Telemarketing, automatically filter by their own data
    else if (
      userRole === 'Sales' ||
      userRole === 'Mitra' ||
      userRole === 'Telemarketing' ||
      userRoleId === 3 ||
      userRoleId === 4
    ) {
      const userId = userData?.user?.id;
      if (userId) {
        baseParams.created_id = userId;
      }
    }

    return baseParams;
  };

  const filterParams = getFilterParams();

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

  // Handle apply filters from modal
  const handleApplyFilters = (filters: FilterValues) => {
    if (filters.dateRange) {
      setDateRange({
        from: filters.dateRange.from || new Date(moment().startOf('year').format('YYYY-MM-DD')),
        to: filters.dateRange.to || new Date(moment().endOf('year').format('YYYY-MM-DD'))
      });
    }
    setSelectedProspekId(filters.selectedProspekId);
    setSelectedStatus(filters.selectedStatus);
    setSelectedMemberId(filters.selectedMemberId);
    setSelectedMemberName(filters.selectedMemberName);
  };

  // Get current filter values for the modal
  const getCurrentFilters = (): FilterValues => ({
    dateRange: {
      from: dateRange.from,
      to: dateRange.to
    },
    selectedProspekId,
    selectedStatus,
    selectedMemberId,
    selectedMemberName
  });

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setDateRange({
      from: new Date(moment().startOf('year').format('YYYY-MM-DD')),
      to: new Date(moment().endOf('year').format('YYYY-MM-DD'))
    });
    setSelectedProspekId('');
    setSelectedStatus('');
    handleClearFilter();
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedProspekId ||
    selectedStatus ||
    selectedMemberId ||
    (dateRange.from && dateRange.from.getTime() !== new Date(moment().startOf('year').format('YYYY-MM-DD')).getTime()) ||
    (dateRange.to && dateRange.to.getTime() !== new Date(moment().endOf('year').format('YYYY-MM-DD')).getTime());

  return (
    <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
      <PageTitle title='Analisa' />

      {/* Filter Section */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Open Filter Modal Button */}
        <Button variant='outline' onClick={() => setShowFilterModal(true)} className='flex items-center gap-2'>
          <Filter className='h-4 w-4' />
          Filter Data
          {hasActiveFilters && (
            <span className='bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs'>
              Aktif
            </span>
          )}
        </Button>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <Button variant='ghost' size='sm' onClick={handleClearAllFilters} className='flex items-center gap-2'>
            <X className='h-4 w-4' />
            Clear All
          </Button>
        )}

        {/* Member Filter Button - Only show for Admin and Supervisor */}
        {canSeeFilterButton() && (
          <>
            {selectedMemberId && (
              <div className='bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-3 py-1'>
                <span className='text-sm font-medium'>Filter: {selectedMemberName}</span>
                <Button variant='ghost' size='sm' onClick={handleClearFilter} className='hover:bg-primary/20 h-6 w-6 p-0'>
                  <X className='h-3 w-3' />
                </Button>
              </div>
            )}
            {!selectedMemberId && (
              <Button variant='outline' onClick={() => setShowMemberFilter(true)} className='flex items-center gap-2'>
                <Filter className='h-4 w-4' />
                Filter Berdasarkan Member
              </Button>
            )}
          </>
        )}
      </div>

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

      {/* Filter Modal */}
      <FilterModal
        open={showFilterModal}
        onOpenChange={setShowFilterModal}
        onApplyFilters={handleApplyFilters}
        initialFilters={getCurrentFilters()}
        prospekData={prospekData}
      />

      {/* Member Filter Modal */}
      <MemberFilterModal
        open={showMemberFilter}
        onOpenChange={setShowMemberFilter}
        onSelectMember={handleSelectMember}
      />
    </div>
  );
};
