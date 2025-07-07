'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
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
import { MenuItem, menuItems } from '@/stores/menu-item';

import { ScrollArea } from './ui/scroll-area';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  Command,
  Frame,
  GalleryVerticalEnd,
  House,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users
} from 'lucide-react';

// Sidebar Menu Item Component
const SidebarMenuItemComponent = React.memo(({ item }: { item: MenuItem }) => {
  const pathname = usePathname();
  // If item has children, render as dropdown
  if (item.children && item.children.length > 0) {
    return <SidebarMenuDropdown icon={item.icon} title={item.title} items={item.children} />;
  }

  // Otherwise render as regular menu item
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        size='lg'
        tooltip={item.title}
        isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}>
        <Link href={item.url}>
          <item.icon className='h-4 w-4' />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

SidebarMenuItemComponent.displayName = 'SidebarMenuItemComponent';

// Sidebar Menu Dropdown Component
const SidebarMenuDropdown = React.memo(
  ({ icon: Icon, title, items }: { icon: React.ElementType; title: string; items: MenuItem[] }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const [visibleItems, setVisibleItems] = React.useState<MenuItem[]>(items);

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          tooltip={title}
          onClick={toggleDropdown}
          className={cn('w-full justify-between', isOpen && 'bg-sidebar-accent text-sidebar-accent-foreground')}>
          <div className='flex items-center'>
            <Icon className='mr-2 h-4 w-4' />
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </SidebarMenuButton>

        {isOpen && visibleItems.length > 0 && (
          <div className='mt-1 space-y-1 pl-8'>
            {visibleItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size='lg' tooltip={item.title} isActive={pathname.startsWith(item.url)}>
                  <Link href={item.url} className='text-sm'>
                    <item.icon className='h-4 w-4' />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        )}
      </SidebarMenuItem>
    );
  }
);

SidebarMenuDropdown.displayName = 'SidebarMenuDropdown';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                {menuItems.map((item) =>
                  item.url === 'divider' ? (
                    <SidebarGroupLabel className='mt-4'>{item.title}</SidebarGroupLabel>
                  ) : (
                    <SidebarMenuItemComponent key={item.title} item={item} />
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
}
