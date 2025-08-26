import { KonsumenData } from './konsumen';

// Follow-up monitoring interfaces
export interface FollowUpData {
  id: number;
  followup_date: string;
  followup_note: string;
  followup_result: string;
  konsumen_id: number;
  followup_last_day: string;
  prospek_id: number;
  sales_id: number;
  konsumen: KonsumenData;
  created_at: string;
  updated_at: string;
}

export interface FollowUpResponse {
  message: string;
  status: string;
  data: FollowUpData[];
  count: number;
}

// New konsumen interfaces
export interface NewKonsumenResponse {
  message: string;
  status: string;
  data: KonsumenData[];
  count: number;
}

// Konsumen by prospek interfaces
export interface KonsumenByProspekItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

export interface KonsumenByProspekData {
  chart_data: KonsumenByProspekItem[];
  labels: string[];
  values: number[];
}

export interface KonsumenByProspekResponse {
  message: string;
  status: string;
  data: KonsumenByProspekData;
}

// Sales overview interfaces
export interface SalesOverviewSummary {
  total_terjual: {
    value: number;
    unit: string;
    percentage_change: string;
  };
  total_dipesan: {
    value: number;
    unit: string;
    percentage_change: string;
  };
}

export interface SalesOverviewChart {
  months: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export interface SalesOverviewData {
  summary: SalesOverviewSummary;
  chart: SalesOverviewChart;
}

export interface SalesOverviewResponse {
  message: string;
  status: string;
  data: SalesOverviewData;
}

// Transaksi by properti interfaces
export interface TransaksiByPropertiItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

export interface TransaksiByPropertiData {
  chart_data: TransaksiByPropertiItem[];
  labels: string[];
  values: number[];
}

export interface TransaksiByPropertiResponse {
  message: string;
  status: string;
  data: TransaksiByPropertiData;
}

// Dashboard query parameters
export interface DashboardQueryParams {
  year?: number;
}

// Dashboard props interface for components
export interface DashboardProps {
  followUpToday?: FollowUpResponse;
  followUpTomorrow?: FollowUpResponse;
  newKonsumens?: NewKonsumenResponse;
  konsumenByProspek?: KonsumenByProspekResponse;
  salesOverview?: SalesOverviewResponse;
  transaksiByProperti?: TransaksiByPropertiResponse;
  isLoading: {
    followUpToday: boolean;
    followUpTomorrow: boolean;
    newKonsumens: boolean;
    konsumenByProspek: boolean;
    salesOverview: boolean;
    transaksiByProperti: boolean;
  };
}

// Component props with dashboard data
export interface ComponentWithDashboardProps {
  dashboardData?: DashboardProps;
}
