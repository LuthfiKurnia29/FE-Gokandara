export interface RealisasiData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

export interface RealisasiTarget {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

export interface RealisasiPenjualan {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

export interface RealisasiResponse {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
  target: RealisasiTarget;
  penjualan: RealisasiPenjualan;
}
