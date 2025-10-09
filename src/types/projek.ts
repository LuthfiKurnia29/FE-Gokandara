import { TipeData } from './tipe';

export interface ProjekData {
  id: number;
  name: string;
  address: string;
  alamat: string;
  logo?: string;
  logo_url?: string;
  gambars: ProjekGambar[];
  gambar: ProjekGambar[];
  tipe: TipeData[];
  fasilitas: any[];
  jumlah_kavling: number;
  kamar_tidur?: number;
  kamar_mandi?: number;
  wifi?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjekGambar {
  id: number;
  projek_id: number;
  gambar: string;
  gambar_url: string;
  created_at: string;
  updated_at: string;
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
    name: string;
    luas_tanah: number;
    luas_bangunan: number;
    jumlah_unit: number;
    jenis_pembayaran: Array<{
      id: number;
      harga: number;
    }>;
  }>;
  fasilitas?: Array<{
    name: string;
    luas: number;
  }>;
  gambars?: File[];
}

export interface UseProjekListParams {
  search?: string;
}
