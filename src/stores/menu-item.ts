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
  Shapes,
  ShoppingCart,
  Soup,
  SquaresUnite,
  Tag,
  UserCheck,
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
    title: 'Master Data',
    icon: Database,
    url: '/master-data',
    children: [
      {
        title: 'User',
        url: '/master-data/user',
        icon: UserCheck
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
      }
    ]
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
