export interface ProjekData {
  id: number;
  name: string;
  address: string;
  gambars: ProjekGambar[];
}

export interface ProjekGambar {
  id: number;
  projek_id: number;
  gambar: string;
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
