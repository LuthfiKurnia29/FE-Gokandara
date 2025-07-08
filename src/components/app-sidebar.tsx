'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type MenuItem, menuItems } from '@/stores/menu-item';

import { ScrollArea } from './ui/scroll-area';
import { ChevronRight } from 'lucide-react';

// Sidebar Menu Item Component
const SidebarMenuItemComponent = React.memo(({ item }: { item: MenuItem }) => {
  const pathname = usePathname();

  // Only render if item.url is defined
  if (!item.url) return null;

  // If item has children, render as dropdown
  if (item.children && item.children.length > 0) {
    return <SidebarMenuDropdown icon={item.icon} title={item.title} items={item.children} />;
  }

  // Otherwise render as regular menu item
  const IconComponent = item.icon;

  // Badge logic matching Figma design
  const getBadgeInfo = (title: string) => {
    switch (title) {
      case 'Transaksi':
        return { count: 27, color: 'bg-green-500' };
      case 'Pesan':
        return { count: 12, color: 'bg-orange-500' };
      default:
        return null;
    }
  };

  const badgeInfo = getBadgeInfo(item.title);
  const isActive = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        size='lg'
        tooltip={item.title}
        isActive={isActive}
        className={cn(
          'flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] leading-5 font-medium tracking-[-0.01em] transition-all duration-200',
          isActive ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white',
          'font-sf-pro min-h-[44px] w-full justify-start'
        )}>
        <Link href={item.url} className='flex w-full items-center gap-3'>
          {IconComponent && <IconComponent className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-400')} />}
          <span className='text-[14px] leading-5 font-medium tracking-[-0.01em]'>{item.title}</span>
          {badgeInfo && (
            <span
              className={cn(
                'ml-auto flex items-center justify-center rounded-full px-2 py-1 text-[11px] leading-3 font-bold text-white',
                badgeInfo.color,
                'min-h-[20px] min-w-[20px]'
              )}>
              {badgeInfo.count}
            </span>
          )}
          {item.children && item.children.length > 0 && (
            <ChevronRight className={cn('ml-auto h-4 w-4', isActive ? 'text-white' : 'text-gray-400')} />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

SidebarMenuItemComponent.displayName = 'SidebarMenuItemComponent';

// Sidebar Menu Dropdown Component
const SidebarMenuDropdown = React.memo(
  ({ icon, title, items }: { icon?: React.ElementType; title: string; items: MenuItem[] }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleToggleDropdown = () => {
      setIsOpen(!isOpen);
    };

    const isActive = items.some((item) => pathname.startsWith(item.url));

    const IconComponent = icon;

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          tooltip={title}
          onClick={handleToggleDropdown}
          className={cn(
            'font-sf-pro flex min-h-[44px] w-full items-center justify-between rounded-lg px-4 py-3 text-[14px] leading-5 font-medium tracking-[-0.01em] transition-all duration-200',
            isOpen || isActive
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
          )}>
          <div className='flex items-center gap-3'>
            {IconComponent && <IconComponent className='h-5 w-5' />}
            <span className='text-[14px] leading-5 font-medium tracking-[-0.01em]'>{title}</span>
          </div>
          <ChevronRight className={cn('h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-90' : '')} />
        </SidebarMenuButton>
        {(isOpen || isActive) && items.length > 0 && (
          <div className='mt-1 space-y-1 pl-8'>
            {items.map((item) => {
              if (!item.url) return null;
              const SubIconComponent = item.icon;
              return (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <SidebarMenuButton
                    asChild
                    size='lg'
                    tooltip={item.title}
                    isActive={pathname.startsWith(item.url)}
                    className={cn(
                      'font-sf-pro flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] leading-4 font-medium tracking-[-0.01em] transition-all duration-200',
                      pathname.startsWith(item.url) ? 'text-orange-400' : 'text-gray-400 hover:text-white'
                    )}>
                    <Link href={item.url} className='flex items-center gap-2'>
                      {SubIconComponent && <SubIconComponent className='h-4 w-4' />}
                      <span className='text-[13px] leading-4 font-medium tracking-[-0.01em]'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </div>
        )}
      </SidebarMenuItem>
    );
  }
);

SidebarMenuDropdown.displayName = 'SidebarMenuDropdown';

export const AppSidebar = React.memo(({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible='icon' className='border-r-0 bg-[#2a2a2a] text-white' {...props}>
      {/* Header with Kandara Logo */}
      <SidebarHeader className='flex items-center justify-start bg-[#2a2a2a] px-6 py-6'>
        <div className='flex items-center gap-2'>
          {state === 'collapsed' ? (
            <img src='/images/logo-mini.svg' alt='logo' className='h-7' />
          ) : (
            <img src='/images/logo.svg' alt='logo' className='h-9' />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-[#2a2a2a]'>
        <ScrollArea className='h-full'>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className='space-y-1 px-4'>
                {menuItems.map((item, index) =>
                  item.url === 'divider' ? (
                    <SidebarGroupLabel
                      key={`divider-${index}-${item.title}`}
                      className='font-sf-pro mt-6 mb-4 px-2 text-[11px] leading-3 font-semibold tracking-[0.08em] text-gray-500 uppercase'>
                      {item.title}
                    </SidebarGroupLabel>
                  ) : (
                    <SidebarMenuItemComponent key={`menu-${item.title}-${item.url}`} item={item} />
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      {/* Footer matching Figma design */}
      <SidebarFooter className='border-t border-gray-700 bg-[#2a2a2a] px-6 py-4'>
        <div className='font-sf-pro text-center text-gray-500'>
          <div className='text-[12px] leading-4 font-medium tracking-[-0.01em]'>Kandara Sales Dashboard</div>
          <div className='mt-1 text-[11px] leading-3 font-normal tracking-[-0.01em]'>© 2024 All Rights Reserved</div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';
