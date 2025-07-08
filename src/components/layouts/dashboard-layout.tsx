'use client';

import type React from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { DashboardHeader } from './dashboard-header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex-1 bg-gray-50' suppressHydrationWarning>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='grid h-screen grid-rows-[64px_calc(100vh-64px)]'>
          <DashboardHeader />
          <ScrollArea className='flex flex-1 flex-col gap-4 p-2 pt-0 lg:p-6'>{children}</ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
