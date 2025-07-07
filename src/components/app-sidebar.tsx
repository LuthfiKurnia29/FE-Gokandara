'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavUser } from '@/components/nav-user';
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

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        size='lg'
        tooltip={item.title}
        isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}>
        <Link href={item.url}>
          {IconComponent && <IconComponent className='h-4 w-4' />}
          <span>{item.title}</span>
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

    const IconComponent = icon;

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          tooltip={title}
          onClick={handleToggleDropdown}
          className={cn('w-full justify-between', isOpen && 'bg-sidebar-accent text-sidebar-accent-foreground')}>
          <div className='flex items-center'>
            {IconComponent && <IconComponent className='mr-2 h-4 w-4' />}
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </SidebarMenuButton>

        {isOpen && items.length > 0 && (
          <div className='mt-1 space-y-1 pl-8'>
            {items.map((item) => {
              // Only render if item.url is defined
              if (!item.url) return null;
              const SubIconComponent = item.icon;
              return (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <SidebarMenuButton asChild size='lg' tooltip={item.title} isActive={pathname.startsWith(item.url)}>
                    <Link href={item.url} className='text-sm'>
                      {SubIconComponent && <SubIconComponent className='h-4 w-4' />}
                      <span>{item.title}</span>
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
    <Sidebar collapsible='icon' className='text-white' {...props}>
      <SidebarHeader className='bg-[#2B2B2B] py-8'>
        {state === 'collapsed' ? (
          <img src='/images/logo-mini.svg' alt='logo' className='h-6' />
        ) : (
          <img src='/images/logo.svg' alt='logo' className='h-8' />
        )}
      </SidebarHeader>
      <SidebarContent className='bg-[#2B2B2B]'>
        <ScrollArea className='h-full'>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item, index) =>
                  item.url === 'divider' ? (
                    <SidebarGroupLabel key={`divider-${index}-${item.title}`} className='mt-4'>
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
      <SidebarFooter className='bg-[#2B2B2B]'>
        <NavUser user={{ name: 'John Doe', email: 'john.doe@example.com', avatar: 'https://github.com/shadcn.png' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';
