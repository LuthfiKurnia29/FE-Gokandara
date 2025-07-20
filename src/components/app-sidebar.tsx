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

import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

    // Check if any child is active
    const isChildActive = items.some((item) => item.url && pathname.startsWith(item.url));

    // Parent is active when child is active, but dropdown visibility is controlled by isOpen
    const isActive = isChildActive;

    const IconComponent = icon;

    // Effect to open dropdown when child becomes active
    React.useEffect(() => {
      if (isChildActive) {
        setIsOpen(true);
      }
    }, []); // Run only once on mount

    const handleToggleDropdown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);

      // Only expand sidebar if it's collapsed
      if (state === 'collapsed') {
        toggleSidebar();
      }
    };

    return (
      <SidebarMenuItem>
        {/* Parent Menu Button */}
        <SidebarMenuButton
          tooltip={title}
          onClick={handleToggleDropdown}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-2 font-medium transition-all duration-200',
            isActive ? 'bg-[#FF9900] text-white shadow-md' : 'text-[#a3a3a3] hover:bg-[#23272f] hover:text-white',
            'min-h-[44px] w-full justify-between'
          )}>
          <div className='flex items-center gap-3'>
            {IconComponent && <IconComponent className={cn('h-4 w-4', isActive ? 'text-white' : 'text-[#a3a3a3]')} />}
            <span className='font-medium'>{title}</span>
          </div>
          {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </SidebarMenuButton>

        {/* Child Menu Items */}
        {isOpen && state === 'expanded' && items.length > 0 && (
          <ul className='mt-1 space-y-1 pl-8'>
            {items.map((item) => {
              if (!item.url) return null;
              const SubIconComponent = item.icon;
              const isItemActive = pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <Link
                    href={item.url}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-2 transition-colors',
                      isItemActive ? 'text-[#FF9900]' : 'text-[#a3a3a3] hover:text-[#FF9900]'
                    )}>
                    {SubIconComponent && (
                      <SubIconComponent className={cn('h-4 w-4', isItemActive ? 'text-[#FF9900]' : 'text-[#a3a3a3]')} />
                    )}
                    <span className='leading-tight tracking-tight'>{item.title}</span>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </ul>
        )}
      </SidebarMenuItem>
    );
  }
);

SidebarMenuDropdown.displayName = 'SidebarMenuDropdown';

export const AppSidebar = React.memo(({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible='icon' className='border-r-0 bg-[#2a2a2a] text-white transition-all duration-300' {...props}>
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
      <SidebarFooter
        className={cn(
          'border-t border-[#23272f] bg-[#2a2a2a] transition-all duration-300',
          state === 'collapsed' ? 'px-1 py-2' : 'px-4 py-6'
        )}>
        {state === 'collapsed' ? (
          <div className='flex flex-col items-center justify-center'>
            <span className='text-[8px] leading-tight font-medium text-[#a3a3a3]'>Kandara</span>
            <span className='text-[8px] leading-tight font-medium text-[#a3a3a3]'>Sales</span>
            <span className='text-[8px] leading-tight font-medium text-[#a3a3a3]'>Dashboard</span>
            <span className='mt-0.5 text-[8px] leading-tight font-medium text-[#a3a3a3]'>© 2024</span>
          </div>
        ) : (
          <div className='w-full text-center text-xs font-medium text-[#a3a3a3]'>
            Kandara Sales Dashboard
            <br />© 2024 All Rights Reserved
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';
