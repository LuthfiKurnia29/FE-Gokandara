export interface RiwayatPembayaranData {
  id: number;
  transaksi_id: number;
  tanggal: string; // ISO date string
  nominal: number;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRiwayatPembayaranData {
  transaksi_id: number;
  tanggal: string; // ISO date string
  nominal: number;
  keterangan?: string | null;
}

export interface UpdateRiwayatPembayaranData {
  tanggal: string; // ISO date string
  nominal: number;
  keterangan?: string | null;
}

export interface RiwayatPembayaranPaginationResponse {
  data: RiwayatPembayaranData[];
  current_page?: number;
  last_page?: number;
  total?: number;
}
