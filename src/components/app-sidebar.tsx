'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavUser } from '@/components/nav-user';
import { Badge } from '@/components/ui/badge';
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MessageSquareText, ShoppingCart } from 'lucide-react';

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
  // Badge logic (Transaksi dan Pesan sesuai Figma)
  const showBadge = item.title === 'Transaksi' || item.title === 'Pesan';
  const badgeCount = item.title === 'Transaksi' ? 7 : item.title === 'Pesan' ? 12 : 0;
  const badgeColor = item.title === 'Transaksi' ? 'bg-green-500' : 'bg-orange-500';

  const isActive = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        isActive={isActive}
        className={cn(
          'flex items-center gap-3 rounded-lg px-4 py-2 font-medium transition',
          isActive ? 'bg-[#FF9900] text-white shadow-md' : 'text-[#a3a3a3] hover:bg-[#23272f] hover:text-white',
          'min-h-[44px] w-full justify-start'
        )}>
        <Link href={item.url} className='flex w-full items-center gap-3'>
          {IconComponent && <IconComponent className={cn('h-4 w-4', isActive ? 'text-white' : 'text-[#a3a3a3]')} />}
          <span className={cn('leading-tight tracking-tight')}>{item.title}</span>
          {showBadge && (
            <span
              className={cn(
                'ml-auto flex items-center justify-center rounded-lg px-2 py-0.5 text-xs',
                badgeColor,
                'h-6 min-h-[24px] w-6 min-w-[24px] text-white'
              )}>
              {badgeCount}
            </span>
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
    const { state, toggleSidebar } = useSidebar();

    const handleToggleDropdown = () => {
      setIsOpen(!isOpen);
      if (state === 'collapsed') {
        toggleSidebar();
      }
    };

    const isActive = items.some((item) => pathname.startsWith(item.url));

    const IconComponent = icon;

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={title}
          onClick={handleToggleDropdown}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-2 font-medium transition',
            isOpen || isActive
              ? 'bg-[#FF9900] text-white shadow-md'
              : 'text-[#a3a3a3] hover:bg-[#23272f] hover:text-white',
            'min-h-[44px] w-full justify-between'
          )}>
          <div className='flex items-center gap-3'>
            {IconComponent && <IconComponent className='h-4 w-4' />}
            <span className={isOpen || isActive ? 'font-medium' : 'font-medium'}>{title}</span>
          </div>
          {isOpen || isActive ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </SidebarMenuButton>
        {(isOpen || isActive) && state === 'expanded' && items.length > 0 && (
          <div className='mt-1 space-y-1 pl-8'>
            {items.map((item) => {
              if (!item.url) return null;
              const SubIconComponent = item.icon;
              return (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname.startsWith(item.url)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-1',
                      pathname.startsWith(item.url) ? 'text-[#FF9900]' : 'font-medium text-[#a3a3a3]'
                    )}>
                    <Link href={item.url} className='flex items-center gap-2'>
                      {SubIconComponent && <SubIconComponent className='h-4 w-4' />}
                      <span className={cn('leading-tight tracking-tight')}>{item.title}</span>
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
      <SidebarHeader className='flex items-center justify-center bg-[#2a2a2a] py-8'>
        {state === 'collapsed' ? (
          <img src='/images/logo-mini.svg' alt='logo' className='h-7' />
        ) : (
          <img src='/images/logo.svg' alt='logo' className='h-9' />
        )}
      </SidebarHeader>
      <SidebarContent className='bg-[#2a2a2a]'>
        <ScrollArea className='h-full'>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item, index) =>
                  item.url === 'divider' ? (
                    <SidebarGroupLabel
                      key={`divider-${index}-${item.title}`}
                      className='mt-8 mb-2 px-4 text-xs tracking-widest text-[#a3a3a3] uppercase'
                      style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: '0.08em' }}>
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
      <SidebarFooter className='border-t border-[#23272f] bg-[#2a2a2a] px-4 py-6'>
        <div className='w-full text-center text-xs font-medium text-[#a3a3a3]'>
          Kandara Sales Dashboard
          <br />© 2024 All Rights Reserved
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';
