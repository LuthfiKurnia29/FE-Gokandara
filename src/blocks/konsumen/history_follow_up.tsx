'use client';

import { memo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFollowUpHistoryByKonsumen } from '@/services/konsumen';
import { FollowUpHistoryItem } from '@/types/followUpHistory';
import { KonsumenData } from '@/types/konsumen';

import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react';

interface HistoryFollowUpProps {
  konsumen: KonsumenData | null;
  onClose: () => void;
}

export const HistoryFollowUp = memo(function HistoryFollowUp({ konsumen, onClose }: HistoryFollowUpProps) {
  if (!konsumen) return null;

  // Get follow-up history from API
  const { data: followUpHistoryData, isLoading, error } = useFollowUpHistoryByKonsumen(konsumen.id);

  // Transform API data to match component expectations
  const followUpHistory =
    followUpHistoryData?.data?.map((item: FollowUpHistoryItem) => ({
      id: item.id,
      tanggal: item.followup_date,
      materi: item.followup_note,
      status: item.status === 1 ? 'Completed' : item.status === 0 ? 'Scheduled' : 'Cancelled',
      catatan: item.followup_result
    })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>History Follow Up</h2>
            <p className='text-sm text-gray-600'>Riwayat follow up untuk konsumen</p>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className='flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-4'>
        <Card className='border-0 shadow-none'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-100'>
                <User className='h-6 w-6 text-orange-600' />
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-gray-900'>{konsumen.name}</h3>
                {(konsumen as any).status_delete === 1 ||
                (konsumen as any).status_delete === '1' ||
                (konsumen as any).status_delete === 'pending' ? (
                  <div className='mt-1'>
                    <Badge className='border border-amber-200 bg-amber-100 text-amber-800'>
                      Menunggu persetujuan hapus
                    </Badge>
                  </div>
                ) : null}
                <div className='mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2'>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    <span>{konsumen.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span className='truncate'>{konsumen.address}</span>
                  </div>
                </div>
                {konsumen.tgl_fu_1 && (
                  <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                    <Calendar className='h-4 w-4' />
                    <span>Next Follow Up: {formatDateTime(konsumen.tgl_fu_1)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List - Scrollable Area */}
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='px-6 py-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Riwayat Follow Up</h3>
            </div>

            {/* Loading State */}
            {Boolean(isLoading) ? (
              <Card className='border-dashed border-gray-300 bg-gray-50'>
                <CardContent className='flex flex-col items-center justify-center py-8'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent'></div>
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>Memuat riwayat follow up...</h3>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className='border-dashed border-red-300 bg-red-50'>
                <CardContent className='flex flex-col items-center justify-center py-8'>
                  <Clock className='h-12 w-12 text-red-400' />
                  <h3 className='mt-2 text-sm font-medium text-red-900'>Gagal memuat riwayat follow up</h3>
                  <p className='mt-1 text-sm text-red-500'>Silakan coba lagi nanti</p>
                </CardContent>
              </Card>
            ) : followUpHistory.length === 0 ? (
              <Card className='border-dashed border-gray-300 bg-gray-50'>
                <CardContent className='flex flex-col items-center justify-center py-8'>
                  <Clock className='h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>Belum ada history follow up</h3>
                  <p className='mt-1 text-sm text-gray-500'>Mulai dengan menambahkan follow up pertama</p>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-3 pb-6'>
                {followUpHistory.map(
                  (item: { id: number; tanggal: string; materi: string; status: string; catatan: string }) => (
                    <Card key={item.id} className='border border-gray-200 shadow-sm'>
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <h4 className='font-medium text-gray-900'>{item.materi}</h4>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                  item.status
                                )}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className='mt-1 flex items-center gap-2 text-sm text-gray-600'>
                              <Calendar className='h-4 w-4' />
                              <span>{formatDateTime(item.tanggal)}</span>
                            </div>
                            {item.catatan && <p className='mt-2 text-sm text-gray-600'>{item.catatan}</p>}
                          </div>
                          {/* <div className='ml-4 flex gap-2'>
                          <Button variant='outline' size='sm'>
                            Edit
                          </Button>
                          <Button variant='outline' size='sm' className='text-red-600 hover:text-red-700'>
                            Hapus
                          </Button>
                        </div> */}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
