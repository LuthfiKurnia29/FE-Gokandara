import type { CurrentUserResponse } from '@/types/auth';

import {
  BanknoteArrowDown,
  BedDouble,
  BookText,
  Building,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarRange,
  ChartArea,
  ChartNetwork,
  ChartPie,
  ChefHat,
  Coins,
  Database,
  FileChartLine,
  Home,
  LayoutDashboard,
  MessageSquareText,
  MonitorCheck,
  NotebookText,
  ServerCog,
  Settings,
  Shapes,
  ShoppingCart,
  Soup,
  SquaresUnite,
  Tag,
  Target,
  UserCheck,
  Users,
  Utensils,
  UtensilsCrossed
} from 'lucide-react';

/**
 * PERMISSION SYSTEM LOGIC:
 *
 * 1. Menu items WITHOUT 'code' property → Always accessible (no permission check)
 * 2. Menu items WITH 'code' property → Check user access permissions
 * 3. Parent menus with children → Show if user has permission OR has accessible children
 * 4. Dividers → Always shown, but cleaned up if no items follow
 *
 * Current menu permission codes:
 * - Dashboard: 'Dashboard'
 * - Properti: 'Property' (children: no codes = always accessible)
 * - Master Data: 'Data' (children: no codes = always accessible)
 * - Transaksi: 'Transaction'
 * - Analisa: 'Analyst'
 * - Konsumen: 'Consument'
 * - Pesan: 'Chat'
 * - Pengaturan: 'Setting'
 */

// Define a type for menu items with permission and optional children
type MenuItem = {
  title: string;
  url?: string;
  icon?: React.ElementType;
  code?: string;
  children?: MenuItem[];
};

// Menu items with hierarchical structure
const menuItems: MenuItem[] = [
  {
    title: 'Menu Utama',
    url: 'divider'
  },
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    code: 'Dashboard'
  },
  {
    title: 'Properti',
    icon: Home,
    url: '/properti',
    code: 'Property',
    children: [
      {
        title: 'Properti A1',
        url: '/properti/a1',
        icon: Building2
      },
      {
        title: 'Properti B2',
        url: '/properti/b2',
        icon: Building2
      },
      {
        title: 'Properti C3',
        url: '/properti/c3',
        icon: Building2
      }
    ]
  },
  {
    title: 'Transaksi',
    url: '/transaksi',
    icon: ShoppingCart,
    code: 'Transaction'
  },
  {
    title: 'Analisa',
    url: '/analisa',
    icon: ChartPie,
    code: 'Analyst'
  },
  {
    title: 'Others',
    url: 'divider'
  },
  {
    title: 'Master Data',
    icon: Database,
    url: '/master-data',
    code: 'Data',
    children: [
      {
        title: 'User',
        url: '/master-data/user',
        icon: UserCheck
      },
      {
        title: 'Prospek',
        url: '/master-data/prospek',
        icon: BookText
      },
      {
        title: 'Projek',
        url: '/master-data/projek',
        icon: FileChartLine
      },
      {
        title: 'Blok',
        url: '/master-data/blok',
        icon: Shapes
      },
      {
        title: 'Tipe',
        url: '/master-data/tipe',
        icon: Tag
      },
      {
        title: 'Unit',
        url: '/master-data/unit',
        icon: SquaresUnite
      },
      {
        title: 'Properti',
        url: '/master-data/properti',
        icon: Building
      }
    ]
  },
  {
    title: 'Konsumen',
    url: '/konsumen',
    icon: Users,
    code: 'Consument'
  },
  {
    title: 'Target & Bonus',
    url: '/target',
    icon: Target
  },
  {
    title: 'Pesan',
    url: '/pesan',
    icon: MessageSquareText,
    code: 'Chat'
  },
  {
    title: 'Kalender',
    url: '/kalender',
    icon: Calendar
    // code: 'Chat'
  },
  {
    title: 'Pengaturan',
    url: '/pengaturan',
    icon: Settings,
    code: 'Setting'
  }
];

// Permission checking utility functions
export const permissionUtils = {
  /**
   * Check if user has access to a specific menu code
   */
  hasAccess: (userData: CurrentUserResponse | null, menuCode: string): boolean => {
    if (!userData || !userData.access || !menuCode) {
      return false;
    }

    return userData.access.some((access) => access.menu.code === menuCode && access.is_allowed === 1);
  },

  /**
   * Filter menu items based on user permissions
   */
  filterMenuItemsByPermission: (userData: CurrentUserResponse | null): MenuItem[] => {
    if (!userData) {
      return [];
    }

    return menuItems
      .map((item) => {
        // If it's a divider, always include it
        if (item.url === 'divider') {
          return item;
        }

        // If no code, always allow access (no permission check needed)
        if (!item.code) {
          // If item has children, filter them based on their permissions
          if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter((child) => {
              // If child has no code, always allow
              if (!child.code) return true;
              return permissionUtils.hasAccess(userData, child.code);
            });

            return {
              ...item,
              children: filteredChildren
            };
          }
          return item;
        }

        // Check parent permission (has code)
        if (!permissionUtils.hasAccess(userData, item.code)) {
          return null;
        }

        // If item has children, filter them
        if (item.children && item.children.length > 0) {
          const filteredChildren = item.children.filter((child) => {
            // If child has no code, always allow
            if (!child.code) return true;
            return permissionUtils.hasAccess(userData, child.code);
          });

          return {
            ...item,
            children: filteredChildren
          };
        }

        // Include the item (parent has permission)
        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  },

  /**
   * Remove empty divider sections (dividers with no menu items after them)
   */
  cleanupDividers: (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.url === 'divider') {
        // Check if there are any non-divider items after this divider
        const hasItemsAfter = items.slice(i + 1).some((nextItem) => nextItem.url !== 'divider');

        // Only add divider if there are items after it and it's not the first item
        if (hasItemsAfter && result.length > 0) {
          result.push(item);
        }
      } else {
        result.push(item);
      }
    }

    return result;
  },

  /**
   * Get filtered and cleaned menu items for user
   */
  getPermittedMenuItems: (userData: CurrentUserResponse | null): MenuItem[] => {
    const filteredItems = permissionUtils.filterMenuItemsByPermission(userData);
    return permissionUtils.cleanupDividers(filteredItems);
  }
};

export { menuItems };
export type { MenuItem };
