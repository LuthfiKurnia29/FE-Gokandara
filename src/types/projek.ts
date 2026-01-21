import { TipeData } from './tipe';

export interface ProjekData {
  id: number;
  name: string;
  alamat: string;
  jumlah_kavling: number;
  kamar_tidur?: number;
  kamar_mandi?: number;
  wifi?: boolean;
  logo?: string;
  logo_url?: string;
  tipe: Array<{
    id: number;
    name: string;
    luas_tanah: number;
    luas_bangunan: number;
    jumlah_unit: number;
    unit_terjual?: number;
    harga: number;
    jenis_pembayaran: Array<{
      id: number;
      harga: number;
    }>;
  }>;
  fasilitas: Array<{
    name: string;
    luas: number;
  }>;
  gambar?: Array<{
    id: number;
    gambar: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjekGambar {
  id: number;
  gambar: string;
}

// Laravel API response format
export interface ProjekResponse {
  message?: string;
  data: ProjekData[];
}

export interface ProjekApiResponse {
  message: string;
  data: ProjekData;
}

export interface CreateProjekData {
  name: string;
  alamat?: string;
  jumlah_kavling?: number;
  kamar_tidur?: number;
  kamar_mandi?: number;
  wifi?: boolean;
  tipe?: Array<{
    id?: number; // ID untuk data existing (update)
    name: string;
    luas_tanah: number;
    luas_bangunan: number;
    jumlah_unit: number;
    harga?: number; // Harga default (opsional)
    jenis_pembayaran: Array<{
      id: number; // ID skema pembayaran
      harga: number;
    }>;
  }>;
  fasilitas?: Array<{
    id?: number; // ID untuk data existing (update)
    name: string;
    luas: number;
  }>;
  gambars?: File[];
}

export interface UseProjekListParams {
  search?: string;
}
