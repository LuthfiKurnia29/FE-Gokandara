'use client';

import { memo, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/services/auth';
import { getTipesByProjek } from '@/services/projek';
import { PropertyData } from '@/types/properti';
import { useQuery } from '@tanstack/react-query';

import { AddTransaksiModal } from '../transaksi/add-transaksi-modal';

interface PropertyPriceSectionProps {
  property?: PropertyData;
}

export const PropertyPriceSection = memo(({ property }: PropertyPriceSectionProps) => {
  const [open, setOpen] = useState(false);

  const { data: tipeData = [] } = useQuery({
    queryKey: ['/projek', property?.id, 'tipes'],
    queryFn: () => getTipesByProjek(property?.id || 0),
    enabled: !!property?.id
  });

  const selectedPrice = useMemo(() => {
    if (!tipeData || tipeData.length === 0) return null;

    const firstTipe = tipeData[0];
    return firstTipe?.harga || 0;
  }, [tipeData]);

  const selectedLastPrice = useMemo(() => {
    if (!tipeData || tipeData.length === 0 || tipeData.length === 1) return null;

    const firstTipe = tipeData[tipeData.length - 1];
    return firstTipe?.harga || 0;
  }, [tipeData]);

  const propertyPrice = selectedPrice ? `Rp ${selectedPrice.toLocaleString('id-ID')}` : 'Harga tidak tersedia';
  const propertyLastPrice = selectedLastPrice ? `Rp ${selectedLastPrice.toLocaleString('id-ID')}` : null;

  const handleOpenModal = () => {
    setOpen(true);
  };

  // Get current user to check role
  const { data: currentUser } = useCurrentUser();

  // Check if current user is Telemarketing
  const isTelemarketing = useMemo(() => {
    if (!currentUser?.roles) return false;
    // Check if user has Telemarketing role based on roles array
    return currentUser.roles.some(
      (userRole) => userRole.role.name.toLowerCase() === 'telemarketing' || userRole.role.code.toLowerCase() === 'tlm'
    );
  }, [currentUser]);

  return (
    <div className='mt-8 px-4'>
      <h2 className='mb-4 text-[20px] font-bold text-[#0C0C0C]'>Harga</h2>

      <div className='mb-4 rounded-lg bg-[#2563EB] p-6 text-center text-white'>
        <p className='mb-1 text-sm opacity-90'>Harga</p>
        <p className='mb-1 text-2xl font-bold'>{propertyPrice}</p>
        {Boolean(propertyLastPrice) && (
          <>
            <p className='mb-1 text-sm opacity-60'>s/d</p>
            <p className='mb-1 text-2xl font-bold'>{propertyLastPrice}</p>
          </>
        )}
      </div>
      {!isTelemarketing && (
        <Button
          onClick={handleOpenModal}
          className='h-12 w-full rounded-lg bg-[#FF8500] font-medium hover:bg-[#FF8500]/90'>
          Pemesanan
        </Button>
      )}

      <AddTransaksiModal open={open} onOpenChange={setOpen} />
    </div>
  );
});

PropertyPriceSection.displayName = 'PropertyPriceSection';
