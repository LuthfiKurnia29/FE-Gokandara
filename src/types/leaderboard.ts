// Leaderboard data types

export interface LeaderboardItem {
  id: number;
  // Sales (employee) basic info
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null; // profile picture URL if available

  // Metrics
  leads: number; // total leads handled
  target_percentage: number; // 0..100
  units_sold: number; // Unit Terjual
  revenue: number; // total revenue (IDR)

  // Optional nested user for backend variations
  user?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  } | null;

  // Optional backend alternative fields (Laravel controller aliases)
  sales_name?: string;
  total_leads?: number;
  total_goal?: number;
  total_revenue?: number;
}

export interface LeaderboardResponse {
  current_page: number;
  data: LeaderboardItem[];
  first_page_url?: string;
  from?: number | null;
  last_page: number;
  last_page_url?: string;
  links?: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url?: string | null;
  path?: string;
  per_page?: number;
  prev_page_url?: string | null;
  to?: number | null;
  total?: number;
}

export interface UseLeaderboardListParams {
  page?: number;
  perPage?: number;
  search?: string;
  member_id?: number; // filter by sales/user id
}
