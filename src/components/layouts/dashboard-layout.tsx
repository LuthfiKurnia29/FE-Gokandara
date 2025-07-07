'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../ui/breadcrumb';
import { Separator } from '../ui/separator';
import { DashboardHeader } from './dashboard-header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex-1 bg-gray-100'>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='grid h-screen grid-rows-[75px_calc(100vh-75px)]'>
          <DashboardHeader />
          <ScrollArea className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
