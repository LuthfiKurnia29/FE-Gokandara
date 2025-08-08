'use client';

import { useParams } from 'next/navigation';

import PaymentHistoryPage from '@/blocks/transaksi/payment-history';

export default function TransaksiPaymentHistoryPage() {
  const params = useParams();
  const idParam = params.id as string;
  const transaksiId = Number(idParam);

  if (!transaksiId || Number.isNaN(transaksiId)) return null;

  return <PaymentHistoryPage transaksiId={transaksiId} />;
}
