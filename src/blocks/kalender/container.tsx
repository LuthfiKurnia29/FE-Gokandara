'use client';

import { memo } from 'react';

import { ClientContainer } from '@/calendar/components/client-container';
import { useCalendar } from '@/calendar/contexts/calendar-context';

const KalenderContainer = memo(function KalenderContainer() {
  const { view } = useCalendar();
  return <ClientContainer view={view} />;
});

export default KalenderContainer;
