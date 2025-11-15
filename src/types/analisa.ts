import { KonsumenData } from './konsumen';
import { PenjualanWithRelations } from './penjualan';
import { ProspekData } from './prospek';

// Query parameters for Analisa API calls
export interface AnalisaQueryParams {
  created_id?: number; // sales ID filter
  waktu?: 'today' | 'tomorrow'; // for followup filter
  filter?: 'harian' | 'mingguan' | 'bulanan'; // for statistics filters
  dateStart?: string; // start date filter (YYYY-MM-DD)
  dateEnd?: string; // end date filter (YYYY-MM-DD)
  prospek_id?: string; // prospek filter
  status?: string; // status filter
}

// New Konsumen Response
export interface NewKonsumenResponse {
  data: KonsumenData[];
}

// Followup Response
export interface FollowupResponse {
  count_data: number;
}

// Statistik Penjualan Response
export interface StatistikPenjualanItem {
  periode: string;
  grand_total: number;
  transaksis: PenjualanWithRelations[];
}

export interface StatistikPenjualanResponse {
  data: StatistikPenjualanItem[];
}

// Statistik Pemesanan Response
export interface StatistikPemesananItem {
  periode: string;
  total_pemesanan: number;
  transaksis: PenjualanWithRelations[];
}

export interface StatistikPemesananResponse {
  data: StatistikPemesananItem[];
}

// Realisasi Response
export interface RealisasiData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
  target: {
    hari_ini: number;
    minggu_ini: number;
    bulan_ini: number;
  };
  penjualan: {
    hari_ini: number;
    minggu_ini: number;
    bulan_ini: number;
  };
}

export interface RealisasiResponse {
  data: RealisasiData;
}

// Ringkasan Penjualan Response
export interface RingkasanPenjualanItem {
  prospek: ProspekData;
  grand_total: number;
  transaksis?: PenjualanWithRelations[];
}

export interface RingkasanPenjualanResponse {
  ringkasan: RingkasanPenjualanItem[];
  detail_penjualan: RingkasanPenjualanDetailItem[];
}

export interface RingkasanPenjualanDetailItem {
  projek: string;
  tipe: string;
  harga: number;
}

// Chart data interfaces for visualization
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: string;
  color?: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
  series?: Array<{
    name: string;
    data: number[];
  }>;
}

// Enhanced response interfaces with chart data
export interface StatistikPenjualanWithChart extends StatistikPenjualanResponse {
  chart_data: ChartData;
}

export interface StatistikPemesananWithChart extends StatistikPemesananResponse {
  chart_data: ChartData;
}

export interface RingkasanPenjualanWithChart extends RingkasanPenjualanResponse {
  chart_data: ChartData;
}

// Component props interfaces
export interface AnalisaProps {
  newKonsumen?: NewKonsumenResponse;
  followup?: FollowupResponse;
  statistikPenjualan?: StatistikPenjualanResponse;
  statistikPemesanan?: StatistikPemesananResponse;
  realisasi?: RealisasiResponse;
  ringkasanPenjualan?: RingkasanPenjualanResponse;
  isLoading: {
    newKonsumen: boolean;
    followup: boolean;
    statistikPenjualan: boolean;
    statistikPemesanan: boolean;
    realisasi: boolean;
    ringkasanPenjualan: boolean;
  };
}

// Hook parameters
export interface UseAnalisaParams {
  created_id?: number;
  waktu?: 'today' | 'tomorrow';
  filter?: 'harian' | 'mingguan' | 'bulanan';
  dateStart?: string; // start date filter (YYYY-MM-DD)
  dateEnd?: string; // end date filter (YYYY-MM-DD)
  prospek_id?: string; // prospek filter
  status?: string; // status filter
}
