import {
  BanknoteArrowDown,
  BedDouble,
  BookText,
  Building,
  Building2,
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
  ShoppingCart,
  Soup,
  Tag,
  Users,
  Utensils,
  UtensilsCrossed
} from 'lucide-react';

// Define a type for menu items with permission and optional children
type MenuItem = {
  title: string;
  url?: string;
  icon?: React.ElementType;
  permission?: string;
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
    icon: LayoutDashboard
  },
  {
    title: 'Properti',
    icon: Home,
    url: '/properti',
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
    title: 'Type',
    url: '/type',
    icon: Tag
  },
  {
    title: 'Transaksi',
    url: '/transaksi',
    icon: ShoppingCart
  },
  {
    title: 'Analisa',
    url: '/analisa',
    icon: ChartPie
  },
  {
    title: 'Others',
    url: 'divider'
  },
  {
    title: 'Konsumen',
    url: '/konsumen',
    icon: Users
  },
  {
    title: 'Pesan',
    url: '/pesan',
    icon: MessageSquareText
  },
  {
    title: 'Pengaturan',
    url: '/pengaturan',
    icon: Settings
  }
];

export { menuItems };
export type { MenuItem };
